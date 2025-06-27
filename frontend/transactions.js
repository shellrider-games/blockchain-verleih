// src/app.js (or main application file)
import {
    initializeWeb3,
    getContract,
    getSigner,
    getProvider,
} from './services/web3'

// function setStatusBarText(value) {
// const statusBar = document.getElementById('status-bar')
// statusBar.innerHTML = `<p> ${value} </p>`
// }

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
    const relevantTokens = new Set()
    transfers.forEach((transfer) => {
        const tokenId = transfer.args[0].toString()
        const from = transfer.args[1]
        const to = transfer.args[2]

        if (from === address) {
            relevantTokens.add(tokenId)
            isReceiver = false
        } else if (to === address) {
            relevantTokens.delete(tokenId)
            isReceiver = true
        }
    })
    return relevantTokens
}

async function runApp() {
    await initializeWeb3()

    try {
        const myContract = getContract()
        const currentSigner = getSigner()

        // Read contract name
        const contractName = await myContract.name()
        console.log('Contract Name:', contractName)
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

async function addPendingTransfersToList(devices) {
    console.log(devices)
    let transactionList = document.getElementById('transactionList')
    for (let device of devices) {
        const sn = await getContract().serialNumber(device)
        const transfer = await getContract().getPendingTransferDetails(device)
        console.log(transfer)
        const sender = transfer[0]
        const receiver = transfer[1]
        const senderAccepted = transfer[2]
        const receiverAccepted = transfer[3]

        const signer = getSigner().address

        let acceptButton = document.createElement('button')
        acceptButton.innerText = 'accept'
        acceptButton.addEventListener('click', (e) => {
            if (signer === sender && !senderAccepted) {
                getContract().acceptTransferAsOwner(device)
            } else if (signer === receiver && !receiverAccepted) {
                getContract().acceptTransferAsRecipient(device)
            }
        })

        let row = document.createElement('tr')
        let col1 = document.createElement('td')
        col1.innerText = device
        let col2 = document.createElement('td')
        col2.innerText = sn
        let col3 = document.createElement('td')
        col3.innerText = senderAccepted
        let col4 = document.createElement('td')
        col4.innerText = receiverAccepted
        let col5 = document.createElement('td')
        col5.appendChild(acceptButton)

        row.appendChild(col1)
        row.appendChild(col2)
        row.appendChild(col3)
        row.appendChild(col4)
        row.appendChild(col5)

        transactionList.appendChild(row)
    }
}

window.addEventListener('load', async () => {
    await runApp()
    // setStatusBarText('Load pending transactions')
    const devices = Array.from(
        await getTransfersInvolvingAddress(getSigner().address)
    )
    await addPendingTransfersToList(devices)
    // setStatusBarText('Finished loading')
})
