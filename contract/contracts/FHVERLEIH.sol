// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VERLEIH is ERC721 {
    address private _contractOwner;
    uint256 private _nextTokenId;
    
    mapping(uint256 => string) serialNumberOf;
    mapping(uint256 => uint) lastTakenFromVerleih;
    mapping(uint256 => uint) timeShouldBackAtVerleih;
    mapping(address => bool) _isApprovedRecipient;

    modifier onlyContractOwner() {
        require(msg.sender == _contractOwner, "Only the contract owner can call this function.");
        _;
    }

    modifier deviceExists(uint tokenId) {
        address currentOwner = ownerOf(tokenId);
        require(currentOwner != address(0), "ERC721: token doesn't exist or has been burned");
        _;
    }

    constructor() ERC721("UASDevice", "UASD"){
        _contractOwner = msg.sender;
        _nextTokenId = 1;
        _isApprovedRecipient[_contractOwner] = true;
    }

    function amIContractOwner() external view returns (bool) {
        return msg.sender == _contractOwner;
    }

    function addApprovedRecipient(address recipient) external onlyContractOwner {
        require(recipient != address(0), "Invalid address!");
        _isApprovedRecipient[recipient] = true;
    }

    function removeApprovedRecipient(address recipient) external onlyContractOwner {
        require(recipient != address(0), "Invalid address!");
        _isApprovedRecipient[recipient] = false;
    }

    function createNewDevice(string memory _serialNumber) external onlyContractOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _safeMint(_contractOwner, tokenId);
        serialNumberOf[tokenId] = _serialNumber;
        _nextTokenId++;
        return tokenId;
    }

    function destoryDevice(uint256 _tokenId) external onlyContractOwner deviceExists(_tokenId) {
        _burn(_tokenId);
        delete serialNumberOf[_tokenId];
    }

    function transferContractOwnership(address newOwner) external onlyContractOwner {
        require(newOwner != address(0), "Invalid address!");
        _contractOwner = newOwner;
        _isApprovedRecipient[newOwner] = true;
    }

    function serialNumber(uint _id) external view returns (string memory){
        return serialNumberOf[_id];
    }

    function setTimeShouldBeBackAtVerleih(uint256 _tokenId, uint unixTime) external onlyContractOwner deviceExists(_tokenId) {
        timeShouldBackAtVerleih[_tokenId] = unixTime;
    }

    function getTimeShouldBeBackAtVerleih(uint256 _tokenId) public view deviceExists(_tokenId) returns (uint) {
        return timeShouldBackAtVerleih[_tokenId];
    }

    function getTimeLastTakenFromVerleih(uint256 _tokenId) public view deviceExists(_tokenId) returns (uint) {
        return lastTakenFromVerleih[_tokenId];
    }

    function isApprovedRecipient(address recipient) public view returns (bool) {
        return _isApprovedRecipient[recipient];
    }

    function approve(address to, uint256 tokenId) public virtual override {
        revert("ERC721: Approval function is disabled for this token.");
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        revert("ERC721: SetApprovalForAll function is disabled for this token.");
    }

    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        return address(0); // No approvals are possible
    }

    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return false; // No operators can be approved
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        if(to != address(0)){
            require(_isApprovedRecipient[to], "Recipient is not on the approved list.");
        }
        if(from == _contractOwner) {
            lastTakenFromVerleih[tokenId] = block.timestamp;
        }
        return from;
    }
}