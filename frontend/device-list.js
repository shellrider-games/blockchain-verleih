import {
    initializeWeb3,
    getContract,
    getSigner,
    getProvider,
} from './services/web3';

import { ethers, Interface } from 'ethers';

function setStatusBarText(value){
    const statusBar = document.getElementById('status-bar');
    statusBar.innerHTML = `<p> ${value} </p>`;
}

async function loaadAllTransferEvents() {
    const eventFilter = getContract().filters.Transfer();
    const from = 0;
    const to = 'latest';

    console.log("load all past transfer events");
    const events = await getContract().queryFilter(eventFilter, from, to);
    return events;
}

async function allExistingDeviceIds() {
    const transfers = await loaadAllTransferEvents();
    const mintedTokens = new Set();
    transfers.forEach(transfer => {
        const from = transfer.args[0];
        const to = transfer.args[1];
        const tokenId = transfer.args[2].toString();

        if (from === ethers.ZeroAddress) {
            mintedTokens.add(tokenId);
        } else if (to === ethers.ZeroAddress) {
            mintedTokens.delete(tokenId);
        }
    });
    return mintedTokens;
}

async function addDevicesToList(devices) {
    const deviceList = document.getElementById('device-list');
    for(let device of devices){
        const sn = await getContract().serialNumber(device);
        let li = document.createElement("li");
        li.innerText = `ID: ${device} Serial: ${sn}`;
        deviceList.appendChild(li);
    }
}

async function runApp() {
    await initializeWeb3()

    try {
        const myContract = getContract()
        const currentSigner = getSigner()

        const contractName = await myContract.name()
        console.log('Contract Name:', contractName)

        const isOwner = await myContract.amIContractOwner()
        console.log('Am I Contract Owner:', isOwner)
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

window.addEventListener("load", async () => {
    await runApp()
    setStatusBarText("Load all devices");
    const devices = Array.from(await allExistingDeviceIds());
    await addDevicesToList(devices);
    setStatusBarText("Finished loading");
});