export const CELOSAVE_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "groupId", "type": "uint256" },
      { "indexed": false, "name": "name", "type": "string" },
      { "indexed": true, "name": "creator", "type": "address" },
      { "indexed": false, "name": "contributionAmount", "type": "uint256" },
      { "indexed": false, "name": "tokenAddress", "type": "address" },
      { "indexed": false, "name": "cycleDuration", "type": "uint256" }
    ],
    "name": "GroupCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "groupId", "type": "uint256" },
      { "indexed": true, "name": "member", "type": "address" }
    ],
    "name": "MemberJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "groupId", "type": "uint256" },
      { "indexed": false, "name": "startTime", "type": "uint256" },
      { "indexed": false, "name": "totalCycles", "type": "uint256" }
    ],
    "name": "GroupStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "groupId", "type": "uint256" },
      { "indexed": true, "name": "contributor", "type": "address" },
      { "indexed": false, "name": "cycle", "type": "uint256" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "groupId", "type": "uint256" },
      { "indexed": true, "name": "cycle", "type": "uint256" },
      { "indexed": true, "name": "recipient", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "PayoutSent",
    "type": "event"
  },
  // Read Functions
  {
    "inputs": [],
    "name": "groupCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "name": "getGroup",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "name", "type": "string" },
          { "name": "creator", "type": "address" },
          { "name": "members", "type": "address[]" },
          { "name": "contributionAmount", "type": "uint256" },
          { "name": "tokenAddress", "type": "address" },
          { "name": "cycleDuration", "type": "uint256" },
          { "name": "startTime", "type": "uint256" },
          { "name": "currentCycle", "type": "uint256" },
          { "name": "totalCycles", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "pendingBalance", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllGroups",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "name", "type": "string" },
          { "name": "creator", "type": "address" },
          { "name": "members", "type": "address[]" },
          { "name": "contributionAmount", "type": "uint256" },
          { "name": "tokenAddress", "type": "address" },
          { "name": "cycleDuration", "type": "uint256" },
          { "name": "startTime", "type": "uint256" },
          { "name": "currentCycle", "type": "uint256" },
          { "name": "totalCycles", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "pendingBalance", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getUserGroups",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "groupId", "type": "uint256" },
      { "name": "member", "type": "address" }
    ],
    "name": "hasMemberPaid",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "groupId", "type": "uint256" },
      { "name": "cycle", "type": "uint256" }
    ],
    "name": "getCycleRecipient",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "groupId", "type": "uint256" },
      { "name": "user", "type": "address" }
    ],
    "name": "isGroupMember",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Write Functions
  {
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "contributionAmount", "type": "uint256" },
      { "name": "tokenAddress", "type": "address" },
      { "name": "cycleDuration", "type": "uint256" }
    ],
    "name": "createGroup",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "name": "joinGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "name": "startGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "groupId", "type": "uint256" }],
    "name": "triggerPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
