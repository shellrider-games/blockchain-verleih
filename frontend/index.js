// src/app.js (or main application file)
import {
    initializeWeb3,
    getContract,
    getSigner,
    getProvider,
} from './services/web3'

let ownerOnly = document.getElementById('ownerOnly')

let createNewDeviceInput = document.getElementById('createNewDevice')
let transferOwnershipInput = document.getElementById('transferOwnership')
let requestTransferTokenInput = document.getElementById('requestTransferToken')
let requestTransferAddressInput = document.getElementById(
    'requestTransferAddress'
)
let walletAddressInput = document.getElementById('walletAddress')

let createNewDeviceButton = document.getElementById('createNewDeviceButton')
let transferOwnershipButton = document.getElementById('transferOwnershipButton')
let requestTransferButton = document.getElementById('requestTransferButton')
let addWalletButton = document.getElementById('addWalletButton')
let removeWalletButton = document.getElementById('removeWalletButton')

async function runApp() {
    await initializeWeb3()

    try {
        const myContract = getContract()
        const currentSigner = getSigner()

        // Read contract name
        const contractName = await myContract.name()
        console.log('Contract Name:', contractName)

        // Read isOwner
        const isOwner = await myContract.amIContractOwner()
        console.log('Am I Contract Owner:', isOwner)

        // hide/show owner ui
        if (isOwner) {
            ownerOnly.style.visibility = 'visible'
        } else {
            ownerOnly.style.visibility = 'hidden'
        }

        createNewDeviceButton.onclick = async () => {
            await myContract.createNewDevice(createNewDeviceInput.value)
        }

        transferOwnershipButton.onclick = async () => {
            await myContract.transferContractOwnership(
                transferOwnershipInput.value
            )
        }

        requestTransferButton.onclick = async () => {
            await myContract.requestTransfer(
                requestTransferTokenInput.value,
                requestTransferAddressInput.value
            )
        }

        addWalletButton.onclick = async () => {
            await myContract.addApprovedRecipient(walletAddressInput.value)
        }

        removeWalletButton.onclick = async () => {
            await myContract.removeApprovedRecipient(walletAddressInput.value)
        }
    } catch (error) {
        console.error('Error interacting with contract:', error)
        if (error.code === 'ACTION_REJECTED') {
            console.error('Transaction was rejected by the user.')
        } else if (error.code === 'CALL_EXCEPTION' || error.data) {
            console.error(
                'Contract call failed:',
                error.reason || error.data.message || error.message
            )
        }
    }
}

await runApp()
