'use client'

import NavHeader from '@/components/ui/nav-header'
import LoadingScreen from '@/components/ui/loading-screen'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { LivestreamPlayer } from '@/components/livestream/livestream-player'

const videos = [
  { 
    id: 1, 
    title: "Im boutta make so much money", 
    author: "SlotMaster",
    videoUrl: "/videos/me.mp4",
    startTime: 10,
    endTime: 60,
    trueCount: 6
  },
  { 
    id: 2, 
    title: "fuck the houseeeeee", 
    author: "Dude Luck 23",
    videoUrl: "/videos/dudeLuck.mp4",
    startTime: 20,
    endTime: 80,
    trueCount: -3
  },
  { 
    id: 3, 
    title: "bet on me", 
    author: "Mr. Hand Pay",
    videoUrl: "/videos/mr.handPay.mp4",
    startTime: 30,
    endTime: 90,
    trueCount: 0
  },
  { 
    id: 4, 
    title: "holy shit im on a streak", 
    author: "Vegas Matt",
    videoUrl: "/videos/vegasMatt.mp4",
    startTime: 500,
    endTime: 1000,
    trueCount: 0
  },
  { 
    id: 5, 
    title: "screw casinos", 
    author: "Bro Wins",
    videoUrl: "/videos/broWins.mp4",
    startTime: 500,
    endTime: 1000,
    trueCount: 0
  },
  { 
    id: 6, 
    title: "top G on top", 
    author: "Vegas Gamblers",
    videoUrl: "/videos/vegasGamblers.mp4",
    startTime: 500,
    endTime: 1000,
    trueCount: 0
  },
]

// Move types outside component
interface Video {
  id: number
  title: string
  author: string
  videoUrl: string
  startTime: number
  endTime: number
  trueCount: number
}

// Move animation variants outside component
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

// Separate helper function
function getRandomShift(): number {
  return Math.floor(Math.random() * 4) - 2 || 1
}

export default function VideoFeed() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [videoStates, setVideoStates] = useState<Video[]>(videos)

  // Simplified loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1350)
    return () => clearTimeout(timer)
  }, [])

  // Optimized true count updates
  useEffect(() => {
    const intervals = videoStates.map((_, index) => 
      setInterval(() => {
        setVideoStates(prev => {
          const newStates = [...prev]
          newStates[index] = {
            ...newStates[index],
            trueCount: newStates[index].trueCount + getRandomShift()
          }
          return newStates
        })
      }, 5000 + Math.random() * 5000)
    )

    return () => intervals.forEach(clearInterval)
  }, [])

  const handleVideoClick = useCallback((video: Video, currentTime: number) => {
    const params = new URLSearchParams({
      videoUrl: video.videoUrl,
      title: video.title,
      author: video.author,
      startTime: String(currentTime),
      endTime: String(video.endTime),
      trueCount: String(video.trueCount)
    })
    router.push(`/stream?${params.toString()}`)
  }, [router])

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
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {videoStates.map((video) => (
            <motion.div
              key={video.id}
              variants={item}
              className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={(e) => handleVideoClick(video, video.startTime)}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-video bg-gray-900 relative">
              <LivestreamPlayer 
                videoUrl={video.videoUrl}
                title={video.title}
                startTime={video.startTime}
                endTime={video.endTime}
                onTimeUpdate={(currentTime) => {
                  video.startTime = currentTime;

                  // Only apply this logic for video ID 1
                  if (video.id === 1) {
                    const frameRate = 30; // Assume 30 FPS
                    const currentFrame = Math.floor(currentTime * frameRate);

                    // Log every 40th frame
                    if (currentFrame % 1 === 0) {
                      console.log(`Video 1, Frame: ${currentFrame}, Time: ${currentTime.toFixed(2)}s`);
                    }
                  }
                }}
              />

              </div>
              <motion.div 
                className="p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.3 } }}
              >
                <h2 className="font-semibold text-lg mb-1">{video.title}</h2>
                <p className="text-sm text-gray-400">{video.author}</p>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">True Count:</span>
                      <motion.span 
                        key={video.trueCount}
                        className={`font-mono text-lg ${video.trueCount >= 0 ? 'text-green-500' : 'text-red-500'}`}
                        initial={{ opacity: 0.5, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
                      >
                        {video.trueCount}
                      </motion.span>
                    </div>
                    <motion.button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleVideoClick(video, video.startTime)
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.3 } }}
                    >
                      Stake
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  )
}

