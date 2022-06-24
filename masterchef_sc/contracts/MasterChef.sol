// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SafeMath.sol";
import "./IERC20.sol";
import "./SafeERC20.sol";
import "./Ownable.sol";

import "./RedDotToken.sol";

contract MasterChef is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accRedDotPerShare;
    }

    RedDotToken public redDot;

    uint256 public BONUS_MULTIPLIER = 1;

    uint256 public redDotPerBlock;

    // PoolInfo[] public poolInfo;
    mapping(string => PoolInfo) poolInfoMap;
    string[] poolNames;

    // mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    mapping(string => mapping(address => UserInfo)) public userInfoMap;

    uint256 public totalAllocPoint = 0;

    event Deposit(address indexed user, string pid, uint256 amount);
    event Withdraw(address indexed user, string pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(RedDotToken _redDot, uint256 _redDotPerBlock) {
        redDot = _redDot;
        redDotPerBlock = _redDotPerBlock;
    }

    function getAllocPoint(string memory _poolName)
        public
        view
        returns (uint256)
    {
        return poolInfoMap[_poolName].allocPoint;
    }

    function updateMultiplier(uint256 multiplierNumber) public onlyOwner {
        BONUS_MULTIPLIER = multiplierNumber;
    }

    function getCurrentMultiplier() public view returns (uint256) {
        return BONUS_MULTIPLIER;
    }

    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        return _to.sub(_from).mul(BONUS_MULTIPLIER);
    }

    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        bool _withUpdate,
        string memory _poolName
    ) public { // remove onlyOwner for test
        if (_withUpdate) {
            massUpdatePools(); // IMP make program more equal
        }
        uint256 lastRewardBlock = block.number;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfoMap[_poolName] = PoolInfo({
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accRedDotPerShare: 0
        });
        poolNames.push(_poolName);
    }

    function set(
        string memory _poolName,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 prevAllocPoint = poolInfoMap[_poolName].allocPoint;
        poolInfoMap[_poolName].allocPoint = _allocPoint;
        if (prevAllocPoint != _allocPoint) {
            totalAllocPoint = totalAllocPoint.sub(prevAllocPoint).add(
                _allocPoint
            );
        }
    }

    // trasfer any reward if exist to depositer, update user amount, update user reward det
    function deposit(string memory _poolName, uint256 _amount) public {
        PoolInfo storage pool = poolInfoMap[_poolName];
        UserInfo storage user = userInfoMap[_poolName][msg.sender];
        updatePool(_poolName);
        if (user.amount > 0) {
            uint256 pending = user
                .amount
                .mul(pool.accRedDotPerShare)
                .div(1e12)
                .sub(user.rewardDebt);
            if (pending > 0) {
                safeRedDotTransfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accRedDotPerShare).div(1e12);
        emit Deposit(msg.sender, _poolName, _amount);
    }

    // update accRedDotPerShare and lastRewardBlock of pool
    function updatePool(string memory _poolName) public {
        PoolInfo storage pool = poolInfoMap[_poolName];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 redDotReward = multiplier
            .mul(redDotPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);
        // block 1 right after first deposit rwd = 1 * 10 * 100 / 100  | rwd/share  = 0 + 10 / 100
        // block 2 add new pool rwd = 1 * 10 * 100 / 100 | rwd/share = 1 + 1
        // block 3 rwd = 1 * 10 * 100 / 200 | rwd/share = 2 + 0.5
        // conclusion this update will keep previous rwd/share safe
        pool.accRedDotPerShare = pool.accRedDotPerShare.add(
            redDotReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    // calculate current reward userAmount*accRedDotPerShare-user
    function pendingRedDot(string memory _poolName, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfoMap[_poolName];
        UserInfo storage user = userInfoMap[_poolName][_user];
        uint256 accRedDotPerShare = pool.accRedDotPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 redDotReward = multiplier
                .mul(redDotPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accRedDotPerShare = accRedDotPerShare.add(
                redDotReward.mul(1e12).div(lpSupply)
            );
        }
        return
            user.amount.mul(accRedDotPerShare).div(1e12).sub(user.rewardDebt);
    }

    function getRDXBalance() public view returns (uint256) {
        uint256 redDotBal = redDot.balanceOf(address(this));
        return redDotBal;
    }

    function claimReward(string memory _poolName, uint256 _amount) public {
        PoolInfo storage pool = poolInfoMap[_poolName];
        UserInfo storage user = userInfoMap[_poolName][msg.sender];
        updatePool(_poolName);
        uint256 accRedDotPerShare = pool.accRedDotPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 redDotReward = multiplier
                .mul(redDotPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accRedDotPerShare = accRedDotPerShare.add(
                redDotReward.mul(1e12).div(lpSupply)
            );
        }
        uint256 pending = user.amount.mul(accRedDotPerShare).div(1e12).sub(
            user.rewardDebt
        ); // test ky doan 1e12 nay
        uint256 redDotBal = redDot.balanceOf(address(this));
        if (_amount > pending) {
            revert("Insuficent balance");
        }
        if (_amount > redDotBal) {
            revert("amount bigger than Chef Balance");
        }
        if (_amount > 0 && pending > 0) {
            user.rewardDebt = user.rewardDebt.add(_amount);
            safeRedDotTransfer(msg.sender, _amount);
        }
    }

    function massUpdatePools() public {
        for (uint256 i = 0; i < poolNames.length; ++i) {
            updatePool(poolNames[i]);
        }
    }

    function withdraw(string memory _poolName, uint256 _amount) public {
        PoolInfo storage pool = poolInfoMap[_poolName];
        UserInfo storage user = userInfoMap[_poolName][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");

        updatePool(_poolName);
        uint256 pending = user.amount.mul(pool.accRedDotPerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            safeRedDotTransfer(msg.sender, pending);
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accRedDotPerShare).div(1e12);
        emit Withdraw(msg.sender, _poolName, _amount);
    }

    function getUserAmountDeposit(string memory _poolName) public view returns (uint256) {
        uint256 userAmount = userInfoMap[_poolName][msg.sender].amount;
        return userAmount;
    }

    function safeRedDotTransfer(address _to, uint256 _amount) internal {
        uint256 redDotBal = redDot.balanceOf(address(this));
        if (_amount > redDotBal) {
            redDot.transfer(_to, redDotBal);
        } else {
            redDot.transfer(_to, _amount);
        }
    }
}

// function updateStakingPool() internal {
//     uint256 length = poolInfo.length;
//     uint256 points = 0;
//     for (uint256 pid = 1; pid < length; ++pid) {
//         points = points.add(poolInfo[pid].allocPoint);
//     }
//     if (points != 0) {
//         points = points.div(3);
//         totalAllocPoint = totalAllocPoint.sub(poolInfo[0].allocPoint).add(
//             points
//         );
//         poolInfo[0].allocPoint = points;
//     }
// }
// function enterStaking(uint256 _amount) public {
//     PoolInfo storage pool = poolInfo[0];
//     UserInfo storage user = userInfo[0][msg.sender];
//     updatePool(0);
//     if (user.amount > 0) {
//         uint256 pending = user
//             .amount
//             .mul(pool.accRedDotPerShare)
//             .div(1e12)
//             .sub(user.rewardDebt);
//         if (pending > 0) {
//             safeRedDotTransfer(msg.sender, pending);
//         }
//     }
//     if (_amount > 0) {
//         pool.lpToken.safeTransferFrom(
//             address(msg.sender),
//             address(this),
//             _amount
//         );
//         user.amount = user.amount.add(_amount);
//     }
//     user.rewardDebt = user.amount.mul(pool.accRedDotPerShare).div(1e12);

//     emit Deposit(msg.sender, 0, _amount);
// }
// function leaveStaking(uint256 _amount) public {
//     PoolInfo storage pool = poolInfo[0];
//     UserInfo storage user = userInfo[0][msg.sender];
//     require(user.amount >= _amount, "withdraw: not good");
//     updatePool(0);
//     uint256 pending = user.amount.mul(pool.accRedDotPerShare).div(1e12).sub(
//         user.rewardDebt
//     );
//     if (pending > 0) {
//         safeRedDotTransfer(msg.sender, pending);
//     }
//     if (_amount > 0) {
//         user.amount = user.amount.sub(_amount);
//         pool.lpToken.safeTransfer(address(msg.sender), _amount);
//     }
//     user.rewardDebt = user.amount.mul(pool.accRedDotPerShare).div(1e12);

//     emit Withdraw(msg.sender, 0, _amount);
// }

// function emergencyWithdraw(uint256 _pid) public {
//     PoolInfo storage pool = poolInfo[_pid];
//     UserInfo storage user = userInfo[_pid][msg.sender];
//     pool.lpToken.safeTransfer(address(msg.sender), user.amount);
//     emit EmergencyWithdraw(msg.sender, _pid, user.amount);
//     user.amount = 0;
//     user.rewardDebt = 0;
// }
