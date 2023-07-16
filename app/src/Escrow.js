import { useEffect, useState, useMemo } from "react"
import { ethers } from "ethers"
import EscrowContract from "./artifacts/contracts/Escrow.sol/Escrow"

function createContract(address, abi, signer) {
  return new ethers.Contract(address, abi, signer)
}

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  signer,
}) {
  const [isApproved, setIsApproved] = useState(null)
  const contract = useMemo(
    () => createContract(address, EscrowContract.abi, signer),
    []
  )

  useEffect(() => {
    const checkApproved = async () => {
      const approved = await contract.isApproved()
      setIsApproved(approved)
    }
    contract.on("Approved", () => {
      setIsApproved(true)
    })
    checkApproved()
  }, [])

  const handleApprove = async () => {
    const tx = await contract.approve()
    await tx.wait()
  }

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {ethers.utils.formatEther(value)} ETH</div>
        </li>
        {isApproved === false && (
          <div className="button" id={address} onClick={handleApprove}>
            Approve
          </div>
        )}
        {isApproved === true && (
          <div className="complete">✓ It's been approved!</div>
        )}
      </ul>
    </div>
  )
}
