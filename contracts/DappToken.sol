pragma solidity 0.5.16;


contract DappToken {
    string public name = "EthSwap Instant Exchange";
    uint256 public totalSupply;

    constructor() public{
        totalSupply = 1000000;
    }
    
}
