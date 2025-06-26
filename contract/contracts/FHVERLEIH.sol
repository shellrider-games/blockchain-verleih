// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VERLEIH is ERC721 {
    address private _contractOwner;
    uint256 private _nextTokenId;
    
    modifier onlyContractOwner() {
        require(msg.sender == _contractOwner, "Only the contract owner can call this function.");
        _;
    }

    constructor() ERC721("UASDevice", "UASD"){
        _contractOwner = msg.sender;
        _nextTokenId = 1;
    }

    function createNewDevice() public onlyContractOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _safeMint(_contractOwner, tokenId);
        _nextTokenId++;
        return tokenId;
    }

    function transferContractOwnership(address newOwner) external onlyContractOwner {
        require(newOwner != address(0), "Invalid address.");
        _contractOwner = newOwner;
    }
}