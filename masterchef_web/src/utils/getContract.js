import { ethers } from 'ethers'

import { MasterChef, ScamCoin, RedDotToken } from './constant'
const { ethereum } = window

export const getContract = async (contractName) => {
    if (!ethereum) {
        alert('please install metamask˝')
    }
    let contract
    const provider = new ethers.providers.Web3Provider(ethereum)

    const signer = provider.getSigner()
    // console.log("Account address s:", await signer.getAddress());

    if (contractName === 'MSC') {
        contract = new ethers.Contract(MasterChef.contractAddress, MasterChef.contractABI, signer)
    } else if (contractName === 'RDX') {
        contract = new ethers.Contract(RedDotToken.contractAddress, RedDotToken.contractABI, signer)
    } else if (contractName === 'SAM') {
        contract = new ethers.Contract(ScamCoin.contractAddress, ScamCoin.contractABI, signer)
    }
    return contract
}