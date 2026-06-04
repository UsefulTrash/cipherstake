// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// CipherStake — Stake USDC, earn 1% per day reward
contract CipherStake {
    address public owner;
    mapping(address => uint256) public staked;
    mapping(address => uint256) public stakedAt;
    uint256 public rewardBps = 100; // 1% per day
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Claimed(address indexed user, uint256 reward);
    constructor() { owner = msg.sender; }
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    function stake() external payable {
        require(msg.value > 0, "Zero USDC");
        _claim(msg.sender);
        staked[msg.sender] += msg.value;
        stakedAt[msg.sender] = block.timestamp;
        emit Staked(msg.sender, msg.value);
    }
    function unstake(uint256 amount) external {
        require(staked[msg.sender] >= amount, "Insufficient stake");
        _claim(msg.sender);
        staked[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Unstaked(msg.sender, amount);
    }
    function claim() external { _claim(msg.sender); }
    function _claim(address user) internal {
        uint256 r = earned(user);
        stakedAt[user] = block.timestamp;
        if (r > 0 && address(this).balance >= r) {
            payable(user).transfer(r);
            emit Claimed(user, r);
        }
    }
    function earned(address user) public view returns (uint256) {
        if (staked[user] == 0) return 0;
        return staked[user] * rewardBps * (block.timestamp - stakedAt[user]) / (10000 * 1 days);
    }
    function fund() external payable {}
    receive() external payable {}
}