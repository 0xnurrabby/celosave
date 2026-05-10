# CeloSave - Group Savings on Celo

> Decentralized rotating savings groups (Samiti / Esusu / Tontine) built on Celo — optimized for MiniPay

[![Built on Celo](https://img.shields.io/badge/Built%20on-Celo-FCFF52?style=flat&logo=ethereum)](https://celo.org)
[![MiniPay Compatible](https://img.shields.io/badge/MiniPay-Compatible-35D07F?style=flat)](https://www.opera.com/products/minipay)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is CeloSave?

CeloSave brings the traditional **rotating savings group** — known as *Samiti* in Bangladesh, *Esusu* in West Africa, *Tontine* in Francophone Africa, and *Chit Fund* in India — onto the Celo blockchain.

**How it works:**
1. A group creator sets up a savings circle (2–20 members)
2. Each cycle (weekly/bi-weekly/monthly), every member contributes the agreed amount
3. One member receives the entire pool each cycle
4. The rotation continues until every member has received once

All of this is **trustless, transparent, and automatic** — powered by a smart contract on Celo.

---

## Features

- **MiniPay-first** — auto-connects with MiniPay wallet, no extra clicks
- **Multi-token support** — use cUSD, USDT, or USDC
- **Flexible cycles** — weekly, bi-weekly, or monthly
- **Auto-payout** — when all members contribute, the pool distributes instantly
- **On-chain transparency** — all transactions visible on Celoscan
- **2–20 members** per group
- **Mobile-optimized UI** — built for the Global South user

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20, Hardhat |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Web3 | viem, wagmi v2, MiniPay hook |
| Network | Celo Mainnet (Chain ID: 42220) |
| Deployment | Vercel |

---

## Smart Contract

**CeloSave.sol** — deployed on Celo Mainnet

```
Contract: CeloSave
Address: 0x5C5f0d2e9eAD467DeB36A2FcCd0F0867c60f4aA2
Network: Celo Mainnet (42220)
```

Supported tokens:
- **cUSD**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **USDT**: `0x617f3112bf5397D0467D315cC709EF968D9ba546`
- **USDC**: `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install

```bash
git clone https://github.com/yourusername/celosave
cd celosave
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Fill in your PRIVATE_KEY for contract deployment
```

### Run Locally

```bash
npm run dev
```

### Deploy Contract

```bash
# Deploy to Celo Mainnet
npx hardhat run contracts/scripts/deploy.ts --network celo

# Deploy to Alfajores Testnet
npx hardhat run contracts/scripts/deploy.ts --network alfajores

# Verify contract
npx hardhat verify --network celo <CONTRACT_ADDRESS>
```

### Build for Production

```bash
npm run build
```

---

## MiniPay Integration

The app auto-detects MiniPay and:
1. **Auto-connects** wallet on load
2. **Hides** the connect button (MiniPay manages accounts)
3. **Uses `feeCurrency`** parameter for gas-free transactions in stablecoins
4. **Shows MiniPay badge** in the header

```tsx
// MiniPay detection hook
useEffect(() => {
  if (window.ethereum?.isMiniPay) {
    connect({ connector: injected({ target: "metaMask" }) });
  }
}, []);
```

---

## Project Structure

```
celosave/
├── contracts/
│   ├── contracts/
│   │   └── CeloSave.sol       # Main smart contract
│   └── scripts/
│       └── deploy.ts          # Deployment script
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Main app page
│   │   └── providers.tsx      # wagmi + query providers
│   ├── components/
│   │   ├── Header.tsx         # Header with wallet connection
│   │   ├── GroupCard.tsx      # Savings group card component
│   │   ├── GroupDetail.tsx    # Full group detail view
│   │   └── CreateGroupModal.tsx # Group creation form
│   ├── lib/
│   │   ├── abi.ts             # Contract ABIs
│   │   ├── constants.ts       # Addresses, token config
│   │   └── wagmi.ts           # Wagmi config
│   └── types/
│       └── index.ts           # TypeScript types
├── hardhat.config.ts
└── next.config.ts
```

---

## Why This Wins

| Factor | CeloSave Advantage |
|--------|-------------------|
| **Real Use Case** | Rotating savings is practiced by billions globally |
| **MiniPay Native** | Auto-connect, feeCurrency support, mobile-first |
| **Financial Inclusion** | Serves unbanked users in Global South |
| **Trustless** | No middleman — smart contract enforces rules |
| **Multi-asset** | cUSD/USDT/USDC — users pick their comfort currency |
| **AI Prize Eligible** | Extensible for AI agent payout scheduling |

---

## Roadmap

- [ ] Push notifications for contribution reminders
- [ ] AI agent for automatic cycle triggering (8004 compatible)
- [ ] Group invite via phone number (MiniPay phone mapping)
- [ ] Reputation system for reliable savers
- [ ] Multiple rounds support (recurring groups)

---

## License

MIT — see [LICENSE](LICENSE)

---

Built with for [Celo Proof of Ship](https://celoplatform.notion.site/Proof-of-Ship-17cd5cb803de8060ba10d22a72b549f8) Season 2
