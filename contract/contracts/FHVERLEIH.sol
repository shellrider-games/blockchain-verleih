// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VERLEIH is ERC721 {
    address private _contractOwner;
    uint256 private _nextTokenId;
    
    mapping(uint256 => string) serialNumberOf;
    mapping(uint256 => uint) rentalStart;
    mapping(uint256 => uint) rentalEnd;
    mapping(address => bool) _isApprovedRecipient;

    struct PendingTransfer {
        address from;
        address to;
        bool ownerAccepted;
        bool recipientAccepted;
        uint initiatedAt;
    }

    mapping(uint256 => PendingTransfer) pendingTransfers;
    mapping(uint256 => bool) hasPendingTransfer;

    event TransferRequested(uint256 indexed tokenId, address indexed from, address indexed to);
    event RecipientAcceptedTransfer(uint256 indexed tokenId, address indexed recipient);
    event OwnerAcceptedTransfer(uint256 indexed tokenId, address indexed owner);
    event TransferCancelled(uint256 indexed tokenId, address indexed by);
    event TransferConfirmed(uint256 indexed tokenId, address indexed from, address indexed to);

    modifier onlyContractOwner() {
        require(msg.sender == _contractOwner, "Only the contract owner can call this function.");
        _;
    }

    modifier deviceExists(uint tokenId) {
        address currentOwner = ownerOf(tokenId);
        require(currentOwner != address(0), "ERC721: token doesn't exist or has been burned");
        _;
    }

    modifier noPendingTransfer(uint256 tokenId) {
        require(!hasPendingTransfer[tokenId], "A pending transfer already exists for this token.");
        _;
    }

    modifier hasPendingTransfer_(uint256 tokenId) {
        require(hasPendingTransfer[tokenId], "No pending transfer for this token.");
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

    function destroyDevice(uint256 _tokenId) external onlyContractOwner deviceExists(_tokenId) {
        _burn(_tokenId);
        delete serialNumberOf[_tokenId];
        if (hasPendingTransfer[_tokenId]) {
            delete pendingTransfers[_tokenId];
            hasPendingTransfer[_tokenId] = false;
        }
    }

    function transferContractOwnership(address newOwner) external onlyContractOwner {
        require(newOwner != address(0), "Invalid address!");
        _contractOwner = newOwner;
        _isApprovedRecipient[newOwner] = true;
    }

    function serialNumber(uint _id) external view returns (string memory){
        return serialNumberOf[_id];
    }

    function setRentalEnd(uint256 _tokenId, uint unixTime) external onlyContractOwner deviceExists(_tokenId) {
        rentalEnd[_tokenId] = unixTime;
    }

    function getRentalEnd(uint256 _tokenId) public view deviceExists(_tokenId) returns (uint) {
        return rentalEnd[_tokenId];
    }

    function getRentalStart(uint256 _tokenId) public view deviceExists(_tokenId) returns (uint) {
        return rentalStart[_tokenId];
    }

    function isApprovedRecipient(address recipient) public view returns (bool) {
        return _isApprovedRecipient[recipient];
    }

    function _finalizeTransfer(uint256 tokenId, address from, address to) internal {
        _transfer(from, to, tokenId);

        delete pendingTransfers[tokenId];
        hasPendingTransfer[tokenId] = false;

        emit TransferConfirmed(tokenId, from, to);
    }

    function requestTransfer(uint256 tokenId, address to)
        external
        deviceExists(tokenId)
        noPendingTransfer(tokenId)
    {
        address currentOwner = ownerOf(tokenId);
        require(msg.sender == currentOwner, "Only the current owner can request a transfer.");
        require(to != address(0), "Invalid recipient address.");
        require(_isApprovedRecipient[to], "Recipient is not on the approved list.");
        require(currentOwner != to, "Cannot transfer to self.");

        pendingTransfers[tokenId] = PendingTransfer({
            from: currentOwner,
            to: to,
            ownerAccepted: false,
            recipientAccepted: false,
            initiatedAt: block.timestamp
        });
        hasPendingTransfer[tokenId] = true;
        emit TransferRequested(tokenId, currentOwner, to);
    }

    function cancelTransfer(uint256 tokenId) external hasPendingTransfer_(tokenId)
    {
        PendingTransfer storage pTransfer = pendingTransfers[tokenId];
        require(msg.sender == pTransfer.from || msg.sender == pTransfer.to, "Only the sender or recipient can cancel this transfer.");

        delete pendingTransfers[tokenId];
        hasPendingTransfer[tokenId] = false;
        emit TransferCancelled(tokenId, msg.sender);
    }

    function acceptTransferAsRecipient(uint256 tokenId) external hasPendingTransfer_(tokenId)
    {
        PendingTransfer storage pTransfer = pendingTransfers[tokenId];
        require(msg.sender == pTransfer.to, "Only the intended recipient can accept this transfer.");
        require(!pTransfer.recipientAccepted, "Recipient has already accepted.");

        pTransfer.recipientAccepted = true;
        emit RecipientAcceptedTransfer(tokenId, msg.sender);

        if (pTransfer.ownerAccepted) {
            _finalizeTransfer(tokenId, pTransfer.from, pTransfer.to);
        }
    }

    function acceptTransferAsOwner(uint256 tokenId) external hasPendingTransfer_(tokenId)
    {
        PendingTransfer storage pTransfer = pendingTransfers[tokenId];
        require(msg.sender == pTransfer.from, "Only the current owner can accept this transfer.");
        require(!pTransfer.ownerAccepted, "Owner has already accepted.");

        pTransfer.ownerAccepted = true;
        emit OwnerAcceptedTransfer(tokenId, msg.sender);

        if (pTransfer.recipientAccepted) {
            _finalizeTransfer(tokenId, pTransfer.from, pTransfer.to);
        }
    }

    function getPendingTransferDetails(uint256 tokenId) external view returns (address from, address to, bool ownerAccepted, bool recipientAccepted, uint256 initiatedAt)
    {
        require(hasPendingTransfer[tokenId], "No pending transfer for this token.");
        PendingTransfer storage pTransfer = pendingTransfers[tokenId];
        return (pTransfer.from, pTransfer.to, pTransfer.ownerAccepted, pTransfer.recipientAccepted, pTransfer.initiatedAt);
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
        if(from != address(0) && to != address(0)){
            require(hasPendingTransfer[tokenId] && pendingTransfers[tokenId].ownerAccepted && pendingTransfers[tokenId].recipientAccepted, "Transfer must go through the request and acceptance process.");
        }
        if(from == _contractOwner) {
            rentalStart[tokenId] = block.timestamp;
        }
        return from;
    }
}