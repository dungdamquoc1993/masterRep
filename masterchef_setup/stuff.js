const { ethers } = require("ethers");
const { parseUnits } = require("ethers/lib/utils");
const { MasterChef, UNIToken, RDXToken, WJKToken, INFURA_API, KOVAN_API, RDLPToken } = require('./utils/constant')

const account1 = '0xF127Cad0f32B7C89D13d25C11a6E4aabe856d2D8' // address 1
const account2 = '0xe5f084144d8ff52b6FF61e5e5E551562B7bB270c' // address 2
const account3 = '0x1a66C89F7B324e2B0232598Eb869EF0866C59Eec' // address 3

const privateKey2 = '9164744f372f6a73c3788a5436ac0fbc58977df91b852eef53c1ef5250414b86' // Private key of account 2
const privateKey3 = '33a4f333350282866d0abcf4ff407f6366a82734fafe30fdbcefbc68663d81b7' // Private key of account 3

const provider = new ethers.providers.JsonRpcProvider(KOVAN_API)

function connectMSCWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(MasterChef.contractAddress, MasterChef.contractABI, provider)
    return contract.connect(wallet)
}
function connectUNIWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(UNIToken.contractAddress, UNIToken.contractABI, provider)
    return contract.connect(wallet)
}
function connectWJKWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(WJKToken.contractAddress, WJKToken.contractABI, provider)
    return contract.connect(wallet)
}
function connectRDXWithKey(privKey) {
    const wallet = new ethers.Wallet(privKey, provider)
    const contract = new ethers.Contract(RDXToken.contractAddress, RDXToken.contractABI, provider)
    return contract.connect(wallet)
}
function connectRDLPWithKey(privKey) {
    const wallet = new ethers.Wallet(prvKey, provider)
    const contract = new ethers.Contract(RDLPToken.contractAddress, RDLPToken.contractABI, provider)
    return contract.connect(wallet)
}

const transferRDXToChef = async () => {
    const contract = connectRDXWithKey(privateKey2)
    await contract.transfer(MasterChef.contractAddress, parseUnits('10000000', 12))
}

const getTokenBalance = async (tokenName, prvKey, address) => {
    let contract
    if (tokenName == 'wjk') contract = connectWJKWithKey(prvKey)
    else if (tokenName == 'uni') contract = connectRDXWithKey(prvKey)
    else if (tokenName == 'rdx') contract = connectRDXWithKey(prvKey)
    if (contract != null) {
        console.log((await contract.balanceOf(address)) / 10 ** 12)
    } else {
        console.log('cannot get contract')
    }
}

const depositUniToChef = async (uniDepositAmount) => {
    const uniContract = connectUNIWithKey(privateKey2)
    const mscContract = connectMSCWithKey(privateKey2)
    const availableUniToDeposit = await uniContract.allowance(account2, MasterChef.contractAddress)
    console.log('available Uni to deposit: ', (parseInt(availableUniToDeposit.toString()) / 10 ** 12) - uniDepositAmount >= 0)
    console.log('available Uni to deposit: ', parseInt((availableUniToDeposit / 10 ** 12).toString()) - uniDepositAmount >= 0)
    if ((parseInt(availableUniToDeposit.toString()) / 10 ** 12) - uniDepositAmount >= 0) {
        try {
            const tx = await mscContract.deposit(1, parseUnits(uniDepositAmount.toString(), 12))
            tx?.wait();
        } catch (error) {
            console.log('error: ', error)
        }
    } else console.log('insufficient balance')
}

const addUNIToPool = async () => {
    const mscContract = connectMSCWithKey(privateKey2)
    await mscContract.add(100, UNIToken.contractAddress, true, 'uni')

}

const addRDLPToPool = async () => {
    const mscContract = connectMSCWithKey(privateKey2)
    await mscContract.add(100, RDLPToken.contractAddress, true, 'rdlp')
}

const main = async () => {
    const mscContract = connectMSCWithKey(privateKey2)
    let poolNames = []
    let error = null
    let i = 0
    while (error == null) {
        try {
            const poolName = await mscContract.poolNames(i)
            poolNames.push(poolName)
            i+=1
        } catch (err) {
            error = err
        }
    }
    console.log(poolNames)

}

main()

function timeout(ms) {
    return new Promise((res) => {
        setTimeout(res(), ms)
    })
}













// const getRDXBalOfAcc2 = async () => {
//     const RDXWithSign = connectRDXWithKey(privateKey2)
//     const RDXBalOfAcc2 = (await RDXWithSign.balanceOf(account2))
//     return (RDXBalOfAcc2 / 10 ** 12).toString()
// }

// const mintSAMToAcc2 = async () => {
//     const SAMWithSign = connectSAMWithKey(privateKey2)
//     let SAMBalOfAcc2 = await SAMWithSign.balanceOf(account2)
//     if (SAMBalOfAcc2 > 0) {
//         console.log("already mint coin")
//     } else {
//         await SAMWithSign.mint(account2, parseUnits("1000", 12))
//         SAMBalOfAcc2 = await SAMWithSign.balanceOf(account2)
//     }
//     return SAMBalOfAcc2
// }

// const transferSAMFromAcc2ToAcc3 = async () => {
//     const SAMWithSign = connectSAMWithKey(privateKey2)
//     const transferSuccess = await SAMWithSign.transfer(account3, parseUnits("200", 12))
//     return transferSuccess
// }

// const acc2acc3Bal = async () => {
//     const SAMWithSign = connectSAMWithKey(privateKey2)
//     const SAMBalOfAcc2 = await SAMWithSign.balanceOf(account2)
//     const SAMBalOfAcc3 = await SAMWithSign.balanceOf(account3)
//     console.log('SAM Balance acc2: ', SAMBalOfAcc2 / 10 ** 12)
//     console.log('SAM Balance acc3: ', SAMBalOfAcc3 / 10 ** 12)

// }
// const transferOwnershipOfRDXFromAcc2ToMSC = async () => { // do one time
//     const RDXWithSign = connectRDXWithKey(privateKey2)
//     console.log('owner of RDX is account2: ', (await RDXWithSign.owner()) == account2)
//     // await RDXWithSign.transferOwnership(MasterChef.contractAddress)
//     console.log('owner of RDX is MasterChef', (await RDXWithSign.owner()) == MasterChef.contractAddress)
// }

// const addSAMToChef = async () => {
//     const MSCWithSign = connectMSCWithKey(privateKey2)
//     await MSCWithSign.add(200, ScamCoin.contractAddress, true)
// }

// const getPoolLength = async () => {
//     const MSCWithSign = connectMSCWithKey(privateKey2)
//     const poolLength = await MSCWithSign.poolLength()
//     return poolLength
// }

// const checkSamBal = async (address) => {
//     const SAMWithSign = connectSAMWithKey(privateKey2)
//     const balance = await SAMWithSign.balanceOf(address)
//     console.log(parseInt(balance.toString()) / 10 ** 12)
// }
// // await mscContract.withdraw(1, parseUnits(samWithdrawAmount.toString(), 12))
// const withdrawFromPool = async (unit, amount) => {
//     const MSCWithSign = connectMSCWithKey(privateKey2)
//     const bal = await MSCWithSign.getUserAmountDeposit(1)
//     if (parseInt(bal.toString()) / 10 ** 12 - amount >= 0) {
//         console.log(bal)
//         console.log(await MSCWithSign.withdraw(unit, amount))
//     }

// }