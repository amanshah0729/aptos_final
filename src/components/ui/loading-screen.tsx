'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RiPokerSpadesFill } from 'react-icons/ri'

interface LoadingScreenProps {
  isLoading: boolean
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Background glow effect */}
            <motion.div
              className="absolute inset-0 blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <RiPokerSpadesFill className="text-9xl text-blue-500/50" />
            </motion.div>

            {/* Main spade icon */}
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0, rotateZ: -180 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                opacity: [0, 1, 1],
                rotateZ: [0, 0, 0]
              }}
              exit={{ 
                scale: [1, 1.2, 0],
                opacity: [1, 1, 0],
                rotateZ: [0, 0, 180]
              }}
              transition={{ 
                duration: 1,
                times: [0, 0.5, 1],
                ease: "easeInOut"
              }}
            >
              <RiPokerSpadesFill className="text-9xl text-white" />
            </motion.div>

            {/* Pulsing overlay */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <RiPokerSpadesFill className="text-9xl text-white/30" />
            </motion.div>

            {/* Rotating particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 text-white/20"
                initial={{ opacity: 0, rotate: i * 90 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  rotate: [i * 90, i * 90 + 360],
                  scale: [0.5, 1.5, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              >
                <RiPokerSpadesFill className="text-6xl" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 