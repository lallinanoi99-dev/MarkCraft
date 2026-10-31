// ===== Markcraft config — the only place to change addresses and endpoints =====
export const CONFIG = {
  // "mainnet" for the live site, "testnet" while testing
  NETWORK: "mainnet",

  // Paste the deployed MarkcraftClaims address here (mainnet). Zero address = "not deployed yet" mode.
  CONTRACT_ADDRESS: "0x32eadc612ccCA3b5915223033369f5c6cb7422Cb",
  TESTNET_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",

  // Your Cloudflare Worker (shared Week 1 Worker with /logo/plan, /logo/mark, /upload)
  WORKER_URL: "https://markcraft-worker.YOUR_SUBDOMAIN.workers.dev",

  IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  GITHUB_URL: "https://github.com/YOUR_GITHUB_USER/markcraft",
  X_URL: "https://x.com/BOTChain_ai",

  NETWORKS: {
    mainnet: {
      chainId: 677,
      chainName: "BOT Chain",
      rpc: "https://rpc.botchain.ai",
      explorer: "https://scan.botchain.ai",
      currency: { name: "BOT", symbol: "BOT", decimals: 18 },
    },
    testnet: {
      chainId: 968,
      chainName: "BOT Chain Testnet",
      rpc: "https://rpc.bohr.life",
      explorer: "https://scan.bohr.life",
      currency: { name: "BOT", symbol: "BOT", decimals: 18 },
    },
  },
};

export const NET = CONFIG.NETWORKS[CONFIG.NETWORK];
export const CONTRACT = CONFIG.NETWORK === "mainnet" ? CONFIG.CONTRACT_ADDRESS : CONFIG.TESTNET_CONTRACT_ADDRESS;
export const IS_DEPLOYED = !/^0x0{40}$/i.test(CONTRACT);

export const ABI = [
  "function claim(bytes32 svgHash, string brand, uint8 style, string cid) returns (uint256 id)",
  "function getClaim(uint256 id) view returns (tuple(address creator, bytes32 svgHash, string brand, uint8 style, string cid, uint64 at))",
  "function claimOfHash(bytes32 svgHash) view returns (uint256 id, tuple(address creator, bytes32 svgHash, string brand, uint8 style, string cid, uint64 at) c)",
  "function claimsOf(address creator) view returns (uint256[])",
  "function getGallery(uint256 from, uint256 count) view returns (uint256[] ids, tuple(address creator, bytes32 svgHash, string brand, uint8 style, string cid, uint64 at)[] items)",
  "function galleryCount() view returns (uint256)",
  "function total() view returns (uint256)",
  "event Claimed(uint256 indexed id, address indexed creator, bytes32 svgHash, string brand)",
  "error AlreadyClaimed(uint256 id)",
  "error EmptyHash()",
  "error BadBrand()",
  "error BadCid()",
  "error BadStyle()",
  "error NotFound()",
];
