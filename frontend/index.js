import { ethers, Fragment, Interface } from 'ethers'

let signer = null
const contractAddress = '0x7fA00FF2F8047c7bD079803d40157Fb04546Fdc5'

// metamask integration
async function integrateMetaMask() {
    let provider
    if (window.ethereum == null) {
        console.log('MetaMask not installed; using read-only defaults')
        provider = ethers.getDefaultProvider()
    } else {
        provider = new ethers.BrowserProvider(window.ethereum)

        signer = await provider.getSigner()
    }
}
integrateMetaMask()

async function readABIJson() {
    try {
        const response = await fetch('./contract.json')
        const abi = await response.json()

        const iface = new Interface(abi)
        console.log(iface.format())
        return iface
    } catch (error) {
        console.error(error)
    }
}

const contract = new ethers.Contract(
    contractAddress,
    await readABIJson(),
    signer
)

async function callSmartContract() {
    const contractName = await contract.name()
    console.log(contractName)
}
await callSmartContract()

async function isAddressContractOwner() {
    const contractOwner = await contract.amIContractOwner()
    console.log(contractOwner)
}
await isAddressContractOwner()

async function transferContractOwnership(address) {
    const contractOwner = await contract.transferContractOwnership(address)
    console.log(contractOwner)
}

async function createNewDevice(serialNumber) {
    const contractOwner = await contract.createNewDevice(serialNumber)
    console.log(contractOwner)
}

async function requestTransfer(tokenId, addressTo) {
    await contract.requestTransfer(tokenId, addressTo)
}

async function getPendingTransferDetails(tokenId) {
    const pendingTransferDetails =
        await contract.getPendingTransferDetails(tokenId)
    console.log(pendingTransferDetails)
}

async function acceptTransferAsRecipient(tokenId) {
    await contract.acceptTransferAsRecipient(tokenId)
}

async function acceptTransferAsOwner(tokenId) {
    await contract.acceptTransferAsOwner(tokenId)
}
