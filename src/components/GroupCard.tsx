"use client";

import { Group, GroupStatus } from "@/types";
import { TOKENS } from "@/lib/constants";
import { formatUnits } from "viem";
import { Users, Clock, Coins, ArrowRight, CheckCircle2, Play } from "lucide-react";

interface GroupCardProps {
  group: Group;
  userAddress?: string;
  onJoin?: (groupId: bigint) => void;
  onContribute?: (groupId: bigint) => void;
  onStart?: (groupId: bigint) => void;
  onClick?: (groupId: bigint) => void;
}

const STATUS_CONFIG = {
  [GroupStatus.Open]: { label: "Open", className: "status-open" },
  [GroupStatus.Active]: { label: "Active", className: "status-active" },
  [GroupStatus.Completed]: { label: "Completed", className: "status-completed" },
  [GroupStatus.Cancelled]: { label: "Cancelled", className: "status-completed" },
};

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

export function GroupCard({
  group,
  userAddress,
  onJoin,
  onContribute,
  onStart,
  onClick,
}: GroupCardProps) {
  const status = group.status as GroupStatus;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[GroupStatus.Open];
  const tokenSymbol = getTokenSymbol(group.tokenAddress);
  const tokenDecimals = getTokenDecimals(group.tokenAddress);
  const contributionFormatted = formatUnits(group.contributionAmount, tokenDecimals);
  const poolSize = Number(contributionFormatted) * group.members.length;
  
  const isCreator = userAddress?.toLowerCase() === group.creator.toLowerCase();
  const isMember = group.members.some(
    (m) => m.toLowerCase() === userAddress?.toLowerCase()
  );

  const progressPercent =
    group.totalCycles > 0n
      ? Math.min(100, (Number(group.currentCycle - 1n) / Number(group.totalCycles)) * 100)
      : 0;

  return (
    <div
      className="card-glow bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 cursor-pointer hover:border-[#3a3a3a] transition-all fade-in"
      onClick={() => onClick?.(group.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base truncate">{group.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">by {shortAddress(group.creator)}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 shrink-0 ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins size={12} className="text-[#FCFF52]" />
          </div>
          <p className="text-white font-semibold text-sm">{contributionFormatted}</p>
          <p className="text-gray-500 text-xs">{tokenSymbol}/cycle</p>
        </div>
        <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={12} className="text-[#35D07F]" />
          </div>
          <p className="text-white font-semibold text-sm">{group.members.length}</p>
          <p className="text-gray-500 text-xs">members</p>
        </div>
        <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-purple-400" />
          </div>
          <p className="text-white font-semibold text-sm">{formatCycleDuration(group.cycleDuration)}</p>
          <p className="text-gray-500 text-xs">cycle</p>
        </div>
      </div>

      {/* Pool Size */}
      <div className="bg-gradient-to-r from-[#FCFF52]/5 to-[#35D07F]/5 border border-[#FCFF52]/10 rounded-xl p-2.5 mb-3">
        <p className="text-center text-sm">
          <span className="text-gray-400">Pool per cycle: </span>
          <span className="text-[#FCFF52] font-bold">{poolSize.toFixed(2)} {tokenSymbol}</span>
        </p>
      </div>

      {/* Progress (Active groups) */}
      {status === GroupStatus.Active && group.totalCycles > 0n && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Cycle {Number(group.currentCycle)} of {Number(group.totalCycles)}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FCFF52] to-[#35D07F] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {userAddress && (
        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          {status === GroupStatus.Open && !isMember && (
            <button
              onClick={() => onJoin?.(group.id)}
              className="flex-1 bg-[#35D07F] hover:bg-[#2db870] text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Users size={14} />
              Join Group
            </button>
          )}
          {status === GroupStatus.Open && isCreator && group.members.length >= 2 && (
            <button
              onClick={() => onStart?.(group.id)}
              className="flex-1 bg-[#FCFF52] hover:bg-[#e8eb3a] text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Play size={14} />
              Start Saving
            </button>
          )}
          {status === GroupStatus.Active && isMember && (
            <button
              onClick={() => onContribute?.(group.id)}
              className="flex-1 bg-[#FCFF52] hover:bg-[#e8eb3a] text-black font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Coins size={14} />
              Contribute
            </button>
          )}
          <button
            onClick={() => onClick?.(group.id)}
            className="bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white p-2.5 rounded-xl transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {status === GroupStatus.Completed && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
          <CheckCircle2 size={14} />
          <span>Savings cycle completed successfully</span>
        </div>
      )}
    </div>
  );
}
