import React, { useEffect, useState } from 'react';
import './App.css';
import { useWeb3React } from '@web3-react/core'
import { Injected } from './connectors'
import { getContract } from './utils/getContract'
import { MasterChef, } from './utils/constant'
const { parseUnits } = require("ethers/lib/utils");


function App() {
  let [userAccount, setUserAccount] = useState<any>('')
  let [uniBalance, setUniBalance] = useState<any>(0)
  let [uniAllowBal, setUniAllowBal] = useState<any>(0)
  let [RDXPending, setRDXPending] = useState<any>(0)
  let [userRDXBal, setUserRDXBal] = useState<any>(0)
  let [userUNIBal, setUserUNIBal] = useState<any>(0)
  const { activate, account } = useWeb3React();
  const connectWallet = async () => {
    await activate(Injected)
  }

  const getUserUNIBal = async () => {
    const contract = await getContract('UNI')
    if (contract != null) {
      try {
        const balance = await contract.balanceOf(userAccount)
        setUserUNIBal(parseInt(balance.toString()) / 10 ** 12)
      } catch (error) {
        alert('get user UNI balance cause crash by system')
      }
    } else alert('get UNI contract failed')
  }

  const getUserRDXBal = async () => {
    const contract = await getContract('RDX')
    if (contract != null && userAccount) {
      try {
        const balance = await contract.balanceOf(userAccount)
        setUserRDXBal(parseInt(balance.toString()) / 10 ** 12)
      } catch (error) {
        alert('get user RDX balance cause crash by system')
      }
    } else alert('get RDX contract failed')
  }

  const getUniAllowBalance = async () => {
    const contract = await getContract('UNI')
    if (contract != null && userAccount) {
      try {
        const allowBalance = await contract.allowance(userAccount, MasterChef.contractAddress)
        const currentBalance = await contract.balanceOf(userAccount)
        const availableAmount = (currentBalance - allowBalance >= 0) ? allowBalance : currentBalance
        setUniAllowBal(parseInt((availableAmount / 10 ** 12).toString()))
      } catch (error) {
        alert('get uni allow balance cause crash by system')
      }
    } else alert('get UNI contract failed')
  }

  const getUniDepositBalance = async () => {
    const contract = await getContract('MSC')
    if (contract != null) {
      try {
        const balance = await contract.getUserAmountDeposit('uni')
        setUniBalance(parseInt(balance.toString()) / 10 ** 12)
      } catch (error) {
        alert('get UNI deposit balance cause crash from system')
      }
    } else alert('get MSC contract failed in getUniDepositBal')
  }

  const getRDXPending = async () => {
    const contract = await getContract('MSC')
    if (contract != null) {
      const RDXPending = await contract.pendingRedDot('uni', userAccount)
      setRDXPending(parseInt(RDXPending.toString()) / 10 ** 12)
    } else alert('get MSC contract failed in getRDXPending')
  }

  const [uniAllowAmount, setUniAllowAmount] = useState<any>(0)
  const approveUni = async () => { // should require userAccount
    const uniContract = await getContract('UNI')
    if (uniContract != null) {
      try {
        const approveSuccess = await uniContract.approve(MasterChef.contractAddress, parseUnits(uniAllowAmount.toString(), 12))
        if (approveSuccess) {
          alert('please wait about 30-45 seconds to deposit Uni')
        }
      } catch (error) {
        alert('approve Uni cause crash by system')
      }
    } else alert('get UNI contract failed')
  }

  const [uniDepositAmount, setUniDepositAmount] = useState<any>(0)
  const depositUni = async () => {
    if (!userAccount) {
      alert('please connect your meta mask wallet before do this stuff')
      return
    }
    const mscContract = await getContract('MSC')
    const uniContract = await getContract('UNI')
    if (mscContract != null && uniContract != null) {
      try {
        const availableUniToDeposit = await uniContract.allowance(userAccount, MasterChef.contractAddress)
        if (parseInt((availableUniToDeposit / 10 ** 12).toString()) >= uniDepositAmount) {
          const tx = await mscContract.deposit('uni', parseUnits(uniDepositAmount.toString(), 12))
          tx?.wait();
          alert('deposit success')
        } else {
          alert('your balance is insufficient')
        }
      } catch (error) {
        alert('deposit uni cause crash by system')
      }
    } else alert('get MSC or UNI contract failed in deposit')
  }
  const [uniWithdrawAmount, setUniWithdrawAmount] = useState<any>(0)
  const withdrawUni = async () => {
    const mscContract = await getContract('MSC')
    if (mscContract != null) {
      const availableAmount = await mscContract.getUserAmountDeposit('uni')
      if (uniWithdrawAmount - (parseInt(availableAmount.toString()) / 10 ** 12) <= 0) {
        try {
          await mscContract.withdraw('uni', parseUnits(uniWithdrawAmount.toString(), 12))
          alert('withdraw success wait 45-60 seconds to receive uni')
        } catch (error) {
          alert('withdraw Uni cause crash by system')
        }
      } else {
        alert('withdraw not good')
      }
    } else alert('get MSC contract failed in withdraw')
  }

  const [claimRewardAmount, setClaimRewardAmount] = useState<any>(0)
  const claimReward = async () => {
    const mscContract = await getContract('MSC')
    if (mscContract != null) {
      try {
        const pendingRDX = await mscContract.pendingRedDot('uni', userAccount)
        let claimAmountInSol = parseUnits(claimRewardAmount.toString(), 12)
        if (pendingRDX - claimAmountInSol >= 0) {
          debugger
          await mscContract.claimReward('uni', parseUnits(claimRewardAmount.toString(), 12))
          debugger
          alert('claim reward success wait 45-60 secons to receive reward')
        } else {
          alert('insufficinent balalnce')
        }
      } catch (error) {
        console.log(error)
        alert('claim reward cause crash by system')
      }
    } else alert('get MSC contract failed in claim reward')
  }

  const mintUni = async () => {
    const uniContract = await getContract('UNI')
    if (uniContract != null) {
      try {
        await uniContract.mint(userAccount, parseUnits('1000', 12))
        alert('mint success wait for 30-45 second to get uni token')
      } catch (error) {
        alert('mint Uni casue crash by system')
      }
    } else {
      alert('get uni contract failed')
    }
  }

  useEffect(() => {
    if (userAccount) {
      getUniDepositBalance()
      getUniAllowBalance()
      getRDXPending()
      getUserRDXBal()
      getUserUNIBal()
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
    <div style={{ padding: 20, flexDirection: 'row', display: 'flex' }}>
      <div style={{ minHeight: 200, padding: 50, flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'blue' }}>
          collect RDX by staking UNI Coin
        </h1>
        <p>
          Your account: {userAccount}
        </p>
        <p>Your RDX Balance: {userRDXBal} RDX</p>
        {!userAccount &&
          <button type="button" onClick={connectWallet} style={{ marginTop: 20 }} >
            <p>
              Connect Wallet
            </p>
          </button>}
        <p> Approve some UNI to deposit</p>
        <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '40%', display: 'flex' }}>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setUniAllowAmount(e.target.value)} />
          <button style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: 25, width: 60 }} type="button" onClick={approveUni} >
            <p>Submit</p>
          </button>
        </div>
        <h3>Uni available to deposit:{uniAllowBal} UNI</h3>

        <p > Deposit Uni:</p>
        <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '40%', display: 'flex' }}>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setUniDepositAmount(e.target.value)} />
          <button style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: 25, width: 60 }} type="button" onClick={depositUni} >
            <p>Submit</p>
          </button>
        </div>
        <p > Withdraw Uni:</p>
        <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '40%', display: 'flex' }}>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setUniWithdrawAmount(e.target.value)} />
          <button style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: 25, width: 60 }} type="button" onClick={withdrawUni} >
            <p>Submit</p>
          </button>
        </div>
        <h3>Your balance Uni in Pool: {uniBalance} UNI</h3>

        <p > claim reward (make sure your balance is sufficient): </p>
        <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '40%', display: 'flex' }}>
          <input style={{ marginRight: 10 }} type='number' onChange={(e) => setClaimRewardAmount(e.target.value)} />
          <button style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: 25, width: 60 }} type="button" onClick={claimReward} >
            <p>Submit</p>
          </button>

        </div>
        <h3>Your Pending Reddot token reward: {RDXPending} RDX</h3>
      </div>
      <div style={{ minHeight: 200, padding: 50, flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }} >
          <h1 style={{ color: 'blue', marginRight: 20 }}>
            Mint 1000 UNI for test
          </h1>
          <button style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: 25, width: 60 }} type="button" onClick={mintUni} >
            <p>mint </p>
          </button>
        </div>
        <p>Your UNI Balance: {userUNIBal} UNI</p>
      </div>
    </div>
  );
}

export default App;
