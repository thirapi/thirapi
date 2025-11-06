"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BsSpotify } from "react-icons/bs"

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`
}

const NowPlayingDVD = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const fetchNowPlaying = async () => {
    setError(null)
    try {
      const response = await axios.get("/api/now-playing")
      setData(response.data)
      if (response.data?.isPlaying) {
        setProgress(response.data.progress)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNowPlaying()
    const dataFetchInterval = setInterval(fetchNowPlaying, 10000)
    const progressInterval = setInterval(() => {
      if (data?.isPlaying && progress < data?.duration) {
        setProgress((prev) => prev + 1000)
      }
    }, 1000)

    return () => {
      clearInterval(dataFetchInterval)
      clearInterval(progressInterval)
    }
  }, [data?.isPlaying, data?.duration])

  const calculateProgress = () => {
    return (progress / data?.duration) * 100
  }

  if (loading) {
    return (
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-3 py-8">
        <div className="flex items-center gap-2 text-white">
          <BsSpotify className="w-5 h-5 text-green-400" />
          <span className="text-sm font-semibold">Spotify</span>
        </div>
        <div className="w-8 h-8 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-400">
          <BsSpotify className="w-5 h-5" />
          <span className="text-sm font-semibold">Spotify</span>
        </div>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-8">
      {data?.isPlaying ? (
        <>
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Outer vinyl record frame */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl border-8 border-gray-800" />

            {/* Spinning album art */}
            <div
              className={`relative w-72 h-72 rounded-full overflow-hidden shadow-xl ${data?.isPlaying ? 'animate-spin-slow' : ''}`}>
              <img
                src={data.albumImageUrl || "/placeholder.svg"}
                alt={data.album}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center spindle */}
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg border-2 border-gray-600 z-10" />
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 z-10" />
          </div>

          {/* Track Details */}
          <div className="text-center space-y-2 max-w-md">
            <a href={data.songUrl} target="_blank" rel="noopener noreferrer" className="block group">
              <h2 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-200">
                {data.title}
              </h2>
            </a>
            <p className="text-lg text-gray-300">{data.artist}</p>
            <p className="text-sm text-gray-400">{data.album}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md space-y-2">
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden ring-1 ring-gray-600/30">
              <div
                className="bg-gradient-to-r from-green-400 to-green-300 h-2 rounded-full transition-all duration-100"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400 font-medium">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(data.duration)}</span>
            </div>
          </div>

          {/* Spotify Badge */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-700/50">
            <BsSpotify className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Now Playing on Spotify</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="flex items-center gap-2 text-gray-300">
            <BsSpotify className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold">Spotify</span>
          </div>
          <p className="text-sm text-gray-400 text-center">No track is currently playing.</p>
        </div>
      )}
    </div>
  )
}

export default NowPlayingDVD
