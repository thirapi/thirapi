"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BsSpotify } from "react-icons/bs"

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`
}

const NowPlaying = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const fetchNowPlaying = async () => {
    setError(null)
    try {
      const response = await axios.get("/api/get-playing")
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
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 rounded-xl shadow-2xl border border-gray-700/50">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="flex items-center gap-2 text-white">
            <BsSpotify className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold">Spotify</span>
          </div>
          <div className="w-8 h-8 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 rounded-xl shadow-2xl border border-red-900/30">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-400">
            <BsSpotify className="w-5 h-5" />
            <span className="text-sm font-semibold">Spotify</span>
          </div>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-colors duration-300">
      {data?.isPlaying ? (
        <div className="space-y-4">
          {/* Album Art */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={data.albumImageUrl || "/placeholder.svg"}
                alt={data.album}
                className="w-24 h-24 rounded-lg shadow-lg object-cover ring-1 ring-gray-700/50"
              />
            </div>

            {/* Track Details */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-2">
                <a href={data.songUrl} target="_blank" rel="noopener noreferrer" className="block group">
                  <h2 className="text-base font-bold text-white truncate group-hover:text-green-400 transition-colors duration-200">
                    {data.title}
                  </h2>
                </a>
                <p className="text-sm text-gray-300 truncate hover:text-gray-200 transition-colors">{data.artist}</p>
              </div>
              <p className="text-xs text-gray-400 truncate">{data.album}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="w-full bg-gray-700/50 rounded-full h-1 overflow-hidden ring-1 ring-gray-600/30">
              <div
                className="bg-gradient-to-r from-green-400 to-green-300 h-1 rounded-full transition-all duration-100"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(data.duration)}</span>
            </div>
          </div>

          {/* Spotify Badge */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-700/50">
            <BsSpotify className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-gray-400">Now Playing on Spotify</span>
          </div>
        </div>
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

export default NowPlaying