// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CeloSave - Group Savings (Esusu/Tontine/Samiti) on Celo
 * @author CeloSave Team
 * @notice A decentralized rotating savings group (Chit Fund / Samiti) built on Celo
 * @dev Supports cUSD/USDT/USDC contributions with transparent on-chain payout rotation
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract CeloSave {
    // ========== CONSTANTS ==========
    uint256 public constant MAX_MEMBERS = 20;
    uint256 public constant MIN_CONTRIBUTION = 1e16; // 0.01 tokens minimum
    
    // Celo mainnet stablecoin addresses
    address public constant CUSD_ADDRESS = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address public constant USDT_ADDRESS = 0x617f3112bf5397D0467D315cC709EF968D9ba546;
    address public constant USDC_ADDRESS = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C;

    // ========== ENUMS ==========
    enum GroupStatus { Open, Active, Completed, Cancelled }
    enum PayoutStatus { Pending, Completed }

    // ========== STRUCTS ==========
    struct Group {
        uint256 id;
        string name;
        address creator;
        address[] members;
        uint256 contributionAmount;
        address tokenAddress;    // cUSD, USDT, or USDC
        uint256 cycleDuration;   // seconds per cycle (e.g., 7 days = 604800)
        uint256 startTime;
        uint256 currentCycle;
        uint256 totalCycles;     // = number of members
        GroupStatus status;
        mapping(uint256 => address) cycleRecipient;      // cycle => who gets paid
        mapping(address => bool) hasPaidCurrentCycle;
        mapping(address => uint256) totalContributed;
        mapping(address => bool) isMember;
        mapping(uint256 => bool) cycleCompleted;
        uint256 pendingBalance;
    }

    struct GroupView {
        uint256 id;
        string name;
        address creator;
        address[] members;
        uint256 contributionAmount;
        address tokenAddress;
        uint256 cycleDuration;
        uint256 startTime;
        uint256 currentCycle;
        uint256 totalCycles;
        GroupStatus status;
        uint256 pendingBalance;
    }

    // ========== STATE VARIABLES ==========
    uint256 public groupCount;
    mapping(uint256 => Group) private groups;
    mapping(address => uint256[]) public userGroups;

    // ========== EVENTS ==========
    event GroupCreated(
        uint256 indexed groupId,
        string name,
        address indexed creator,
        uint256 contributionAmount,
        address tokenAddress,
        uint256 cycleDuration
    );
    event MemberJoined(uint256 indexed groupId, address indexed member);
    event GroupStarted(uint256 indexed groupId, uint256 startTime, uint256 totalCycles);
    event ContributionMade(
        uint256 indexed groupId,
        address indexed contributor,
        uint256 cycle,
        uint256 amount
    );
    event PayoutSent(
        uint256 indexed groupId,
        uint256 indexed cycle,
        address indexed recipient,
        uint256 amount
    );
    event GroupCompleted(uint256 indexed groupId);
    event GroupCancelled(uint256 indexed groupId);

    // ========== MODIFIERS ==========
    modifier onlyCreator(uint256 groupId) {
        require(msg.sender == groups[groupId].creator, "Not group creator");
        _;
    }

    modifier onlyMember(uint256 groupId) {
        require(groups[groupId].isMember[msg.sender], "Not a member");
        _;
    }

    modifier groupExists(uint256 groupId) {
        require(groupId > 0 && groupId <= groupCount, "Group does not exist");
        _;
    }

    modifier isValidToken(address token) {
        require(
            token == CUSD_ADDRESS || token == USDT_ADDRESS || token == USDC_ADDRESS,
            "Invalid token: use cUSD, USDT, or USDC"
        );
        _;
    }

    // ========== CORE FUNCTIONS ==========

    /**
     * @notice Create a new savings group
     * @param name Group name (e.g., "Friends Samiti")
     * @param contributionAmount Amount each member contributes per cycle
     * @param tokenAddress Which stablecoin to use (cUSD/USDT/USDC)
     * @param cycleDuration Duration of each cycle in seconds
     */
    function createGroup(
        string calldata name,
        uint256 contributionAmount,
        address tokenAddress,
        uint256 cycleDuration
    ) external isValidToken(tokenAddress) returns (uint256) {
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name");
        require(contributionAmount >= MIN_CONTRIBUTION, "Contribution too small");
        require(cycleDuration >= 1 days, "Cycle must be at least 1 day");
        require(cycleDuration <= 30 days, "Cycle must be at most 30 days");

        groupCount++;
        uint256 groupId = groupCount;

        Group storage group = groups[groupId];
        group.id = groupId;
        group.name = name;
        group.creator = msg.sender;
        group.contributionAmount = contributionAmount;
        group.tokenAddress = tokenAddress;
        group.cycleDuration = cycleDuration;
        group.status = GroupStatus.Open;
        group.currentCycle = 0;

        // Creator auto-joins
        group.members.push(msg.sender);
        group.isMember[msg.sender] = true;
        userGroups[msg.sender].push(groupId);

        emit GroupCreated(groupId, name, msg.sender, contributionAmount, tokenAddress, cycleDuration);
        emit MemberJoined(groupId, msg.sender);

        return groupId;
    }

    /**
     * @notice Join an open savings group
     * @param groupId The group to join
     */
    function joinGroup(uint256 groupId) external groupExists(groupId) {
        Group storage group = groups[groupId];
        require(group.status == GroupStatus.Open, "Group is not open");
        require(!group.isMember[msg.sender], "Already a member");
        require(group.members.length < MAX_MEMBERS, "Group is full");

        group.members.push(msg.sender);
        group.isMember[msg.sender] = true;
        userGroups[msg.sender].push(groupId);

        emit MemberJoined(groupId, msg.sender);
    }

    /**
     * @notice Start the savings group (creator only, min 2 members)
     * @param groupId The group to start
     */
    function startGroup(uint256 groupId) external groupExists(groupId) onlyCreator(groupId) {
        Group storage group = groups[groupId];
        require(group.status == GroupStatus.Open, "Group already started");
        require(group.members.length >= 2, "Need at least 2 members");

        group.status = GroupStatus.Active;
        group.startTime = block.timestamp;
        group.currentCycle = 1;
        group.totalCycles = group.members.length;

        // Assign payout order (simple sequential for fairness - can be randomized)
        for (uint256 i = 0; i < group.members.length; i++) {
            group.cycleRecipient[i + 1] = group.members[i];
        }

        emit GroupStarted(groupId, block.timestamp, group.totalCycles);
    }

    /**
     * @notice Contribute for the current cycle
     * @param groupId The group to contribute to
     */
    function contribute(uint256 groupId) external groupExists(groupId) onlyMember(groupId) {
        Group storage group = groups[groupId];
        require(group.status == GroupStatus.Active, "Group not active");
        require(!group.hasPaidCurrentCycle[msg.sender], "Already contributed this cycle");
        require(group.currentCycle <= group.totalCycles, "All cycles completed");

        // Transfer tokens from user to contract
        IERC20 token = IERC20(group.tokenAddress);
        require(
            token.allowance(msg.sender, address(this)) >= group.contributionAmount,
            "Insufficient allowance"
        );
        require(
            token.transferFrom(msg.sender, address(this), group.contributionAmount),
            "Transfer failed"
        );

        group.hasPaidCurrentCycle[msg.sender] = true;
        group.totalContributed[msg.sender] += group.contributionAmount;
        group.pendingBalance += group.contributionAmount;

        emit ContributionMade(groupId, msg.sender, group.currentCycle, group.contributionAmount);

        // Check if all members have paid - auto-distribute
        if (_allMembersPaid(groupId)) {
            _distributeCurrentCycle(groupId);
        }
    }

    /**
     * @notice Manually trigger payout if cycle time has passed (for partial contributions)
     * @param groupId The group
     */
    function triggerPayout(uint256 groupId) external groupExists(groupId) onlyMember(groupId) {
        Group storage group = groups[groupId];
        require(group.status == GroupStatus.Active, "Group not active");
        require(group.currentCycle <= group.totalCycles, "All cycles completed");

        uint256 cycleEndTime = group.startTime + (group.currentCycle * group.cycleDuration);
        require(block.timestamp >= cycleEndTime, "Cycle not yet ended");
        require(group.pendingBalance > 0, "No balance to distribute");

        _distributeCurrentCycle(groupId);
    }

    // ========== INTERNAL FUNCTIONS ==========

    function _allMembersPaid(uint256 groupId) internal view returns (bool) {
        Group storage group = groups[groupId];
        for (uint256 i = 0; i < group.members.length; i++) {
            if (!group.hasPaidCurrentCycle[group.members[i]]) {
                return false;
            }
        }
        return true;
    }

    function _distributeCurrentCycle(uint256 groupId) internal {
        Group storage group = groups[groupId];
        
        address recipient = group.cycleRecipient[group.currentCycle];
        uint256 payoutAmount = group.pendingBalance;
        
        group.pendingBalance = 0;
        group.cycleCompleted[group.currentCycle] = true;

        // Reset payment tracking for next cycle
        for (uint256 i = 0; i < group.members.length; i++) {
            group.hasPaidCurrentCycle[group.members[i]] = false;
        }

        // Transfer payout to recipient
        IERC20 token = IERC20(group.tokenAddress);
        require(token.transfer(recipient, payoutAmount), "Payout transfer failed");

        emit PayoutSent(groupId, group.currentCycle, recipient, payoutAmount);

        if (group.currentCycle >= group.totalCycles) {
            group.status = GroupStatus.Completed;
            emit GroupCompleted(groupId);
        } else {
            group.currentCycle++;
        }
    }

    // ========== VIEW FUNCTIONS ==========

    function getGroup(uint256 groupId) external view groupExists(groupId) returns (GroupView memory) {
        Group storage group = groups[groupId];
        return GroupView({
            id: group.id,
            name: group.name,
            creator: group.creator,
            members: group.members,
            contributionAmount: group.contributionAmount,
            tokenAddress: group.tokenAddress,
            cycleDuration: group.cycleDuration,
            startTime: group.startTime,
            currentCycle: group.currentCycle,
            totalCycles: group.totalCycles,
            status: group.status,
            pendingBalance: group.pendingBalance
        });
    }

    function getUserGroups(address user) external view returns (uint256[] memory) {
        return userGroups[user];
    }

    function hasMemberPaid(uint256 groupId, address member) external view groupExists(groupId) returns (bool) {
        return groups[groupId].hasPaidCurrentCycle[member];
    }

    function getMemberTotalContributed(uint256 groupId, address member) external view groupExists(groupId) returns (uint256) {
        return groups[groupId].totalContributed[member];
    }

    function getCycleRecipient(uint256 groupId, uint256 cycle) external view groupExists(groupId) returns (address) {
        return groups[groupId].cycleRecipient[cycle];
    }

    function isCycleCompleted(uint256 groupId, uint256 cycle) external view groupExists(groupId) returns (bool) {
        return groups[groupId].cycleCompleted[cycle];
    }

    function getGroupMembers(uint256 groupId) external view groupExists(groupId) returns (address[] memory) {
        return groups[groupId].members;
    }

    function isGroupMember(uint256 groupId, address user) external view groupExists(groupId) returns (bool) {
        return groups[groupId].isMember[user];
    }

    function getAllGroups() external view returns (GroupView[] memory) {
        GroupView[] memory allGroups = new GroupView[](groupCount);
        for (uint256 i = 1; i <= groupCount; i++) {
            Group storage group = groups[i];
            allGroups[i - 1] = GroupView({
                id: group.id,
                name: group.name,
                creator: group.creator,
                members: group.members,
                contributionAmount: group.contributionAmount,
                tokenAddress: group.tokenAddress,
                cycleDuration: group.cycleDuration,
                startTime: group.startTime,
                currentCycle: group.currentCycle,
                totalCycles: group.totalCycles,
                status: group.status,
                pendingBalance: group.pendingBalance
            });
        }
        return allGroups;
    }
}
