'use client'

import NavHeader from '@/components/ui/nav-header'
import LoadingScreen from '@/components/ui/loading-screen'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

// Mock data - replace with real data fetching
const mockStakerHistory = [
  { id: 1, viewer: "CryptoFan99", amount: 500, date: "2024-01-15", outcome: "win" },
  { id: 2, viewer: "BetMaster", amount: 200, date: "2024-01-14", outcome: "loss" },
  { id: 3, viewer: "LuckyStaker", amount: 1000, date: "2024-01-13", outcome: "win" },
]

// Aptos Logo component
const AptosLogo = () => (
  <svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2">
    <path d="M52.1071 57.8571H27.8929L20 40L40 8.57143L60 40L52.1071 57.8571Z" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M40 71.4286L27.8929 57.8571H52.1071L40 71.4286Z" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10" strokeLinejoin="round"/>
  </svg>
);

export default function StreamerDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [earnings, setEarnings] = useState(15750)
  const [totalStakers, setTotalStakers] = useState(127)
  const [activeStakers, setActiveStakers] = useState(42)
  const [isCashingOut, setIsCashingOut] = useState(false)
  const [txnHash, setTxnHash] = useState<string | null>(null)
  const [showTxnSuccess, setShowTxnSuccess] = useState(false)
  
  const { account, signAndSubmitTransaction } = useWallet()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleCashout = async () => {
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }
    
    setIsCashingOut(true)
    
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: "0x6d5363db550862fb6fdc64ce2a60ff59486a111d53576d3fd70f2c5ebd14b3b1::message_board::withdraw_all",
          functionArguments: [],
          typeArguments: []
        }
      });
      
      console.log("Cashout transaction successful:", response);
      
      // Store the transaction hash and show success popup
      setTxnHash(response.hash);
      setShowTxnSuccess(true);
      
      toast.success('Cashout successful!')
      
      // Auto-hide the popup after 10 seconds
      setTimeout(() => {
        setShowTxnSuccess(false);
      }, 10000);
      
    } catch (error) {
      console.error("Cashout transaction failed:", error);
      toast.error('Cashout failed. Please try again.')
    } finally {
      setIsCashingOut(false)
    }
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <motion.div 
        className="min-h-screen bg-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <NavHeader />
        
        <motion.div
          className="max-w-7xl mx-auto p-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Title */}
          <motion.h1
            variants={item}
            className="text-4xl font-bold mb-8"
          >
            Streamer Dashboard
          </motion.h1>

          {/* Earnings Card */}
          <motion.div
            variants={item}
            className="bg-gray-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Available Earnings</h2>
            <div className="flex items-center justify-between">
              <motion.div 
                className="text-5xl font-bold text-green-500"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                ${earnings.toLocaleString()}
              </motion.div>
              <motion.button
                onClick={handleCashout}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isCashingOut || !account}
              >
                {isCashingOut ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <AptosLogo />
                    Cashout
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={item}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Stakers</h3>
              <p className="text-2xl font-bold">{totalStakers}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Active Stakers</h3>
              <p className="text-2xl font-bold text-blue-500">{activeStakers}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Win Rate</h3>
              <p className="text-2xl font-bold text-green-500">62%</p>
            </div>
          </motion.div>

          {/* Staker History */}
          <motion.div
            variants={item}
            className="bg-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Staker Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="pb-4">Viewer</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Outcome</th>
                    <th className="pb-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStakerHistory.map((stake) => (
                    <tr key={stake.id} className="border-t border-gray-700">
                      <td className="py-4">{stake.viewer}</td>
                      <td className="py-4">${stake.amount}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          stake.outcome === 'win' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {stake.outcome}
                        </span>
                      </td>
                      <td className="py-4">{stake.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Transaction Success Popup */}
      <AnimatePresence>
        {showTxnSuccess && txnHash && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <div className="bg-green-800 text-white p-4 rounded-lg shadow-lg border border-green-700 max-w-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium flex items-center">
                      <AptosLogo />
                      Cashout Successful!
                    </p>
                    <p className="mt-1 text-sm text-green-200">Your cashout transaction has been submitted to the blockchain.</p>
                    <div className="mt-3">
                      <a 
                        href={`https://explorer.aptoslabs.com/txn/${txnHash}?network=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <AptosLogo />
                        View on Explorer
                      </a>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-green-800 rounded-md inline-flex text-green-200 hover:text-white focus:outline-none"
                      onClick={() => setShowTxnSuccess(false)}
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
