
const { parseUnits } = require("ethers/lib/utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const wjkFactory = await ethers.getContractFactory("WojakToken");
  wjkContract = await wjkFactory.deploy();
  await wjkContract.deployed();
  console.log('wjk contract deployed to: ', wjkContract.address)

  const uniFactory = await ethers.getContractFactory('UniToken');
  uniContract = await uniFactory.deploy();
  await uniContract.deployed();
  console.log('uni contract deployed to: ', uniContract.address)

  const rdxFactory = await ethers.getContractFactory("RedDotToken");
  rdxContract = await rdxFactory.deploy();
  await rdxContract.deployed();
  console.log('rdx contract deployed to: ', rdxContract.address)

  const mscFactory = await ethers.getContractFactory("MasterChef");
  mscContract = await mscFactory.deploy(rdxContract.address, parseUnits("100", 12));
  await mscContract.deployed();
  console.log('msc contract deployed to: ', mscContract.address)

}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

runMain()

// ropsten
// wjk contract deployed to:  0xcC3bC2a2080eE0154dC7688E0e5858f735a79d41
// uni contract deployed to:  0x06C9C35C8BD92F37e48024F85daCA0739454faf3
// rdx contract deployed to:  0xCb6d2Eb97BB9E9F2634e6ff3d476334d54E3458f
// msc contract deployed to:  0xcaE7B7ec5174d2380f49ADf93106cd420d77B460

// kovan
// wjk contract deployed to:  0x2d5054dB6977C4647A70d087F71C78564b347DbD
// uni contract deployed to:  0xd0234367B856278C0a6c109697e2506F2afC1103
// rdx contract deployed to:  0x8B6f5A7E549567162262fD5b13d5E4b6d8D0Ed02
// msc contract deployed to:  0xd91619A74Ed9705Ff8F963cdD4f9802858Cfbf23