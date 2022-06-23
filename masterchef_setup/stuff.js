const { ethers } = require("ethers");
const { parseUnits } = require("ethers/lib/utils");
const { MasterChef, ScamCoin, RedDotToken, INFURA_API, } = require('./utils/constant')

const provider = new ethers.providers.JsonRpcProvider(INFURA_API)

const account1 = '0xF127Cad0f32B7C89D13d25C11a6E4aabe856d2D8' // address 1
const account2 = '0xe5f084144d8ff52b6FF61e5e5E551562B7bB270c' // address 2
const account3 = '0x1a66C89F7B324e2B0232598Eb869EF0866C59Eec' // address 3

const privateKey2 = '9164744f372f6a73c3788a5436ac0fbc58977df91b852eef53c1ef5250414b86' // Private key of account 2
const privateKey3 = '33a4f333350282866d0abcf4ff407f6366a82734fafe30fdbcefbc68663d81b7' // Private key of account 3

function connectMSCWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(MasterChef.contractAddress, MasterChef.contractABI, provider)
    const MSCWithSign = contract.connect(wallet)
    return MSCWithSign
}
function connectSAMWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(ScamCoin.contractAddress, ScamCoin.contractABI, provider)
    const SAMWithSign = contract.connect(wallet)
    return SAMWithSign
}
function connectRDXWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(RedDotToken.contractAddress, RedDotToken.contractABI, provider)
    const RDXWithSign = contract.connect(wallet)
    return RDXWithSign
}

const getRDXBalOfAcc2 = async () => {
    const RDXWithSign = connectRDXWithKey(privateKey2)
    const RDXBalOfAcc2 = (await RDXWithSign.balanceOf(account2))
    return (RDXBalOfAcc2 / 10 ** 12).toString()
}

const mintSAMToAcc2 = async () => {
    const SAMWithSign = connectSAMWithKey(privateKey2)
    let SAMBalOfAcc2 = await SAMWithSign.balanceOf(account2)
    if (SAMBalOfAcc2 > 0) {
        console.log("already mint coin")
    } else {
        await SAMWithSign.mint(account2, parseUnits("1000", 12))
        SAMBalOfAcc2 = await SAMWithSign.balanceOf(account2)
    }
    return SAMBalOfAcc2
}

const transferSAMFromAcc2ToAcc3 = async () => {
    const SAMWithSign = connectSAMWithKey(privateKey2)
    const transferSuccess = await SAMWithSign.transfer(account3, parseUnits("200", 12))
    return transferSuccess
}

const acc2acc3Bal = async () => {
    const SAMWithSign = connectSAMWithKey(privateKey2)
    const SAMBalOfAcc2 = await SAMWithSign.balanceOf(account2)
    const SAMBalOfAcc3 = await SAMWithSign.balanceOf(account3)
    console.log('SAM Balance acc2: ', SAMBalOfAcc2 / 10 ** 12)
    console.log('SAM Balance acc3: ', SAMBalOfAcc3 / 10 ** 12)

}
const transferOwnershipOfRDXFromAcc2ToMSC = async () => { // do one time
    const RDXWithSign = connectRDXWithKey(privateKey2)
    console.log('owner of RDX is account2: ', (await RDXWithSign.owner()) == account2)
    // await RDXWithSign.transferOwnership(MasterChef.contractAddress)
    console.log('owner of RDX is MasterChef', (await RDXWithSign.owner()) == MasterChef.contractAddress)
}

const addSAMToChef = async () => {
    const MSCWithSign = connectMSCWithKey(privateKey2)
    await MSCWithSign.add(200, ScamCoin.contractAddress, true)
}

const getPoolLength = async () => {
    const MSCWithSign = connectMSCWithKey(privateKey2)
    const poolLength = await MSCWithSign.poolLength()
    return poolLength
}

const main = async () => {
    console.log((await getPoolLength()).toString())
}

main()

function timeout(ms) {
    return new Promise((res) => {
        setTimeout(res(), ms)
    })
}