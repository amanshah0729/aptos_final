'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavHeader from '@/components/ui/nav-header'
import LoadingScreen from '@/components/ui/loading-screen'
import toast from 'react-hot-toast'

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
const mockWinHistory = [
  { id: 1, streamer: "Pokimane", amount: 500, date: "2024-01-15" },
  { id: 2, streamer: "xQc", amount: -200, date: "2024-01-14" },
  { id: 3, streamer: "Ninja", amount: 1000, date: "2024-01-13" },
]

export default function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState(2500)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleCashout = async () => {
    // Add cashout logic here
    toast.success('Cashout request submitted!')
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
            Viewer Dashboard
          </motion.h1>

          {/* Balance Card */}
          <motion.div
            variants={item}
            className="bg-gray-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Current Balance</h2>
            <motion.div 
              className="text-5xl font-bold text-green-500"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${balance.toLocaleString()}
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={item}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Staked</h3>
              <p className="text-2xl font-bold">$12,450</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Winnings</h3>
              <p className="text-2xl font-bold text-green-500">$15,780</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Win Rate</h3>
              <p className="text-2xl font-bold text-blue-500">58%</p>
            </div>
          </motion.div>

          {/* Win History */}
          <motion.div
            variants={item}
            className="bg-gray-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="pb-4">Streamer</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWinHistory.map((win) => (
                    <motion.tr 
                      key={win.id}
                      className="border-t border-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-4">{win.streamer}</td>
                      <td className={`py-4 ${win.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {win.amount >= 0 ? '+' : ''}{win.amount}
                      </td>
                      <td className="py-4 text-gray-400">{win.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}
