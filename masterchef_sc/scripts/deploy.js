
const { parseUnits } = require("ethers/lib/utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {

  // const ScamCoinFactory = await ethers.getContractFactory("ScamCoin");
  // ScamCoinContract = await ScamCoinFactory.deploy();
  // await ScamCoinContract.deployed();
  // console.log("contract deployed to:", ScamCoinContract.address);

  // const RedDotTokenFactory = await ethers.getContractFactory("RedDotToken");
  // RedDotTokenConTract = await RedDotTokenFactory.deploy();
  // await RedDotTokenConTract.deployed();
  // console.log("contract deployed to:", RedDotTokenConTract.address);

  const MasterChefFactory = await ethers.getContractFactory("MasterChef");
  MasterChefContract = await MasterChefFactory.deploy("0xB16D9e39aC1BA43735e6F4a0404B1D35872Aea8C", "0xF127Cad0f32B7C89D13d25C11a6E4aabe856d2D8", parseUnits("10", 12), 0);
  console.log(MasterChefContract)
  await MasterChefContract.deployed();
  console.log("contract deployed to:", MasterChefContract);

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

// SAM address 0x1B525beD1D7Ddab72C38948e7179bb59E615eDEE
// const ScamCoinFactory = await ethers.getContractFactory("ScamCoin");
// ScamCoinContract = await ScamCoinFactory.deploy();
// await ScamCoinContract.deployed();

// RDX address 0xB16D9e39aC1BA43735e6F4a0404B1D35872Aea8C
// const RedDotTokenFactory = await ethers.getContractFactory("RedDotToken");
// RedDotTokenConTract = await RedDotTokenFactory.deploy();
// await RedDotTokenConTract.deployed();

// MSC address 0x3c00F4Ee213da896A661531057FE9796347511d8
// const MasterChefFactory = await ethers.getContractFactory("MasterChef");
// MasterChefContract = await MasterChefFactory.deploy(RedDotTokenConTract.address, "0xF127Cad0f32B7C89D13d25C11a6E4aabe856d2D8", 10, 14998129);
// await MasterChefContract.deployed();

