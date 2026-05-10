// CeloSave Contract Address (deployed on Celo Mainnet)
export const CELOSAVE_CONTRACT_ADDRESS = "0x5C5f0d2e9eAD467DeB36A2FcCd0F0867c60f4aA2" as const;

// Celo Mainnet Token Addresses
export const TOKENS = {
  cUSD: {
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const,
    symbol: "cUSD",
    name: "Celo Dollar",
    decimals: 18,
  },
  USDT: {
    address: "0x617f3112bf5397D0467D315cC709EF968D9ba546" as const,
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
  },
  USDC: {
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as const,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
} as const;

// Celo Network Config
export const CELO_CHAIN_ID = 42220;
export const CELO_RPC = "https://forno.celo.org";

// Cycle Durations
export const CYCLE_DURATIONS = [
  { label: "1 Week", value: 7 * 24 * 60 * 60, seconds: 604800 },
  { label: "2 Weeks", value: 14 * 24 * 60 * 60, seconds: 1209600 },
  { label: "1 Month", value: 30 * 24 * 60 * 60, seconds: 2592000 },
] as const;

// Group Status Mapping
export const GROUP_STATUS = {
  0: "Open",
  1: "Active",
  2: "Completed",
  3: "Cancelled",
} as const;
