import { ethers } from 'ethers'

import { MasterChef, UNIToken, RDXToken, WJKToken } from './constant'
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
        contract = new ethers.Contract(RDXToken.contractAddress, RDXToken.contractABI, signer)
    } else if (contractName === 'WJK') {
        contract = new ethers.Contract(WJKToken.contractAddress, WJKToken.contractABI, signer)
    } else if (contractName === 'UNI') {
        contract = new ethers.Contract(UNIToken.contractAddress, UNIToken.contractABI, signer)
    }
    return contract
}