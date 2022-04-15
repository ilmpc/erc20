//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20 is IERC20 {
    address private _owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowed;
    uint256 private _totalSupply;

    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        _owner = msg.sender;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "Not enough tokens");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);

        return true;
    }

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256)
    {
        return _allowed[owner][spender];
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        _allowed[msg.sender][spender] += amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(_allowed[from][msg.sender] >= amount, "Not enough allowed");
        require(_balances[from] >= amount, "Not enough tokens");
        _allowed[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address account, uint256 amount) external returns (bool) {
        require(msg.sender == _owner, "Caller is not an owner");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
        return true;
    }

    function burn(address account, uint256 amount) external returns (bool) {
        require(msg.sender == _owner, "Caller is not an owner");
        require(_balances[account] >= amount, "Not enough tokens");
        _totalSupply -= amount;
        _balances[account] -= amount;
        emit Transfer(account, address(0), amount);
        return true;
    }
}
