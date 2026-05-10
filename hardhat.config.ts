import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: [PRIVATE_KEY],
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      accounts: [PRIVATE_KEY],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      celo: process.env.CELOSCAN_API_KEY || "",
      alfajores: process.env.CELOSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts/contracts",
    tests: "./contracts/test",
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts",
  },
};

export default config;
