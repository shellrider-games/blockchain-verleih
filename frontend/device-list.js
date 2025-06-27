import { ethers, Interface } from 'ethers'

let signer = null;
const contractAddress = '0x7fA00FF2F8047c7bD079803d40157Fb04546Fdc5';
let contract = null;

async function integrateMetaMask() {
    let provider;
    if (window.ethereum == null) {
        console.log('MetaMask not installed; using read-only defaults');
        provider = ethers.getDefaultProvider();
    } else {
        provider = new ethers.BrowserProvider(window.ethereum);

        signer = await provider.getSigner();
    }
}

async function readABIJson() {
    try {
        const response = await fetch('./contract.json')
        const abi = await response.json()
        const iface = new Interface(abi)
        return iface
    } catch (error) {
        console.error(error)
    }
}

async function loaadAllTransferEvents() {
    const eventFilter = contract.filters.Transfer();
    const from = 0;
    const to = 'latest';

    console.log("load all past transfer events");
    const events = await contract.queryFilter(eventFilter, from, to);
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
        let li = document.createElement("li");
        li.innerText = `ID: ${device}`;
        deviceList.appendChild(li);
    }
}

window.addEventListener("load", async () => {
    console.log("Loaded");
    await integrateMetaMask();
    contract = new ethers.Contract(
        contractAddress,
        await readABIJson(),
        signer
    );
    const devices = Array.from(await allExistingDeviceIds());
    console.log(devices);
    addDevicesToList(devices);
});