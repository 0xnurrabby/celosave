<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10,17,24&height=180&section=header&text=CeloSave&fontSize=50&fontColor=000000&fontAlignY=38&desc=Rotating+savings+groups+on+Celo+for+MiniPay+and+stablecoin+users&descAlignY=58&descSize=14&animation=fadeIn" width="100%"/>

<div align="center">

![Chain](https://img.shields.io/badge/Chain-Celo-FDE68A?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)
![Wallet](https://img.shields.io/badge/Wallet-MiniPay+Ready-BBF7D0?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)
![Contracts](https://img.shields.io/badge/Contracts-Hardhat-BFDBFE?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-FBCFE8?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)

</div>

<div align="center">
<i>A rotating savings group app inspired by Samiti, Esusu, Tontine, and Chit Fund workflows, rebuilt as a Celo smart contract flow.</i>
</div>

---

## Features

| Feature | What it does |
| --- | --- |
| Savings groups | Create a group, add members, collect each cycle, and rotate payouts. |
| Stablecoins | Supports cUSD, USDT, and USDC on Celo mainnet. |
| MiniPay-first UX | Wallet connection is designed for MiniPay-style mobile use. |
| Onchain transparency | Group state and payouts are read from the deployed Celo contract. |
| Hardhat workflow | Includes deploy and verify config for Celo and Alfajores. |

---

## Download and Run

```powershell
git clone https://github.com/0xnurrabby/celosave.git
cd celosave
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Use a Celo wallet or MiniPay-compatible browser for the best test.

---

## Setup

Frontend reads the deployed contract address from `src/lib/constants.ts`.

For deploy and verification work, set:

```env
PRIVATE_KEY=0x_your_deployer_private_key
CELOSCAN_API_KEY=your_celoscan_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=optional_project_id
```

Deploy examples:

```bash
npx hardhat run contracts/scripts/deploy.ts --network alfajores
npx hardhat run contracts/scripts/deploy.ts --network celo
```

---

## Project Structure

```text
celosave/
  contracts/contracts/   -> CeloSave.sol
  contracts/scripts/     -> deploy script
  src/app/               -> Next.js pages and providers
  src/components/        -> group cards, detail view, create modal
  src/lib/               -> ABI, constants, wagmi config
  src/types/             -> app types
```

---

## Notes

- If you redeploy, update `CELOSAVE_CONTRACT_ADDRESS` in `src/lib/constants.ts`.
- Do not commit a real deployer private key.
- Test group creation on Alfajores before using mainnet.

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10,17,24&height=90&section=footer" width="100%"/>

<p align="center">
  <sub>MIT License unless noted otherwise. Built by <a href="https://github.com/0xnurrabby">0xnurrabby</a>.</sub>
</p>
