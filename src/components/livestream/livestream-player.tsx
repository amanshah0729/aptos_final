'use client'

import { useEffect, useRef, useState } from 'react'

interface LivestreamPlayerProps {
  videoUrl: string
  title: string
  startTime?: number
  endTime?: number
  onTimeUpdate?: (currentTime: number) => void
  className?: string
}

function getRandomStartTime(start: number = 0, end: number = 0): number {
  if (start >= end) return start
  return Math.floor(Math.random() * (end - start)) + start
}

export function LivestreamPlayer({ 
  videoUrl, 
  title, 
  startTime = 0, 
  endTime,
  onTimeUpdate,
  className = "w-full h-full relative"
}: LivestreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [randomStart] = useState(() => startTime)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = randomStart
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error)
      })
    }
  }, [randomStart])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (endTime && videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = randomStart
      }
      onTimeUpdate?.(videoRef.current.currentTime)
    }
  }

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover absolute inset-0"
        src={videoUrl}
        playsInline
        muted
        loop
        onTimeUpdate={handleTimeUpdate}
      />
      <div className="absolute top-2 right-2 z-10">
        <span className="px-2 py-1 text-sm font-semibold bg-red-600 text-white rounded">
          LIVE
        </span>
      </div>
    </div>
  )
} 