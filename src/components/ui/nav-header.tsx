'use client'

import { WalletSelector } from '@/components/aptos/wallet-selector'
import { RiPokerSpadesFill } from 'react-icons/ri'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'

export default function NavHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="max-w-[2000px] w-full mx-auto">
      <div className="flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <RiPokerSpadesFill className="text-3xl" />
          <h1 className="text-2xl font-bold">Fuck The House!</h1>
        </Link>

        <div className="flex items-center gap-4">
          {/* Dashboard Dropdown */}
          <div className="relative">
            <motion.button
              className="btn btn-ghost"
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <Link 
                    href="/dashboard-viewer"
                    className="block px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Viewer Dashboard
                  </Link>
                  <Link 
                    href="/dashboard-streamer"
                    className="block px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Streamer Dashboard
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <WalletSelector />
        </div>
      </div>
    </div>
  )
} 