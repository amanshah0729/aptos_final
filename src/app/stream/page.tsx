'use client'

import { useEffect, useState, useRef } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { motion, AnimatePresence } from 'framer-motion'
import NavHeader from '@/components/ui/nav-header'
import { useSearchParams } from 'next/navigation'
import { LivestreamPlayer } from '@/components/livestream/livestream-player'
import { useStakingAptos } from '@/hooks/useStakingAptos'
import { VaultBalance } from '@/components/vault/vault-balance'
import { AptosClient, Types } from 'aptos'

// Sample chat messages to randomly pull from
const SAMPLE_MESSAGES = [
  // General reactions
  "Just joined the stream! 🎉",
  "This is getting intense 👀",
  "Can't believe what I'm seeing",
  "LETS GOOOOO",
  "🚀🚀🚀",
  "gg",
  "wow",
  "insane",
  "THIS IS IT",
  
  // Game-specific comments
  "Count going up fast",
  "Anyone else seeing this pattern?",
  "I'm calling 5 next",
  "It's gonna crash soon",
  "Hold strong everyone 💎",
  "Perfect timing to join",
  "Easy money today",
  "The trend is clear",
  "Who's winning so far?",
  
  // Questions and discussions
  "What's everyone's strategy?",
  "New meta?",
  "How long have you been playing?",
  "First time here, this is awesome",
  "Anyone else from yesterday's stream?",
  "What's the max today?",
  "Did anyone catch that last round?",
  
  // Reactions to events
  "Called it!",
  "No way!!",
  "That was close",
  "Big win incoming",
  "RIP to those who sold early",
  "Perfect exit",
  "Should have waited",
  "This is the way",
  
  // Emotes and short reactions
  "🔥",
  "💎🙌",
  "📈",
  "🎯",
  "👀",
  "🚀",
  "💪",
  "LFG!!!",
  "W",
];

const SAMPLE_USERNAMES = [
  // Gaming style names
  "Player123", "ProGamer99", "StreamNinja", "GamingLegend",
  // Crypto style names
  "CryptoWhale", "DiamondHands", "MoonWatcher", "Hodler_Pro",
  // Betting style names
  "LuckyStaker", "BetMaster", "WinnerCircle", "HighRoller",
  // Strategy style names
  "AlphaSeeker", "PatternHunter", "DataWizard", "TrendSpotter",
  // Fun names
  "Rocket_Man", "ChartWatcher", "CoolCat", "StreamLord",
  "BigBrain", "WiseTrader", "StatsGuru", "MathGenius"
];

const APT_USD_RATE = 8.25 // Current APT price in USD

const AptosLogo = () => (
  <svg width="16" height="16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2">
    <path d="M52.1071 57.8571H27.8929L20 40L40 8.57143L60 40L52.1071 57.8571Z" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M40 71.4286L27.8929 57.8571H52.1071L40 71.4286Z" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10" strokeLinejoin="round"/>
  </svg>
);

export default function StreamPage() {
  const searchParams = useSearchParams()
  const videoUrl = searchParams.get('videoUrl') || ''
  const title = searchParams.get('title') || ''
  const author = searchParams.get('author') || ''
  const startTime = Number(searchParams.get('startTime')) || 0
  const endTime = Number(searchParams.get('endTime')) || undefined
  const trueCount = Number(searchParams.get('trueCount')) || 0

  const [count, setCount] = useState<number>(0)
  const [messages, setMessages] = useState<Array<{ id: string; username: string; text: string; timestamp: Date }>>([])
  const [totalWinnings, setTotalWinnings] = useState<number>(0)
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [stakeAmount, setStakeAmount] = useState<number>(0.01)
  const [txnHash, setTxnHash] = useState<string | null>(null)
  const [showTxnSuccess, setShowTxnSuccess] = useState(false)
  
  // Add ref for chat container
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Add fake messages periodically
  useEffect(() => {
    const addMessage = () => {
      const randomMessage = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)]
      const randomUsername = SAMPLE_USERNAMES[Math.floor(Math.random() * SAMPLE_USERNAMES.length)]
      
      // Generate a truly unique ID using timestamp + random string
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      setMessages(prev => [
        ...prev.slice(-49),
        {
          id: uniqueId,
          username: randomUsername,
          text: randomMessage,
          timestamp: new Date()
        }
      ])
    }

    // Add initial messages
    for (let i = 0; i < 8; i++) {
      setTimeout(() => addMessage(), i * 200)
    }

    // Add new message every 0.5-2 seconds
    const interval = setInterval(() => {
      const delay = Math.random() * (2000 - 500) + 500 // Random delay between 0.5-2 seconds
      setTimeout(addMessage, delay)
    }, 1000)

    // Occasionally add burst of messages (simulating exciting moments)
    const burstInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of burst
        for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
          setTimeout(addMessage, i * 100)
        }
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(burstInterval)
    }
  }, [])

  const { mutate: stake, isPending } = useStakingAptos()
  const { account, signAndSubmitTransaction } = useWallet()

  const formatUSD = (apt: number) => {
    return (apt * APT_USD_RATE).toFixed(2)
  }

  // Function to call the staking smart contract
  const stakeOnContract = async (amount: number) => {
    if (!account) return;
    
    try {
      // Convert APT to octas (1 APT = 10^8 octas)
      const amountInOctas = Math.floor(amount * 100000000).toString();
      
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: "0x6d5363db550862fb6fdc64ce2a60ff59486a111d53576d3fd70f2c5ebd14b3b1::message_board::deposit",
          functionArguments: [amountInOctas],
          typeArguments: []
        }
      });
      
      console.log("Staking transaction successful:", response);
      
      // Store the transaction hash and show success popup
      setTxnHash(response.hash);
      setShowTxnSuccess(true);
      
      // Update UI or state as needed
      setTotalWinnings(prev => prev + amount * APT_USD_RATE);
      
      // Auto-hide the popup after 10 seconds
      setTimeout(() => {
        setShowTxnSuccess(false);
      }, 10000);
      
    } catch (error) {
      console.error("Staking transaction failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavHeader />
      <div className="flex-1 max-w-[2000px] w-full mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Main Stream Section */}
          <div className="lg:col-span-3 min-w-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full bg-gray-800 rounded-lg relative overflow-hidden"
            >
              <div className="absolute inset-0">
                <LivestreamPlayer 
                  videoUrl={videoUrl}
                  title={title}
                  startTime={startTime}
                  endTime={endTime}
                  className="w-full h-full relative"
                />
              </div>
              
              {/* Live Count Overlay */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-4 right-4 p-3 bg-gray-900/80 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">True Count:</span>
                  <span className={`text-xl font-mono ${trueCount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trueCount}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 min-w-0">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4 h-[calc(100vh-140px)] flex flex-col overflow-hidden"
            >
              {/* Player History Section */}
              <div className="bg-gray-800/50 rounded-lg p-4 shrink-0">
                <h2 className="text-xl font-bold mb-4">Player History</h2>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Total Winnings</div>
                  <div className="text-2xl font-bold text-green-400">
                    ${totalWinnings.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Chat Section */}
              <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col min-h-0 flex-1">
                <h2 className="text-xl font-bold mb-2 shrink-0">Live Chat</h2>
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto min-h-0 space-y-1 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                >
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: {
                            opacity: { duration: 0.2, ease: "easeOut" },
                            y: { duration: 0.2, ease: "easeOut" },
                            scale: { duration: 0.15, ease: "easeOut" }
                          }
                        }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                        className="bg-gray-700/50 py-1 px-2 rounded text-sm origin-bottom"
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            transition: { duration: 0.2, delay: 0.1 }
                          }}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-blue-400 font-medium">{msg.username}</span>
                            <span className="text-gray-400">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-white text-sm">{msg.text}</div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Chat Input and Stake Button Container */}
                <div className="shrink-0">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors text-sm">
                      Send
                    </button>
                  </div>

                  {/* Stake Button */}
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex flex-col space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsStakeModalOpen(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
                      >
                        <span className="flex items-center justify-center">
                          Place Your Stake
                        </span>
                      </motion.button>
                      <div className="flex items-center justify-center">
                        <VaultBalance />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      <AnimatePresence>
        {isStakeModalOpen && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStakeModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Place Your Stake</h3>
                  <button 
                    onClick={() => setIsStakeModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Preset Amount Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {[0.01, 0.05, 0.1].map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStakeAmount(amount)}
                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                          stakeAmount === amount 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{amount} APT</span>
                          <span className="text-xs text-gray-400">${formatUSD(amount)}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Custom Amount Input */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Custom amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(Number(e.target.value))}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter APT amount"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-right">
                        <span className="text-gray-400 block">APT</span>
                        <span className="text-xs text-gray-500 block">
                          ${formatUSD(stakeAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <VaultBalance />
                  
                  <div className="text-sm text-gray-400 text-center">
                    {!account && "Please connect your wallet to stake"}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      stakeOnContract(stakeAmount);
                      setIsStakeModalOpen(false);
                    }}
                    disabled={!account || isPending || !stakeAmount || stakeAmount < 0.01}
                  >
                    {isPending ? 'Processing...' : (
                      <div className="flex flex-col items-center">
                        <span className="flex items-center">
                          <AptosLogo />
                          Confirm Stake ({stakeAmount} APT)
                        </span>
                        <span className="text-sm text-blue-300">${formatUSD(stakeAmount)}</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                      Transaction Submitted!
                    </p>
                    <p className="mt-1 text-sm text-green-200">Your stake has been successfully submitted to the blockchain.</p>
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
    </div>
  )
}