"use client";

import { useState } from "react";
import { TOKENS, CYCLE_DURATIONS } from "@/lib/constants";
import { X, Info } from "lucide-react";

interface CreateGroupModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    contributionAmount: string;
    tokenAddress: string;
    cycleDuration: number;
  }) => void;
  isLoading?: boolean;
}

export function CreateGroupModal({ onClose, onSubmit, isLoading }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<string>(TOKENS.cUSD.address);
  const [cycleDuration, setCycleDuration] = useState<number>(CYCLE_DURATIONS[0].seconds);

  const selectedToken = Object.values(TOKENS).find((t) => t.address === token)!;
  const maxPool = amount ? parseFloat(amount) * 20 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    onSubmit({
      name,
      contributionAmount: amount,
      tokenAddress: token,
      cycleDuration,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <div>
            <h2 className="font-bold text-white text-lg">Create Savings Group</h2>
            <p className="text-xs text-gray-500 mt-0.5">Start a new rotating savings circle</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Friends Samiti, Office Squad..."
              maxLength={50}
              required
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#FCFF52]/50 transition-colors"
            />
          </div>

          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Savings Token
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TOKENS).map((t) => (
                <button
                  key={t.address}
                  type="button"
                  onClick={() => setToken(t.address)}
                  className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                    token === t.address
                      ? "border-[#FCFF52] bg-[#FCFF52]/10 text-[#FCFF52]"
                      : "border-[#2a2a2a] bg-[#0a0a0a] text-gray-400 hover:border-[#3a3a3a]"
                  }`}
                >
                  {t.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Contribution Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contribution per Cycle
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#FCFF52]/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FCFF52] text-sm font-medium">
                {selectedToken.symbol}
              </span>
            </div>
            {amount && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <Info size={10} />
                Each member receives up to {maxPool.toFixed(2)} {selectedToken.symbol} when it&apos;s their turn
              </p>
            )}
          </div>

          {/* Cycle Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cycle Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CYCLE_DURATIONS.map((cd) => (
                <button
                  key={cd.seconds}
                  type="button"
                  onClick={() => setCycleDuration(cd.seconds)}
                  className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                    cycleDuration === cd.seconds
                      ? "border-[#35D07F] bg-[#35D07F]/10 text-[#35D07F]"
                      : "border-[#2a2a2a] bg-[#0a0a0a] text-gray-400 hover:border-[#3a3a3a]"
                  }`}
                >
                  {cd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-white font-medium">How it works:</span> You create the group and invite 2-20 members.
              Each cycle, everyone contributes and one member receives the full pool.
              The rotation continues until everyone has received once.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !name || !amount}
            className="w-full bg-[#FCFF52] hover:bg-[#e8eb3a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl text-sm transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Group...
              </span>
            ) : (
              "Create Savings Group"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
