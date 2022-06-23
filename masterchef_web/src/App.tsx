import React, { useEffect, useState } from 'react';
import './App.css';
import { useWeb3React } from '@web3-react/core'
import { Injected } from './connectors'
import { getContract } from './utils/getContract'
import { MasterChef, } from './utils/constant'
const { parseUnits } = require("ethers/lib/utils");


function App() {
  let [userAccount, setUserAccount] = useState<any>('')
  let [samBalance, setSamBalance] = useState<any>(0)
  let [samAllowBal, setSamAllowBal] = useState<any>(0)
  let [RDXPending, setRDXPending] = useState<any>(0)
  let [userRDXBal, setUserRDXBal] = useState<any>(0)
  const { activate, account } = useWeb3React();
  const connectWallet = async () => {
    await activate(Injected)
  }

  const getUserRDXBal = async () => {
    const contract = await getContract('RDX')
    if (contract != null && userAccount) {
      const balance = await contract.balanceOf(userAccount)
      setUserRDXBal(parseInt(balance.toString()) / 10 ** 12)
    }
  }

  const getSamAllowBalance = async () => {
    const contract = await getContract('SAM')
    if (contract != null && userAccount) {
      const allowBalance = await contract.allowance(userAccount, MasterChef.contractAddress)
      const currentBalance = await contract.balanceOf(userAccount)
      const availableAmount = (currentBalance - allowBalance >= 0) ? allowBalance : currentBalance
      // console.log(currentBalance - allowBalance)
      // console.log('allow balalnce: ', allowBalance.toString())
      // console.log('current ballance', currentBalance.toString())
      // console.log('?', availableAmount.toString())
      setSamAllowBal(parseInt((availableAmount / 10 ** 12).toString()))
    }
  }

  const getSamDepositBalance = async () => {
    const contract = await getContract('MSC')
    if (contract != null) {
      const balance = await contract.getUserAmountDeposit(1)
      setSamBalance(parseInt(balance.toString()) / 10 ** 12)
    } else {
      alert('something went wrong')
    }
  }

  const getRDXPending = async () => {
    const contract = await getContract('MSC')
    if (contract != null) {
      const RDXPending = await contract.pendingRedDot(1, userAccount)
      setRDXPending(parseInt(RDXPending.toString()) / 10 ** 12)
    } else {
      alert('something went wrong')
    }
  }

  const [samAllowAmount, setSamAllowAmount] = useState<any>(0)
  const approveSam = async () => { // should require userAccount
    const samContract = await getContract('SAM')
    if (samContract != null) {
      const approveSuccess = await samContract.approve(MasterChef.contractAddress, parseUnits(samAllowAmount.toString(), 12))
      if (approveSuccess) {
        alert('please wait about 30-45 seconds to deposit Sam')
      }
    }
  }
  const [samDepositAmount, setSamDepositAmount] = useState<any>(0)
  const depositSam = async () => {
    const mscContract = await getContract('MSC')
    const samContract = await getContract('SAM')
    if (mscContract != null && samContract != null) {
      if (!userAccount) {
        alert('please connect your meta mask wallet before do this stuff')
        return
      }
      const availableSamToDeposit = await samContract.allowance(userAccount, MasterChef.contractAddress)
      if (parseInt((availableSamToDeposit / 10 ** 12).toString()) >= samDepositAmount) {
        const tx = await mscContract.deposit(1, parseUnits(samDepositAmount.toString(), 12))
        tx?.wait();
        alert('deposit success')
      } else {
        alert('your balance is insufficient')
      }
    }
  }
  const [samWithdrawAmount, setSamWithdrawAmount] = useState<any>(0)
  const withdrawSam = async () => {
    const mscContract = await getContract('MSC')
    if (mscContract != null) {
      const availableAmount = await mscContract.getUserAmountDeposit(1)
      if (samWithdrawAmount - (parseInt(availableAmount.toString()) / 10 ** 12) <= 0) {
        await mscContract.withdraw(1, parseUnits(samWithdrawAmount.toString(),12 ))
        alert('withdraw success wait 45-60 seconds to receive sam')
      } else {
        alert('withdraw not good')
      }
    }
  }
  const [claimRewardAmount, setClaimRewardAmount] = useState<any>(0)
  const claimReward = async () => {
    const mscContract = await getContract('MSC')
    if (mscContract != null) {
      const pendingRDX = await mscContract.pendingRedDot(1, userAccount)
      let claimAmountInSol = parseUnits(claimRewardAmount.toString(), 12)
      if (pendingRDX - claimAmountInSol >= 0) {
        await mscContract.claimReward(1, parseUnits(claimRewardAmount.toString(), 12))
        alert('claim reward success wait 45-60 secons to receive reward')
      } else {
        alert('insufficinent balalnce')
      }
    }
  }

  useEffect(() => {
    if (userAccount) {
      getSamDepositBalance()
      getSamAllowBalance()
      getRDXPending()
      getUserRDXBal()
    }
  }, [userAccount])
  useEffect(() => {
    if (account) {
      setUserAccount(account)
      if (window.localStorage.getItem('userAccount') !== account) {
        window.localStorage.setItem('userAccount', account)
      }
    }
  }, [account])
  useEffect(() => {
    if (window.localStorage.getItem('userAccount')) {
      connectWallet()
    }
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <main style={{ minHeight: 200, padding: 50, flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'blue' }}>
          collect RDX by staking SAM Coin
        </h1>
        <p>
          Your account: {userAccount}
        </p>
        <p>Your RDX Balance: {userRDXBal} RDX</p>

        <button type="button" onClick={connectWallet} style={{ marginTop: 20 }} >
          <p>
            Connect Wallet
          </p>
        </button>

        <div style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '40%' }}>
          <p> Approve some Sam to deposit</p>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setSamAllowAmount(e.target.value)} />
          <button type="button" onClick={approveSam} >
            <p>Submit</p>
          </button>
          <h3>Sam available to deposit:{samAllowBal} SAM</h3>
        </div>
        <div style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '40%' }}>
          <p > Deposit Sam:</p>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setSamDepositAmount(e.target.value)} />
          <button type="button" onClick={depositSam} >
            <p>Submit</p>
          </button>
        </div>
        <div style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '40%' }}>
          <p > Withdraw Sam:</p>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setSamWithdrawAmount(e.target.value)} />
          <button type="button" onClick={withdrawSam} >
            <p>Submit</p>
          </button>
          <h3>Your balance Sam in Pool: {samBalance} SAM</h3>
        </div>


        <div style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '40%' }}>
          <p > claim reward (make sure your balance is sufficient): </p>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setClaimRewardAmount(e.target.value)} />
          <button type="button" onClick={claimReward} >
            <p>Submit</p>
          </button>
          <h3>
            Your Pending Reddot token reward: {RDXPending} RDX
          </h3>
        </div>
      </main>


    </div>
  );
}

export default App;
