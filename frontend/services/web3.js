import { ethers, Interface } from 'ethers'

let provider = null
let signer = null
let contract = null
const contractAddress = '0x7fA00FF2F8047c7bD079803d40157Fb04546Fdc5'

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

export async function initializeWeb3() {
    if (window.ethereum == null) {
        console.warn('MetaMask not installed; using read-only defaults')
        provider = ethers.getDefaultProvider() // Connects to a default network (e.g., Mainnet, or an Infura/Alchemy endpoint if configured)
    } else {
        provider = new ethers.BrowserProvider(window.ethereum)
        try {
            // Request accounts if not already connected
            await provider.send('eth_requestAccounts', [])
            signer = await provider.getSigner()
            console.log('MetaMask connected with signer:', signer.address)
        } catch (error) {
            console.error('User rejected connection or other error:', error)
            // Handle error, e.g., prompt user to connect MetaMask
            signer = null // Ensure signer is null if connection fails
        }
    }

    try {
        const abi = await readABIJson()
        // Initialize the contract after provider and signer are set up
        // If signer is null (e.g., MetaMask not installed or rejected), contract will be read-only
        contract = new ethers.Contract(contractAddress, abi, signer || provider)
        console.log('Contract instance created.')
    } catch (error) {
        console.error('Error initializing contract:', error)
        contract = null // Ensure contract is null if initialization fails
    }
}

export function getContract() {
    if (!contract) {
        throw new Error(
            'Contract not initialized. Call initializeWeb3() first.'
        )
    }
    return contract
}

export function getSigner() {
    if (!signer) {
        throw new Error(
            'Signer not available. MetaMask might not be connected.'
        )
    }
    return signer
}

export function getProvider() {
    if (!provider) {
        throw new Error('Provider not initialized.')
    }
    return provider
}
