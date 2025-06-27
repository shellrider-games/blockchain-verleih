// src/app.js (or main application file)
import {
    initializeWeb3,
    getContract,
    getSigner,
    getProvider,
} from './services/web3'

function setStatusBarText(value) {
    const statusBar = document.getElementById('status-bar')
    statusBar.innerHTML = `<p> ${value} </p>`
}

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
        const from = transfer.args[0]
        const to = transfer.args[1]
        const tokenId = transfer.args[2].toString()

        if (from === adress) {
            relevantTokens.add(tokenId)
            isReceiver = false
        } else if (to === adress) {
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

        // Read isOwner
        const isOwner = await myContract.amIContractOwner()
        console.log('Am I Contract Owner:', isOwner)

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

async function addPendingTransfersToList(devices) {
    let transactionList = document.getElementById('transactionList')
    for (let device of devices) {
        const sn = await getContract().serialNumber(device)
        const transfer = await getContract().getPendingTransferDetails(device)
        const sender = transfer.args[0]
        const receiver = transfer.args[1]
        const senderAccepted = transfer.args[2]
        const receiverAccepted = transfer.args[3]

        const row = `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tokenId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${sn}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${senderAccepted}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${receiverAccepted}</td>
        </tr>
    `
    const signer = getSigner()

        let acceptButton = document.createElement('button')
        acceptButton.innerText = 'accept'
        acceptButton.addEventListener('click', (e) => {
          if (signer === sender && ) {
            getContract().acceptTransferAsOwner(device)
          }
          else if (signer === receiver) {
            getContract().acceptTransferAsRecipient(device)
          }
        })
    }
}

async function addDevicesToList(devices) {
    const deviceList = document.getElementById('device-list')
    for (let device of devices) {
        const sn = await getContract().serialNumber(device)
        let li = document.createElement('li')
        let textElement = document.createElement('p')
        textElement.innerText = `ID: ${device} Serial: ${sn}`
        li.appendChild(textElement)
        if (isOwner) {
            let button = document.createElement('button')
            button.innerText = 'decommsion'
            button.addEventListener('click', (e) => {
                decommsionDevice(device)
            })
            li.appendChild(button)
        }
        deviceList.appendChild(li)
    }
}
window.addEventListener('load', async () => {
    await runApp()
    setStatusBarText('Load pending transactions')
    const tranfers = Array.from(await getTransfersInvolvingAddress())
    await addPendingTranfersToList(transfers)
    setStatusBarText('Finished loading')
})
