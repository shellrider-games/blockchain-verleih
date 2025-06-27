// src/app.js (or main application file)
import {
    initializeWeb3,
    getContract,
    getSigner,
    getProvider,
} from './services/web3'

let transactionList = document.getElementById('transactionList')

async function loadAllTransferRequestedEvents() {
    const eventFilter = getContract().filters.TransferRequested()
    const from = 0
    const to = 'latest'

    console.log('load all past transfer requested events')
    const events = await getContract().queryFilter(eventFilter, from, to)
    return events
}

async function getTransfersInvolvingAddress(address) {
    let isReceiver = true
    const transfers = await loadAllTransferRequestedEvents()
    const mintedTokens = new Set()
    transfers.forEach((transfer) => {
        const from = transfer.args[0]
        const to = transfer.args[1]
        const tokenId = transfer.args[2].toString()

        if (from === adress) {
            mintedTokens.add(tokenId)
            isReceiver = false
        } else if (to === adress) {
            mintedTokens.delete(tokenId)
            isReceiver = true
        }
    })
    return mintedTokens
}

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
        // if (isOwner) {
        //     ownerOnly.style.visibility = 'visible'
        // } else {
        //     ownerOnly.style.visibility = 'hidden'
        // }

        createNewDeviceButton.onclick = async () => {
            const contractOwner = await myContract.createNewDevice(
                createNewDeviceInput.value
            )
        }

        transferOwnershipButton.onclick = async () => {
            const contractOwner = await myContract.transferContractOwnership(
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
