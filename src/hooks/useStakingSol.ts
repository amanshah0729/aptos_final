import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTransactionToast } from '@/components/ui/ui-layout'
import { Connection } from '@solana/web3.js'

// Make sure this matches your deployed program ID
const PROGRAM_ID = "8isGkdCJN84MgyqDSJP3q5zKWu8J66y24v29wkDBrSPT"

export function useStakingSol() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const transactionToast = useTransactionToast()

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!publicKey) throw new Error("Wallet not connected")

      try {
        // Ensure we're using devnet
        const devnetConnection = new Connection(clusterApiUrl('devnet'), 'confirmed')
        
        const programId = new PublicKey(PROGRAM_ID)
        
        const [vaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault")],
          programId
        )

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: vaultPda,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        )

        const latestBlockhash = await devnetConnection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = latestBlockhash.blockhash
        transaction.feePayer = publicKey

        const signature = await sendTransaction(transaction, devnetConnection)
        
        console.log("Transaction sent:", signature)
        
        const confirmation = await devnetConnection.confirmTransaction({
          signature,
          ...latestBlockhash
        }, 'confirmed')

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
        }

        return signature
      } catch (error: any) {
        console.error("Detailed error:", error)
        throw new Error(error.message || 'Failed to stake SOL')
      }
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      toast.success('Successfully staked SOL')
    },
    onError: (error: Error) => {
      console.error("Staking error:", error)
      toast.error(`Failed to stake: ${error.message}`)
    }
  })
} 