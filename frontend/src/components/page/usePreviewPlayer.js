import { useCallback, useEffect, useRef, useState } from 'react'

export default function usePreviewPlayer(songs) {
  const audioRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(() => (songs && songs.length ? 0 : null))
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = 'metadata'
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
      })
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime || 0)
      })
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  const toggle = useCallback((index) => {
    const song = songs[index]
    if (!song) return
    if (!song.previewUrl) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlaying(false)
      setCurrentIndex(index)
      return
    }
    const audio = ensureAudio()
    if (index === currentIndex) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
      return
    }
    audio.src = song.previewUrl
    setCurrentTime(0)
    setDuration(0)
    setCurrentIndex(index)
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [songs, currentIndex, isPlaying, ensureAudio])

  const seekTo = useCallback((seconds) => {
    const audio = ensureAudio()
    if (!Number.isFinite(seconds)) return
    const max = Number.isFinite(audio.duration) ? audio.duration : 0
    audio.currentTime = Math.min(Math.max(seconds, 0), max)
    setCurrentTime(audio.currentTime || 0)
  }, [ensureAudio])

  const stop = useCallback(() => {
    if (audioRef.current) audioRef.current.pause()
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentIndex(null)
  }, [])

  return { currentIndex, isPlaying, currentTime, duration, toggle, seekTo, stop }
}
