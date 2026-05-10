"use client";

import { Group, GroupStatus } from "@/types";
import { TOKENS } from "@/lib/constants";
import { formatUnits } from "viem";
import {
  ArrowLeft,
  Users,
  Clock,
  Coins,
  CheckCircle2,
  Circle,
  Play,
  Zap,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

interface GroupDetailProps {
  group: Group;
  userAddress?: string;
  memberPaymentStatus?: Record<string, boolean>;
  onBack: () => void;
  onJoin?: () => void;
  onContribute?: () => void;
  onStart?: () => void;
  isLoading?: boolean;
}

function getTokenSymbol(address: string): string {
  const token = Object.values(TOKENS).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return token?.symbol || "TOKEN";
}

function getTokenDecimals(address: string): number {
  const token = Object.values(TOKENS).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return token?.decimals || 18;
}

function formatCycleDuration(seconds: bigint): string {
  const s = Number(seconds);
  if (s === 604800) return "Weekly";
  if (s === 1209600) return "Bi-weekly";
  if (s === 2592000) return "Monthly";
  const days = Math.floor(s / 86400);
  return `${days} days`;
}

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const STATUS_LABELS = {
  [GroupStatus.Open]: "Open for Members",
  [GroupStatus.Active]: "Active - Saving",
  [GroupStatus.Completed]: "Completed",
  [GroupStatus.Cancelled]: "Cancelled",
};

export function GroupDetail({
  group,
  userAddress,
  memberPaymentStatus,
  onBack,
  onJoin,
  onContribute,
  onStart,
  isLoading,
}: GroupDetailProps) {
  const [copied, setCopied] = useState(false);
  const status = group.status as GroupStatus;
  const tokenSymbol = getTokenSymbol(group.tokenAddress);
  const tokenDecimals = getTokenDecimals(group.tokenAddress);
  const contributionFormatted = formatUnits(group.contributionAmount, tokenDecimals);
  const poolSize = Number(contributionFormatted) * group.members.length;

  const isCreator = userAddress?.toLowerCase() === group.creator.toLowerCase();
  const isMember = group.members.some(
    (m) => m.toLowerCase() === userAddress?.toLowerCase()
  );

  const paidCount = memberPaymentStatus
    ? Object.values(memberPaymentStatus).filter(Boolean).length
    : 0;

  const progressPercent =
    group.totalCycles > 0n
      ? Math.min(100, ((Number(group.currentCycle) - 1) / Number(group.totalCycles)) * 100)
      : 0;

  const copyGroupId = () => {
    navigator.clipboard.writeText(group.id.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Groups
      </button>

      {/* Group Header */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{group.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={copyGroupId}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Group #{group.id.toString()}
                <Copy size={10} />
              </button>
              {copied && <span className="text-xs text-[#35D07F]">Copied!</span>}
            </div>
          </div>
          <div>
            {status === GroupStatus.Open && (
              <span className="status-open text-xs px-2 py-1 rounded-full">Open</span>
            )}
            {status === GroupStatus.Active && (
              <span className="status-active text-xs px-2 py-1 rounded-full">Active</span>
            )}
            {status === GroupStatus.Completed && (
              <span className="status-completed text-xs px-2 py-1 rounded-full">Done</span>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0a0a0a] rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Contribution/cycle</p>
            <p className="text-white font-bold">
              {contributionFormatted}{" "}
              <span className="text-[#FCFF52]">{tokenSymbol}</span>
            </p>
          </div>
          <div className="bg-[#0a0a0a] rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Pool size/cycle</p>
            <p className="text-white font-bold">
              {poolSize.toFixed(2)}{" "}
              <span className="text-[#35D07F]">{tokenSymbol}</span>
            </p>
          </div>
          <div className="bg-[#0a0a0a] rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Cycle duration</p>
            <p className="text-white font-bold">{formatCycleDuration(group.cycleDuration)}</p>
          </div>
          <div className="bg-[#0a0a0a] rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Members</p>
            <p className="text-white font-bold">
              {group.members.length}{" "}
              <span className="text-gray-500 text-xs">/ 20 max</span>
            </p>
          </div>
        </div>

        {/* Progress */}
        {status === GroupStatus.Active && group.totalCycles > 0n && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Cycle Progress</span>
              <span>
                {Number(group.currentCycle)}/{Number(group.totalCycles)} cycles
              </span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FCFF52] to-[#35D07F] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Active cycle payment status */}
        {status === GroupStatus.Active && memberPaymentStatus && (
          <div className="bg-[#0a0a0a] rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 mb-1">
              Current Cycle Payments:{" "}
              <span className="text-[#FCFF52] font-medium">
                {paidCount}/{group.members.length} paid
              </span>
            </p>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FCFF52] rounded-full"
                style={{
                  width: `${group.members.length > 0 ? (paidCount / group.members.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Creator info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Created by</span>
          <a
            href={`https://celoscan.io/address/${group.creator}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            {shortAddress(group.creator)}
            <ExternalLink size={10} />
          </a>
          {isCreator && (
            <span className="bg-[#FCFF52]/10 text-[#FCFF52] text-xs px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      {userAddress && (
        <div>
          {status === GroupStatus.Open && !isMember && (
            <button
              onClick={onJoin}
              disabled={isLoading}
              className="w-full bg-[#35D07F] hover:bg-[#2db870] disabled:opacity-50 text-black font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Users size={16} />
              {isLoading ? "Joining..." : "Join This Group"}
            </button>
          )}
          {status === GroupStatus.Open && isCreator && group.members.length >= 2 && (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="w-full bg-[#FCFF52] hover:bg-[#e8eb3a] disabled:opacity-50 text-black font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} />
              {isLoading ? "Starting..." : "Start Savings Group"}
            </button>
          )}
          {status === GroupStatus.Open && isCreator && group.members.length < 2 && (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 text-center">
              <p className="text-sm text-gray-400">
                Share Group #{group.id.toString()} with friends to join. Need at least 2 members to start.
              </p>
              <button
                onClick={copyGroupId}
                className="mt-3 text-[#FCFF52] text-sm font-medium flex items-center gap-1.5 mx-auto"
              >
                <Copy size={14} />
                Copy Group ID to Share
              </button>
            </div>
          )}
          {status === GroupStatus.Active && isMember && (
            <button
              onClick={onContribute}
              disabled={isLoading}
              className="w-full bg-[#FCFF52] hover:bg-[#e8eb3a] disabled:opacity-50 text-black font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              {isLoading
                ? "Processing..."
                : `Contribute ${contributionFormatted} ${tokenSymbol}`}
            </button>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Users size={16} className="text-[#35D07F]" />
          Members ({group.members.length})
        </h3>
        <div className="space-y-2">
          {group.members.map((member, idx) => {
            const isYou = member.toLowerCase() === userAddress?.toLowerCase();
            const hasPaid = memberPaymentStatus?.[member.toLowerCase()];
            const isCurrentRecipient =
              status === GroupStatus.Active &&
              idx + 1 === Number(group.currentCycle);

            return (
              <div
                key={member}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isCurrentRecipient
                    ? "bg-[#FCFF52]/5 border border-[#FCFF52]/20"
                    : "bg-[#0a0a0a]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrentRecipient
                        ? "bg-[#FCFF52] text-black"
                        : "bg-[#2a2a2a] text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <a
                      href={`https://celoscan.io/address/${member}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {shortAddress(member)}
                      <ExternalLink size={9} className="shrink-0" />
                    </a>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isYou && (
                        <span className="text-[10px] text-[#FCFF52] font-medium">You</span>
                      )}
                      {member.toLowerCase() === group.creator.toLowerCase() && (
                        <span className="text-[10px] text-purple-400 font-medium">Creator</span>
                      )}
                      {isCurrentRecipient && status === GroupStatus.Active && (
                        <span className="text-[10px] text-[#FCFF52]">Next payout</span>
                      )}
                    </div>
                  </div>
                </div>

                {status === GroupStatus.Active && (
                  <div className="shrink-0">
                    {hasPaid ? (
                      <CheckCircle2 size={16} className="text-[#35D07F]" />
                    ) : (
                      <Circle size={16} className="text-gray-600" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
