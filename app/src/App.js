import { ethers } from "ethers"
import { useEffect, useState } from "react"
import deploy from "./deploy"
import Escrow from "./Escrow"

const provider = new ethers.providers.Web3Provider(window.ethereum)

function getEscrows() {
  return JSON.parse(localStorage.getItem("escrows"))
}

function saveEscrows(escrows) {
  localStorage.setItem("escrows", JSON.stringify(escrows))
}

function clearEscrows() {
  localStorage.removeItem("escrows")
}

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve()
  await approveTxn.wait()
}

function App() {
  const [escrows, setEscrows] = useState(() => {
    return getEscrows() || []
  })
  const [account, setAccount] = useState()
  const [signer, setSigner] = useState()

  const [arbiter, setArbiter] = useState("")
  const [beneficiary, setBeneficiary] = useState("")
  const [depositAmount, setDepositAmount] = useState("")

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", [])

      setAccount(accounts[0])
      setSigner(provider.getSigner())
    }

    getAccounts()
  }, [account])

  useEffect(() => {
    saveEscrows(escrows)
  }, [escrows])

  async function newContract() {
    const value = ethers.utils.parseEther(depositAmount)
    const escrowContract = await deploy(signer, arbiter, beneficiary, value)
    await escrowContract.deployed()

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
    }

    setEscrows([...escrows, escrow])
  }

  const clearContracts = () => {
    clearEscrows()
    setEscrows([])
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" onChange={(e) => setArbiter(e.target.value)} />
        </label>

        <label>
          Beneficiary Address
          <input type="text" onChange={(e) => setBeneficiary(e.target.value)} />
        </label>

        <label>
          Deposit Amount (in Eth)
          <input
            type="text"
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault()

            newContract()
          }}
        >
          Deploy
        </div>
        <div className="button" onClick={clearContracts}>
          Clear contracts
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        {signer && (
          <div id="container">
            {escrows.map((escrow) => {
              return <Escrow key={escrow.address} {...escrow} signer={signer} />
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default App
