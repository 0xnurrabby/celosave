"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { celo } from "wagmi/chains";
import { Header } from "@/components/Header";
import { GroupCard } from "@/components/GroupCard";
import { GroupDetail } from "@/components/GroupDetail";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { CELOSAVE_CONTRACT_ADDRESS, TOKENS } from "@/lib/constants";
import { CELOSAVE_ABI, ERC20_ABI } from "@/lib/abi";
import { Group } from "@/types";
import { Plus, Search, TrendingUp, Users, Coins, RefreshCw } from "lucide-react";

type View = "home" | "detail";

function StatsBar({ groups }: { groups: Group[] }) {
  const totalMembers = groups.reduce((acc, g) => acc + g.members.length, 0);
  const activeGroups = groups.filter((g) => g.status === 1).length;
  const totalGroups = groups.length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-[#FCFF52]">{totalGroups}</p>
        <p className="text-xs text-gray-500 mt-0.5">Total Groups</p>
      </div>
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-[#35D07F]">{activeGroups}</p>
        <p className="text-xs text-gray-500 mt-0.5">Active Now</p>
      </div>
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-white">{totalMembers}</p>
        <p className="text-xs text-gray-500 mt-0.5">Savers</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [view, setView] = useState<View>("home");
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<bigint | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [memberPaymentStatus, setMemberPaymentStatus] = useState<Record<string, boolean>>({});
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const selectedGroup = allGroups.find((g) => g.id === selectedGroupId) || null;

  // Load all groups from contract
  const loadGroups = useCallback(async () => {
    if (!publicClient) return;
    try {
      setIsRefreshing(true);
      const groups = (await publicClient.readContract({
        address: CELOSAVE_CONTRACT_ADDRESS,
        abi: CELOSAVE_ABI,
        functionName: "getAllGroups",
      })) as Group[];
      setAllGroups([...groups].reverse()); // newest first
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [publicClient]);

  // Load payment status for current active group
  const loadPaymentStatus = useCallback(
    async (group: Group) => {
      if (!publicClient || group.status !== 1) return;
      const statusMap: Record<string, boolean> = {};
      for (const member of group.members) {
        try {
          const paid = (await publicClient.readContract({
            address: CELOSAVE_CONTRACT_ADDRESS,
            abi: CELOSAVE_ABI,
            functionName: "hasMemberPaid",
            args: [group.id, member as `0x${string}`],
          })) as boolean;
          statusMap[member.toLowerCase()] = paid;
        } catch {
          statusMap[member.toLowerCase()] = false;
        }
      }
      setMemberPaymentStatus(statusMap);
    },
    [publicClient]
  );

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroup) {
      loadPaymentStatus(selectedGroup);
    }
  }, [selectedGroup, loadPaymentStatus]);

  // Clear notifications after 5s
  useEffect(() => {
    if (txSuccess || txError) {
      const timer = setTimeout(() => {
        setTxSuccess(null);
        setTxError(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [txSuccess, txError]);

  const showToast = (type: "success" | "error", msg: string) => {
    if (type === "success") setTxSuccess(msg);
    else setTxError(msg);
  };

  // Send transaction via MiniPay or regular wallet
  const sendTx = async (
    contractAddress: `0x${string}`,
    abi: any,
    functionName: string,
    args: any[],
    feeCurrencyToken?: `0x${string}`
  ) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    const data = encodeFunctionData({ abi, functionName, args });
    
    const txParams: any = {
      account: address,
      to: contractAddress,
      data,
      chain: celo,
    };

    // MiniPay uses feeCurrency for gas payment
    if (feeCurrencyToken) {
      txParams.feeCurrency = feeCurrencyToken;
    }

    const hash = await walletClient.sendTransaction(txParams);
    if (!publicClient) throw new Error("No public client");
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  // Approve token spending
  const approveToken = async (tokenAddress: `0x${string}`, amount: bigint) => {
    await sendTx(
      tokenAddress,
      ERC20_ABI,
      "approve",
      [CELOSAVE_CONTRACT_ADDRESS, amount],
      tokenAddress // Use token itself as fee currency (MiniPay supports this)
    );
  };

  // Create Group
  const handleCreateGroup = async (data: {
    name: string;
    contributionAmount: string;
    tokenAddress: string;
    cycleDuration: number;
  }) => {
    if (!address || !walletClient) return showToast("error", "Please connect wallet");
    
    setIsLoading(true);
    setTxError(null);
    try {
      const tokenInfo = Object.values(TOKENS).find(
        (t) => t.address.toLowerCase() === data.tokenAddress.toLowerCase()
      );
      const decimals = tokenInfo?.decimals || 18;
      const amountWei = parseUnits(data.contributionAmount, decimals);

      await sendTx(
        CELOSAVE_CONTRACT_ADDRESS,
        CELOSAVE_ABI,
        "createGroup",
        [data.name, amountWei, data.tokenAddress as `0x${string}`, BigInt(data.cycleDuration)],
        data.tokenAddress as `0x${string}`
      );

      showToast("success", "Savings group created! Share the Group ID with friends.");
      setShowCreate(false);
      await loadGroups();
    } catch (err: any) {
      showToast("error", err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Join Group
  const handleJoin = async (groupId: bigint) => {
    if (!address || !walletClient) return showToast("error", "Please connect wallet");
    setIsLoading(true);
    setTxError(null);
    try {
      const group = allGroups.find((g) => g.id === groupId);
      await sendTx(
        CELOSAVE_CONTRACT_ADDRESS,
        CELOSAVE_ABI,
        "joinGroup",
        [groupId],
        group?.tokenAddress as `0x${string}`
      );
      showToast("success", "You joined the savings group!");
      await loadGroups();
    } catch (err: any) {
      showToast("error", err?.shortMessage || err?.message || "Failed to join");
    } finally {
      setIsLoading(false);
    }
  };

  // Start Group
  const handleStart = async (groupId: bigint) => {
    if (!address || !walletClient) return showToast("error", "Please connect wallet");
    setIsLoading(true);
    try {
      const group = allGroups.find((g) => g.id === groupId);
      await sendTx(
        CELOSAVE_CONTRACT_ADDRESS,
        CELOSAVE_ABI,
        "startGroup",
        [groupId],
        group?.tokenAddress as `0x${string}`
      );
      showToast("success", "Savings group started! Members can now contribute.");
      await loadGroups();
    } catch (err: any) {
      showToast("error", err?.shortMessage || err?.message || "Failed to start");
    } finally {
      setIsLoading(false);
    }
  };

  // Contribute
  const handleContribute = async (groupId: bigint) => {
    if (!address || !walletClient) return showToast("error", "Please connect wallet");
    setIsLoading(true);
    try {
      const group = allGroups.find((g) => g.id === groupId);
      if (!group) throw new Error("Group not found");

      // First approve token
      showToast("success", "Approving token spend...");
      await approveToken(
        group.tokenAddress as `0x${string}`,
        group.contributionAmount
      );

      // Then contribute
      await sendTx(
        CELOSAVE_CONTRACT_ADDRESS,
        CELOSAVE_ABI,
        "contribute",
        [groupId],
        group.tokenAddress as `0x${string}`
      );

      showToast("success", "Contribution sent! All members paid = auto payout triggered.");
      await loadGroups();
      if (selectedGroup) await loadPaymentStatus(selectedGroup);
    } catch (err: any) {
      showToast("error", err?.shortMessage || err?.message || "Contribution failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter groups
  const filteredGroups = allGroups.filter((group) => {
    const matchesSearch = group.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "my" && address) {
      const isMember = group.members.some(
        (m) => m.toLowerCase() === address.toLowerCase()
      );
      return matchesSearch && isMember;
    }
    return matchesSearch;
  });

  const myGroups = address
    ? allGroups.filter((g) =>
        g.members.some((m) => m.toLowerCase() === address.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Notifications */}
      {(txSuccess || txError) && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4">
          <div
            className={`rounded-xl p-4 text-sm font-medium shadow-xl border ${
              txSuccess
                ? "bg-[#35D07F]/15 border-[#35D07F]/30 text-[#35D07F]"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}
          >
            {txSuccess || txError}
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-5">
        {view === "home" ? (
          <>
            {/* Hero Banner */}
            {!address && (
              <div className="bg-gradient-to-br from-[#FCFF52]/10 via-[#35D07F]/5 to-transparent border border-[#FCFF52]/10 rounded-2xl p-6 mb-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FCFF52] to-[#35D07F] flex items-center justify-center mx-auto mb-4">
                  <Coins size={28} className="text-black" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Save Together, Win Together
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  CeloSave brings the traditional <span className="text-white">Samiti / Esusu / Tontine</span> savings
                  system on-chain. Create rotating savings groups with friends using cUSD,
                  USDT, or USDC — fully transparent and trustless.
                </p>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  {[
                    { icon: <Users size={16} />, label: "2-20 Members", color: "text-[#35D07F]" },
                    { icon: <Coins size={16} />, label: "cUSD/USDT/USDC", color: "text-[#FCFF52]" },
                    { icon: <TrendingUp size={16} />, label: "Auto Payout", color: "text-purple-400" },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#141414] rounded-xl p-3">
                      <div className={`${item.color} flex justify-center mb-1`}>{item.icon}</div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Connect your wallet to get started
                </p>
              </div>
            )}

            {/* Stats */}
            {allGroups.length > 0 && <StatsBar groups={allGroups} />}

            {/* Tabs + Search */}
            {address && (
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === "all"
                      ? "bg-[#FCFF52] text-black"
                      : "bg-[#141414] text-gray-400 hover:text-white border border-[#2a2a2a]"
                  }`}
                >
                  All Groups
                </button>
                <button
                  onClick={() => setActiveTab("my")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === "my"
                      ? "bg-[#FCFF52] text-black"
                      : "bg-[#141414] text-gray-400 hover:text-white border border-[#2a2a2a]"
                  }`}
                >
                  My Groups
                  {myGroups.length > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === "my"
                          ? "bg-black/20 text-black"
                          : "bg-[#FCFF52]/10 text-[#FCFF52]"
                      }`}
                    >
                      {myGroups.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FCFF52]/40 transition-colors"
                />
              </div>
              <button
                onClick={loadGroups}
                disabled={isRefreshing}
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-2.5 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Groups List */}
            {filteredGroups.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-gray-600" />
                </div>
                <h3 className="text-gray-400 font-medium mb-1">
                  {activeTab === "my" ? "No groups yet" : "No groups found"}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {activeTab === "my"
                    ? "Create or join a savings group to get started"
                    : "Be the first to create a savings group"}
                </p>
                {address && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="bg-[#FCFF52] text-black font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#e8eb3a] transition-colors"
                  >
                    Create First Group
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id.toString()}
                    group={group}
                    userAddress={address}
                    onJoin={handleJoin}
                    onContribute={handleContribute}
                    onStart={handleStart}
                    onClick={(id) => {
                      setSelectedGroupId(id);
                      setView("detail");
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          selectedGroup && (
            <GroupDetail
              group={selectedGroup}
              userAddress={address}
              memberPaymentStatus={memberPaymentStatus}
              onBack={() => {
                setView("home");
                setSelectedGroupId(null);
              }}
              onJoin={() => handleJoin(selectedGroup.id)}
              onContribute={() => handleContribute(selectedGroup.id)}
              onStart={() => handleStart(selectedGroup.id)}
              isLoading={isLoading}
            />
          )
        )}
      </main>

      {/* FAB - Create Group */}
      {view === "home" && address && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-4 bg-[#FCFF52] hover:bg-[#e8eb3a] text-black font-bold px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          New Group
        </button>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateGroup}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
