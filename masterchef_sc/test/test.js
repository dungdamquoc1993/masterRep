const { expect } = require("chai");
const { parseUnits } = require("ethers/lib/utils");
const { ethers } = require("hardhat");


describe("Masterchef Farming", function () {
  let mscContract, rdxContract, wjkContract
  let a0 = 0, a1 = 0, a2 = 0, a3 = 0
  beforeEach(async () => {
    const [b0, b1, b2, b3] = await ethers.getSigners()
    a0 = b0, a1 = b1, a2 = b2, a3 = b3

    const rdxFactory = await ethers.getContractFactory("RedDotToken");
    rdxContract = await rdxFactory.deploy();
    await rdxContract.deployed();

    const mscFactory = await ethers.getContractFactory("MasterChef");
    mscContract = await mscFactory.deploy(rdxContract.address, parseUnits("100", 12));
    await mscContract.deployed();

    const wjkFactory = await ethers.getContractFactory("WojakToken");
    wjkContract = await wjkFactory.deploy();
    await wjkContract.deployed();

    const uniFactory = await ethers.getContractFactory('UniToken');
    uniContract = await uniFactory.deploy();
    await uniContract.deployed();


    await rdxContract.connect(a0).transfer(mscContract.address, parseUnits('10000000', 12))

    await wjkContract.mint(a0.address, parseUnits("1000", 12))
    await wjkContract.mint(a1.address, parseUnits("1000", 12))
    await wjkContract.mint(a2.address, parseUnits("1000", 12))
    await uniContract.mint(a0.address, parseUnits("1000", 12))
    await uniContract.mint(a1.address, parseUnits("5000", 12))
    await mscContract.add(100, wjkContract.address, true, "wjk")

    await wjkContract.connect(a0).approve(mscContract.address, parseUnits("200", 12))
    await wjkContract.connect(a1).approve(mscContract.address, parseUnits("200", 12))
    await wjkContract.connect(a2).approve(mscContract.address, parseUnits("200", 12))
    await uniContract.connect(a0).approve(mscContract.address, parseUnits("200", 12))
    await uniContract.connect(a1).approve(mscContract.address, parseUnits("200", 12))

  })
  it('test claim reward', async () => {
    await mscContract.connect(a0).deposit('wjk', parseUnits('100', 12))
    await uniContract.connect(a0).transfer(a1.address, parseUnits('1', 12))
    console.log((await mscContract.pendingRedDot('wjk', a0.address)) / 10 ** 12)
    await mscContract.connect(a0).claimReward('wjk', parseUnits('100', 12))
    console.log((await mscContract.pendingRedDot('wjk', a0.address)) / 10 ** 12)
    console.log((await rdxContract.balanceOf(a0.address))/ 10 **12)
  })
  // it("test case Anh Đức", async () => {
  //   console.log("reward per block = 100 RDX Token")
  //   console.log("")
  //   let tx = await mscContract.connect(a0).deposit('wjk', parseUnits('100', 12))
  //   console.log('block number: ', tx.blockNumber)
  //   console.log('token wjk user a0 deposit: ', (await mscContract.connect(a0).getUserAmountDeposit('wjk')) / 10 ** 12)
  //   for (let i = 0; i < 999; i++) {
  //     await uniContract.connect(a1).transfer(a2.address, parseUnits('1', 12))
  //   }
  //   tx = await mscContract.connect(a1).deposit('wjk', parseUnits('100', 12))
  //   console.log("")
  //   console.log('block number: ', tx.blockNumber)
  //   console.log('user a0 accumulated reawrd =', (await mscContract.pendingRedDot('wjk', a0.address)) / 10 ** 12)
  //   for (let i = 0; i < 999; i++) {
  //     await uniContract.connect(a1).transfer(a2.address, parseUnits('1', 12))
  //   }
  //   tx = await mscContract.connect(a2).deposit('wjk', parseUnits('50', 12))
  //   console.log("")
  //   console.log('block number: ', tx.blockNumber)
  //   console.log('user a0 accumulated reward =', (await mscContract.pendingRedDot('wjk', a0.address)) / 1e12)
  //   for (let i = 0; i < 999; i++) {
  //     await uniContract.connect(a1).transfer(a2.address, parseUnits('1', 12))
  //   }
  //   tx = await uniContract.connect(a1).transfer(a2.address, parseUnits('1', 12))
  //   console.log("")
  //   console.log('block number: ', tx.blockNumber)
  //   console.log('user a0 accumulated reward =', (await mscContract.pendingRedDot('wjk', a0.address)) / 1e12)
  //   console.log('user a1 accumulated reward =', (await mscContract.pendingRedDot('wjk', a1.address)) / 1e12)
  //   console.log('user a2 accumulated reward =', (await mscContract.pendingRedDot('wjk', a2.address)) / 1e12)

  // })
  // it("a1 deposit wjk twice to get RDX reward", async () => {
  //   expect(true).to.equal(true)
  //   // first deposit turn supply to 50 and
  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // first deposit

  //   await wjkContract.connect(a0).transfer(a2.address, parseUnits("50", 12))
  //   await wjkContract.balanceOf(a2.address)

  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // second deposit

  //   console.log('a1 WJK Balance', (await wjkContract.balanceOf(a1.address)) / 10 ** 12)
  //   console.log('a1 RDX Balance', (await rdxContract.balanceOf(a1.address)) / 10 ** 12)
  //   expect((await rdxContract.balanceOf(a1.address)) > 0).to.equal(true)
  //   expect(true).to.equal(true)
  // })

  // it("widthdraw Wojak and get RDX reward", async () => {
  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // deposit

  //   await wjkContract.connect(a0).transfer(a2.address, parseUnits("50", 12)) // transaction to generate new block
  //   await wjkContract.balanceOf(a2.address)

  //   await mscContract.connect(a1).withdraw('wjk', parseUnits("50", 12)) // withdraw

  //   console.log('a1 SCAM Balance', (await wjkContract.balanceOf(a1.address)) / 10 ** 12)
  //   console.log('a1 RDX Balance', (await rdxContract.balanceOf(a1.address)) / 10 ** 12)
  //   expect((await rdxContract.balanceOf(a1.address)) > 0).to.equal(true)
  // })

  // it("withdraw RDX reward", async () => {
  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // deposit update pool
  //   console.log("       after first deposit:")
  //   console.log("Chef RDX Bal:", (await mscContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward:', (await mscContract.pendingRedDot('wjk', a1.address)) / 10 ** 12)

  //   await mscContract.connect(a1).claimReward('wjk', parseUnits("7.5", 12)) // update pool get reward directly
  //   console.log("       after claim reward")
  //   console.log("Chef RDX Bal:", (await mscContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward', (await mscContract.pendingRedDot('wjk', a1.address)) / 10 ** 12)

  //   console.log("       a1 balance after all")
  //   console.log('a1 SCAM Balance', (await wjkContract.balanceOf(a1.address)) / 10 ** 12)
  //   console.log('a1 RDX Balance', (await rdxContract.balanceOf(a1.address)) / 10 ** 12)
  //   expect((await rdxContract.balanceOf(a1.address)) > 0).to.equal(true)
  // })

  // it("pending RDX reward", async () => {
  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // deposit update pool
  //   console.log("       after first deposit:")
  //   console.log("Chef RDX Bal:", (await mscContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward', (await mscContract.pendingRedDot('wjk', a1.address)) / 10 ** 12)

  //   await wjkContract.connect(a0).transfer(a2.address, parseUnits("25", 12))
  //   console.log("       after generate one block")
  //   console.log("Chef RDX Bal:", (await mscContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward', (await mscContract.pendingRedDot('wjk', a1.address)) / 10 ** 12)

  // })

  // it("user amount deposit token", async () => {
  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // deposit update pool
  //   console.log("Chef RDX Bal:", (await mscContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log("peding RDX reward", (await mscContract.pendingRedDot('wjk', a1.address)) / 10 ** 12)
  //   console.log((await mscContract.connect(a1).getUserAmountDeposit('wjk')) / 10 ** 12)
  // })

  // it("add more pool", async () => {
  //   await mscContract.connect(a1).deposit('wjk', parseUnits("50", 12)) // first deposit wjk

  //   await wjkContract.connect(a0).transfer(a2.address, parseUnits("50", 12))
  //   console.log('block1 a1 pending redDot', (await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12))

  //   await mscContract.add(100, uniContract.address, true, 'uni')
  //   console.log('block2 a1 pending redDot', (await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12))

  //   await mscContract.connect(a0).deposit('uni', parseUnits("50", 12)) //first deposit in uni
  //   console.log('block3 a1 pending redDot', (await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12))
  //   await mscContract.connect(a0).deposit('wjk', parseUnits("50", 12)) //first deposit in uni
  //   console.log('block4 a1 pending redDot', (await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12))
  //   await mscContract.connect(a0).deposit('wjk', parseUnits("50", 12)) //first deposit in uni
  //   // console.log('block5 a1 pending redDot', (await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12))
  //   // console.log('block6 a0 pending redDot', (await mscContract.pendingRedDot('wjk', a0.address) / 10 ** 12))
  //   // console.log('block7 a0 pending redDot', (await mscContract.pendingRedDot('uni', a0.address) / 10 ** 12))
  //   await wjkContract.connect(a0).transfer(a2.address, parseUnits("50", 12))
  //   // console.log('block5 a1 pending redDot', (await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12))
  //   // console.log('block6 a0 pending redDot', (await mscContract.pendingRedDot('wjk', a0.address) / 10 ** 12))
  //   // console.log('block7 a0 pending redDot', (await mscContract.pendingRedDot('uni', a0.address) / 10 ** 12))
  //   for (let i = 0; i < 300; i++) {
  //     await wjkContract.connect(a0).transfer(a2.address, parseUnits("1", 12))
  //   }
  //   const tx = await wjkContract.connect(a0).transfer(a2.address, parseUnits("1", 12))
  //   console.log(tx.blockNumber)
  //   console.log((await mscContract.pendingRedDot('wjk', a1.address) / 10 ** 12) + (await mscContract.pendingRedDot('wjk', a0.address) / 10 ** 12) + (await mscContract.pendingRedDot('uni', a0.address) / 10 ** 12))
  // })
})


// function timeout(ms) {
//   return new Promise((res) => {
//     setTimeout(res, ms)
//   })
// }

// describe("Masterchef Farming", function () {
//   let MasterChefContract, RedDotTokenConTract, ScamCoinContract, a0, a1, a2, a3

//   beforeEach(async () => {
//     // deploy scam coin owner = a0
//     // const ScamCoinFactory = await ethers.getContractFactory("ScamCoin");
//     // ScamCoinContract = await ScamCoinFactory.deploy();
//     // await ScamCoinContract.deployed();
//     // // deploy redot token owner = a0
//     // const RedDotTokenFactory = await ethers.getContractFactory("RedDotToken");
//     // RedDotTokenConTract = await RedDotTokenFactory.deploy();
//     // await RedDotTokenConTract.deployed();
//     // // deploy master chef owner = a0
//     // const MasterChefFactory = await ethers.getContractFactory("MasterChef");
//     // MasterChefContract = await MasterChefFactory.deploy(RedDotTokenConTract.address, "0xF127Cad0f32B7C89D13d25C11a6E4aabe856d2D8", parseUnits("10", 12), 5);
//     // await MasterChefContract.deployed();

//     [a0, a1, a2, a3] = await ethers.getSigners();

//     // await RedDotTokenConTract.transferOwnership(MasterChefContract.address)

//     // // add scam coin to masterchef
//     // await MasterChefContract.add(100, ScamCoinContract.address, true)
//     // // mint 1000 coin for a0
//     // await ScamCoinContract.mint(a0.address, parseUnits("1000", 12))
//     // // transfer from acc0 to acc1
//     // await ScamCoinContract.connect(a0).transfer(a1.address, parseUnits("200", 12))
//     // // allow masterchef speding money
//     // await ScamCoinContract.connect(a1).approve(MasterChefContract.address, parseUnits("200", 12))
//   })
// })

  // it('test RDX ownership', async () => {
  //   await MasterChefContract.transferRDXOwnerShip(a1.address)
  //   await RedDotTokenConTract.connect(a1).mint(a1.address, parseUnits("1000", 12))
  //   const RDXOwner = await RedDotTokenConTract.owner()
  //   console.log('a1 address: ', a1.address)
  //   console.log('RDXOwner address: ', RDXOwner)
  //   expect(a1.address).to.equal(RDXOwner)
  // })

  // it('test allow balance', async () => {
  //   const a1Bal = await ScamCoinContract.balanceOf(a1.address)
  //   console.log(a1Bal)
  // })

  // it("check balance RDX and SCAM of a0", async () => {
  //   const a0RDXBal = (await RedDotTokenConTract.balanceOf(a0.address)) / 10 ** 12
  //   const a0SCAMBal = (await ScamCoinContract.balanceOf(a0.address)) / 10 ** 12
  //   console.log('a0 RDX Balance: ', a0RDXBal)
  //   console.log('a0 SCAM Balance: ', a0SCAMBal)
  //   expect(a0RDXBal).to.equal(1000)
  //   expect(a0SCAMBal).to.equal(800)
  // })

  // it("a1 deposit SCAM twice to get RDX reward", async () => {
  //   // first deposit turn supply to 50 and
  //   await MasterChefContract.connect(a1).deposit(1, parseUnits("50", 12)) // first deposit

  //   await ScamCoinContract.connect(a0).transfer(a2.address, parseUnits("50", 12))
  //   await ScamCoinContract.balanceOf(a2.address)

  //   await MasterChefContract.connect(a1).deposit(1, parseUnits("50", 12)) // second deposit

  //   console.log('a1 SCAM Balance', (await ScamCoinContract.balanceOf(a1.address)) / 10 ** 12)
  //   console.log('a1 RDX Balance', (await RedDotTokenConTract.balanceOf(a1.address)) / 10 ** 12)
  //   expect((await RedDotTokenConTract.balanceOf(a1.address)) > 0).to.equal(true)
  // })

  // it("widthdraw SCAM and get RDX reward", async () => {
  //   await MasterChefContract.connect(a1).deposit(1, parseUnits("50", 12)) // deposit

  //   await ScamCoinContract.connect(a0).transfer(a2.address, parseUnits("50", 12)) // transaction to generate new block
  //   await ScamCoinContract.balanceOf(a2.address)

  //   await MasterChefContract.connect(a1).withdraw(1, parseUnits("50", 12)) // withdraw

  //   console.log('a1 SCAM Balance', (await ScamCoinContract.balanceOf(a1.address)) / 10 ** 12)
  //   console.log('a1 RDX Balance', (await RedDotTokenConTract.balanceOf(a1.address)) / 10 ** 12)
  //   expect((await RedDotTokenConTract.balanceOf(a1.address)) > 0).to.equal(true)
  // })

  // it("withdraw RDX reward", async () => {
  //   await MasterChefContract.connect(a1).deposit(1, parseUnits("50", 12)) // deposit update pool
  //   console.log("       after first deposit:")
  //   console.log("Chef RDX Bal:", (await MasterChefContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward:', (await MasterChefContract.pendingRedDot(1, a1.address)) / 10 ** 12)

  //   await MasterChefContract.connect(a1).claimReward(1, parseUnits("7.5", 12)) // update pool get reward directly
  //   console.log("       after claim reward")
  //   console.log("Chef RDX Bal:", (await MasterChefContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward', (await MasterChefContract.pendingRedDot(1, a1.address)) / 10 ** 12)

  //   console.log("       a1 balance after all")
  //   console.log('a1 SCAM Balance', (await ScamCoinContract.balanceOf(a1.address)) / 10 ** 12)
  //   console.log('a1 RDX Balance', (await RedDotTokenConTract.balanceOf(a1.address)) / 10 ** 12)
  //   expect((await RedDotTokenConTract.balanceOf(a1.address)) > 0).to.equal(true)
  // })

  // it("pending RDX reward", async () => {
  //   await MasterChefContract.connect(a1).deposit(1, parseUnits("50", 12)) // deposit update pool
  //   console.log("       after first deposit:")
  //   console.log("Chef RDX Bal:", (await MasterChefContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward', (await MasterChefContract.pendingRedDot(1, a1.address)) / 10 ** 12)

  //   await ScamCoinContract.connect(a0).transfer(a2.address, parseUnits("25", 12))
  //   console.log("       after generate one block")
  //   console.log("Chef RDX Bal:", (await MasterChefContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log('peding RDX reward', (await MasterChefContract.pendingRedDot(1, a1.address)) / 10 ** 12)

  // })

  // it("user amount deposit token", async () => {
  //   await MasterChefContract.connect(a1).deposit(1, parseUnits("50", 12)) // deposit update pool
  //   console.log("Chef RDX Bal:", (await MasterChefContract.connect(a1).getRDXBalance()) / 10 ** 12)
  //   console.log("peding RDX reward", (await MasterChefContract.pendingRedDot(1, a1.address)) / 10 ** 12)
  //   console.log((await MasterChefContract.connect(a1).getUserAmountDeposit(1)) / 10 ** 12)
  // })

// })




// describe("Transactions", function () {
//   it("Deploy contract and test function", async function () {
//     const transactionsFactory = await hre.ethers.getContractFactory("Transactions");
//     const transactionsContract = await transactionsFactory.deploy();
//     await transactionsContract.deployed();

//     expect(transactionsContract.address).to.equal('0x5FbDB2315678afecb367f032d93F642f64180aa3')

//     let g = await transactionsContract.foo()
//     let gWait = await g.wait()
//     let log1 = gWait.logs[0].data
//     let log2 = gWait.logs[1].data
//     const abiDecoder = new ethers.utils.AbiCoder();
//     log1 = abiDecoder.decode(['string'],log1)
//     log2 = abiDecoder.decode(['string'],log2)
//     console.log(log1)
//     console.log(log2)
//   });
// });

