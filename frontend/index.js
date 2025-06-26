import { ethers } from 'ethers'

let signer = null
const contractAddress = '0x6Fd9cBC0442098AEdEaF1936992DE2222286562f'
let abi = []

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
    const response = fetch('./abi.json').then((response) => {
        return response.json()
    })

    console.log(response)

    const iface = new ethers.utils.Interface(response)
    console.log(iface.format(ethers.utils.FormatTypes.full))
}

readABIJson().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

// smart contract interaction
abi = [
    // 'function name() public view returns (string)',
    // 'function symbol() public view returns (string)',
    // 'function decimals() public view returns (uint8)',
    // 'function totalSupply() public view returns (uint256)',
    // 'function approve(address _spender, uint256 _value) public returns (bool success)',

    'function name() public view returns (string)',
]

// const res = require('./abi.json')

const contract = new ethers.Contract(contractAddress, abi, signer)

async function callSmartContract() {
    const contractName = await contract.name()
    console.log(contractName)
}
callSmartContract()

// const name = await USDTContract.name()
// const symbol = await USDTContract.symbol()
// const decimals = await USDTContract.decimals()
// const totalSupply = await USDTContract.totalSupply()

// console.log(
//     `${symbol} (${name}) total supply is ${ethers.utils.formatUnits(totalSupply, decimals)}`
// )

// const estimatedGasLimit = await USDTContract.estimateGas.approve(
//     'SOME_ADDRESS',
//     '1000000'
// ) // approves 1 USDT
// const approveTxUnsigned = await USDTContract.populateTransaction.approve(
//     'SOME_ADDRESS',
//     '1000000'
// )
// approveTxUnsigned.chainId = 1 // chainId 1 for Ethereum mainnet
// approveTxUnsigned.gasLimit = estimatedGasLimit
// approveTxUnsigned.gasPrice = await provider.getGasPrice()
// approveTxUnsigned.nonce = await provider.getTransactionCount(walletAddress)

// const approveTxSigned = await signer.signTransaction(approveTxUnsigned)
// const submittedTx = await provider.sendTransaction(approveTxSigned)
// const approveReceipt = await submittedTx.wait()
// if (approveReceipt.status === 0) throw new Error('Approve transaction failed')

// await USDTContract.approve('SOME_ADDRESS', '1000000')
