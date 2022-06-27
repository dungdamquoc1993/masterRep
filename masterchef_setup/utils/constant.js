const RDXabi = require('./RedDotToken.json')
const WJKabi = require('./WojakToken.json')
const UNIabi = require('./UniToken.json')
const MSCabi = require('./MasterChef.json')

const MasterChef = {
    contractABI: MSCabi.abi,
    contractAddress: '0xd91619A74Ed9705Ff8F963cdD4f9802858Cfbf23'
}

const WJKToken = {
    contractABI: WJKabi.abi,
    contractAddress: '0x2d5054dB6977C4647A70d087F71C78564b347DbD'
}

const UNIToken = {
    contractABI: UNIabi.abi,
    contractAddress: '0xd0234367B856278C0a6c109697e2506F2afC1103'
}

const RDXToken = {
    contractABI: RDXabi.abi,
    contractAddress: '0x8B6f5A7E549567162262fD5b13d5E4b6d8D0Ed02'
}

const INFURA_API = 'https://ropsten.infura.io/v3/8bf322110b8c4fbf87055c7fd3981adf'
const KOVAN_API = 'https://kovan.infura.io/v3/8bf322110b8c4fbf87055c7fd3981adf'

module.exports = {
    MasterChef, UNIToken, RDXToken, WJKToken, INFURA_API, KOVAN_API
}
