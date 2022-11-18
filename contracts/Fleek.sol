// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Fleek is ERC20, Ownable {
    ////STATE VARIABLES
    uint128 _totalSupply;
    constructor() ERC20("Fleek", "FLK") {
        _totalSupply = 400000 * 10e18;
        _mint(address(this), _totalSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function transfer(address to, uint128 amount) external onlyOwner{
        require(balanceOf(address(this)) >= amount, "Not sufficient token");
        _transfer(address(this), to, amount);
    }
}