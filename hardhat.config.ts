import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";

import "./tasks/accounts";
import "./tasks/greet";
import "./tasks/taskDeploy";
import { HardhatNetworkChainsUserConfig } from "hardhat/types/config";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
const privateKey1: string | undefined = process.env.PRIVATE_KEY_1;
const privateKey2: string | undefined = process.env.PRIVATE_KEY_2;

const hasPKs = !!privateKey1 && !!privateKey2;

console.log({hasPKs})

if (!mnemonic && !hasPKs) {
  throw new Error("Please set your PKs or MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

enum SupportedChainId {
  ETHEREUM_MAINNET = 1,
  OPTIMISM_MAINNET = 10,
  BSC_MAINNET = 56,
  GANACHE = 1337,
  HARDHAT = 31337,
  ARBITRUM_MAINNET = 42161,
  AVALANCHE_MAINNET = 43114,
  POLYGON_MAINNET = 137,
  HEDERA_MAINNET = 295,
  POLYGON_MUMBAI = 80001,
  SEPOLIA = 11155111,
};

const chainNames: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: "mainnet",
  [SupportedChainId.OPTIMISM_MAINNET]: "optimism",
  [SupportedChainId.BSC_MAINNET]: "bsc",
  [SupportedChainId.GANACHE]: "ganache",
  [SupportedChainId.HARDHAT]: "hardhat",
  [SupportedChainId.ARBITRUM_MAINNET]: "arbitrum",
  [SupportedChainId.AVALANCHE_MAINNET]: "avalanche",
  [SupportedChainId.POLYGON_MAINNET]: "polygon",
  [SupportedChainId.HEDERA_MAINNET]: "hedera",
  [SupportedChainId.POLYGON_MUMBAI]: "polygon-mumbai",
  [SupportedChainId.SEPOLIA]: "sepolia",
};

const infuraSupportedNetworks: Partial<Record<SupportedChainId, boolean>> = {
  [SupportedChainId.ETHEREUM_MAINNET]: true,
  [SupportedChainId.POLYGON_MAINNET]: true,
  [SupportedChainId.OPTIMISM_MAINNET]: true,
  [SupportedChainId.ARBITRUM_MAINNET]: true,
  [SupportedChainId.AVALANCHE_MAINNET]: true,
};

const fallbackRpcUrls: Record<SupportedChainId, string[]> = {
  [SupportedChainId.ETHEREUM_MAINNET]: [
    "https://eth.llamarpc.com"
  ],
  [SupportedChainId.OPTIMISM_MAINNET]: [
    "https://optimism.llamarpc.com"
  ],
  [SupportedChainId.BSC_MAINNET]: [
    "https://bsc-dataseed.bnbchain.org",
    "https://getblock.io/nodes/bsc",
    "https://binance.llamarpc.com",
    "https://rpc.ankr.com/bsc",
  ],
  [SupportedChainId.GANACHE]: [
    "http://localhost:8545"
  ],
  [SupportedChainId.HARDHAT]: [""],
  [SupportedChainId.POLYGON_MAINNET]: [
    "https://polygon.llamarpc.com"
  ],
  [SupportedChainId.HEDERA_MAINNET]: [
    "https://mainnet.hashio.io/api"
  ],
  [SupportedChainId.ARBITRUM_MAINNET]: [
    "https://arbitrum.llamarpc.com"
  ],
  [SupportedChainId.AVALANCHE_MAINNET]: [
    "https://avalanche-mainnet-rpc.allthatnode.com",
    "https://rpc.ankr.com/avalanche",
    "https://1rpc.io/avax/c",
    "https://api.avax.network/ext/bc/C/rpc",
    "https://avalanche.public-rpc.com",
    "https://avalanche-c-chain.publicnode.com",
    "https://avalanche.blockpi.network/v1/rpc/public",
    "https://avalanche.drpc.org",
  ],
  [SupportedChainId.SEPOLIA]: [
    "https://1rpc.io/sepolia"
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    "https://polygon-testnet.public.blastapi.io"
  ],
};

const defaultRpcUrls: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: fallbackRpcUrls[SupportedChainId.ETHEREUM_MAINNET][0],
  [SupportedChainId.OPTIMISM_MAINNET]: fallbackRpcUrls[SupportedChainId.OPTIMISM_MAINNET][0],
  [SupportedChainId.BSC_MAINNET]: fallbackRpcUrls[SupportedChainId.BSC_MAINNET][0],
  [SupportedChainId.POLYGON_MAINNET]: fallbackRpcUrls[SupportedChainId.POLYGON_MAINNET][0],
  [SupportedChainId.HEDERA_MAINNET]: fallbackRpcUrls[SupportedChainId.HEDERA_MAINNET][0],
  [SupportedChainId.GANACHE]: fallbackRpcUrls[SupportedChainId.GANACHE][0],
  [SupportedChainId.HARDHAT]: fallbackRpcUrls[SupportedChainId.HARDHAT][0],
  [SupportedChainId.AVALANCHE_MAINNET]: fallbackRpcUrls[SupportedChainId.AVALANCHE_MAINNET][0],
  [SupportedChainId.SEPOLIA]: fallbackRpcUrls[SupportedChainId.SEPOLIA][0],
  [SupportedChainId.ARBITRUM_MAINNET]: fallbackRpcUrls[SupportedChainId.ARBITRUM_MAINNET][0],
  [SupportedChainId.POLYGON_MUMBAI]: fallbackRpcUrls[SupportedChainId.POLYGON_MUMBAI][0],
};

// NOTE: we mostly don't care fast fork tests from caching
const forkBlockNumbers: Partial<Record<SupportedChainId, number>> = {
  [SupportedChainId.HEDERA_MAINNET]: 62_402_086, // forking from this block fails
  // [SupportedChainId.HEDERA_MAINNET]: 62_617_300, // forking from this block succeeds
};

// If a block number to pin a fork for a given network isn't specified then "latest" will be used for the fork by default(i.e. if undefined is returned)
function getForkChainBlockNumber(chainId: SupportedChainId): number | undefined {
  return forkBlockNumbers[chainId];
};

function getChainUrl(chainId: SupportedChainId): string {
  // Check if the chainId has a custom URL in infuraSupportedNetworks
  if (infuraSupportedNetworks[chainId]) {
    return `https://${chainNames[chainId]}.infura.io/v3/${infuraApiKey}`;
  }

  return defaultRpcUrls[chainId];
};

function getAccounts() {

  if (hasPKs) {
    const accounts = [privateKey1 && privateKey2];
    return accounts;
  }

  if (mnemonic) {
    const accounts = {
      mnemonic,
    }
    return accounts;
  }

  throw new Error("Either mnemonic or PKs should be defined");
};

const accounts = getAccounts();

function getChainConfig(chainId: SupportedChainId): NetworkUserConfig {
  const jsonRpcUrl = getChainUrl(chainId);

  return {
    accounts: accounts,
    chainId,
    url: jsonRpcUrl,
    timeout: 60_000 // added as the default timeout isn't sufficient for Hedera
  };
};

function isValidChainId(value: number | undefined): value is SupportedChainId {
  return value !== undefined && Object.values(SupportedChainId).includes(value);
};

const chainConfigs = Object.entries(chainNames).reduce((config, [chainIdString, chainName]) => {
  const chainId = Number(chainIdString);
  if (isValidChainId(chainId)) {
    config[chainName] = getChainConfig(chainId);
    return config;
  } else {
    throw new Error("Invalid chainId");
  }
}, {} as Record<string, NetworkUserConfig>);

function getForkChainConfig(chain: SupportedChainId): {
  url: string;
  blockNumber?: number;
} {

  const jsonRpcUrl = getChainUrl(chain);
  const blockNumber = getForkChainBlockNumber(chain);

  return {
    url: jsonRpcUrl,
    blockNumber
  }
};

// Define the common hardforkHistory for all chains
const commonHardforkHistory = {
  london: 1,
};

// Dynamically generate the chains configuration for the Hardhat network
const chainsConfiguration: HardhatNetworkChainsUserConfig = Object.values(SupportedChainId)
  .filter((value): value is SupportedChainId => typeof value === 'number') // Filter to only include numeric values
  .reduce<HardhatNetworkChainsUserConfig>((chains, chainId) => {
    chains[chainId] = {
      hardforkHistory: commonHardforkHistory,
    };
    return chains;
  }, {});

// if forkChain is defined hardhat will run as a fork otherwise it won't
const forkChain: SupportedChainId | undefined = SupportedChainId.HEDERA_MAINNET;
// const forkChain: SupportedChainId | undefined = undefined;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    ...chainConfigs,
    hardhat: {
      chains: chainsConfiguration,
      forking: forkChain ? getForkChainConfig(forkChain) : undefined,
      chainId: forkChain ? forkChain : SupportedChainId.HARDHAT,
      accounts: hasPKs ?
        [
          {
            privateKey: privateKey1,
            balance: "1000000000000000000000" // 100 ether
          },
          {
            privateKey: privateKey2,
            balance: "1000000000000000000000" // 100 ether
          },
        ] : {
          mnemonic
        },
    },
    ganache: {
      accounts: {
        mnemonic,
      },
      chainId: SupportedChainId.GANACHE,
      url: "http://localhost:8545",
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.17",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
