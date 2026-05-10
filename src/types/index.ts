export interface Group {
  id: bigint;
  name: string;
  creator: string;
  members: string[];
  contributionAmount: bigint;
  tokenAddress: string;
  cycleDuration: bigint;
  startTime: bigint;
  currentCycle: bigint;
  totalCycles: bigint;
  status: number;
  pendingBalance: bigint;
}

export enum GroupStatus {
  Open = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}
