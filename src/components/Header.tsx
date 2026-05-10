"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useEffect, useState } from "react";
import { LogOut, Wallet } from "lucide-react";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && (window as any).ethereum?.isMiniPay) {
      setIsMiniPay(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [connect]);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FCFF52] to-[#35D07F] flex items-center justify-center shadow-lg">
            <span className="text-black font-bold text-sm">CS</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">CeloSave</h1>
            <p className="text-[10px] text-gray-500 leading-none">Group Savings on Celo</p>
          </div>
        </div>

        {mounted && (
          <>
            {isMiniPay && (
              <div className="flex items-center gap-1.5 bg-[#FCFF52]/10 border border-[#FCFF52]/20 rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FCFF52]"></div>
                <span className="text-[#FCFF52] text-xs font-medium">MiniPay</span>
              </div>
            )}

            {!isMiniPay && !isConnected && (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 bg-[#FCFF52] hover:bg-[#e8eb3a] text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Wallet size={14} />
                Connect
              </button>
            )}

            {!isMiniPay && isConnected && address && (
              <div className="flex items-center gap-2">
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#35D07F]"></div>
                  <span className="text-sm text-white font-medium">{shortAddress(address)}</span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="p-2 bg-[#141414] border border-[#2a2a2a] rounded-xl text-gray-500 hover:text-white transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
