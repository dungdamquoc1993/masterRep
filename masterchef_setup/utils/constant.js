const RDXabi = require('./RedDotToken.json')
const SAMabi = require('./ScamCoin.json')
const MSCabi = require('./MasterChef.json')

const MasterChef = {
    contractABI: MSCabi.abi,
    contractAddress: '0x3c00F4Ee213da896A661531057FE9796347511d8'
}

const ScamCoin = {
    contractABI: SAMabi.abi,
    contractAddress: '0x1B525beD1D7Ddab72C38948e7179bb59E615eDEE'
}

const RedDotToken = {
    contractABI: RDXabi.abi,
    contractAddress: '0xB16D9e39aC1BA43735e6F4a0404B1D35872Aea8C'
}

const INFURA_API = 'https://ropsten.infura.io/v3/8bf322110b8c4fbf87055c7fd3981adf'

module.exports = {
    MasterChef, ScamCoin, RedDotToken, INFURA_API
}