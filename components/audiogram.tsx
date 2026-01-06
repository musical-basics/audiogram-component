"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Upload, Image as ImageIcon, Music } from "lucide-react"
import { useAudioAnalyzer } from "@/hooks/use-audio-analyzer"
import { BarWaveform } from "./bar-waveform"
import { Button } from "./ui/button"

const captions = [
  {
    start: 0,
    end: 4.6,
    text: "I often witness pianists place their hands for the first time on a keyboard that better suits their handspan.",
  },
  { start: 4.6, end: 7.5, text: "How often the pianist spontaneously bursts into tears..." },
  {
    start: 7.5,
    end: 14.2,
    text: "A lifetime of struggling with a seemingly insurmountable problem vanishes in the moment they realize,",
  },
  { start: 14.2, end: 17.5, text: "it's not me that is the problem, it is the instrument." },
  { start: 17.5, end: 20.0, text: "Following on that, the joy of possibility overwhelms them." },
]

interface AudiogramProps {
  initialData?: {
    name: string
    title: string
    role: string
    imageSrc: string
    audioSrc: string
  }
  onUpdateName?: (name: string) => void
  onUpdateTitle?: (title: string) => void
  onUpdateRole?: (role: string) => void
  onUpdateImage?: (file: File) => void
  onUpdateAudio?: (file: File) => void
}

export function Audiogram({
  initialData = {
    name: "Dr Carol Leone",
    title: "SMU Meadows School of the Arts in Dallas, Texas",
    role: "Chair of Piano Studies",
    imageSrc: "/images/carol-leone.png",
    audioSrc: "/audio.wav"
  },
  onUpdateName,
  onUpdateTitle,
  onUpdateRole,
  onUpdateImage,
  onUpdateAudio
}: AudiogramProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(24)
  const [waveformWidth, setWaveformWidth] = useState(400)
  const [imageWidth, setImageWidth] = useState(300)

  // Local state for immediate feedback
  const [name, setName] = useState(initialData.name)
  const [title, setTitle] = useState(initialData.title)
  const [role, setRole] = useState(initialData.role)

  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformContainerRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const { frequencyData, bassLevel, connect, disconnect } = useAudioAnalyzer(
    audioRef,
    128 // FFT size: 64 frequency bins
  )

  // Update local state when initialData changes
  useEffect(() => {
    setName(initialData.name)
    setTitle(initialData.title)
    setRole(initialData.role)
  }, [initialData])

  // Measure container widths for responsive sizing
  useEffect(() => {
    const updateWidths = () => {
      if (waveformContainerRef.current) {
        setWaveformWidth(waveformContainerRef.current.offsetWidth - 32)
      }
      if (imageContainerRef.current) {
        setImageWidth(imageContainerRef.current.offsetWidth)
      }
    }

    updateWidths()
    window.addEventListener("resize", updateWidths)
    return () => window.removeEventListener("resize", updateWidths)
  }, [])

  const activeCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime < caption.end
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 24)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      disconnect()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [disconnect])

  const togglePlayPause = () => {
    const audio = audioRef.current

    if (isPlaying) {
      audio?.pause()
      disconnect()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } else {
      // Connect audio analyzer when playing
      connect()

      if (audio) {
        audio.play().catch(e => {
          console.error("Playback failed:", e)
          // Fallback to simulation if playback fails
          intervalRef.current = setInterval(() => {
            setCurrentTime((prev) => {
              if (prev >= duration) {
                if (intervalRef.current) clearInterval(intervalRef.current)
                setIsPlaying(false)
                disconnect()
                return 0
              }
              return prev + 0.1
            })
          }, 100)
        })
      }
    }
    setIsPlaying(!isPlaying)
  }

  const progress = (currentTime / duration) * 100

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#2a2a2a] p-4">
      <div
        className="relative flex w-full max-w-[1500px] overflow-hidden rounded-2xl bg-[#faf8f5] shadow-2xl"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Image Section - Left Side */}
        <div
          ref={imageContainerRef}
          className="relative h-full w-[45%] flex-shrink-0 overflow-hidden group cursor-pointer"
          onClick={() => imageInputRef.current?.click()}
        >
          <img
            src={initialData.imageSrc}
            alt={`${name} - ${role}`}
            className="h-full w-full object-cover object-top transition-opacity group-hover:opacity-90"
          />
          {/* Initials & Overlay for replace image */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex flex-col items-center text-white">
              <ImageIcon className="h-12 w-12 mb-2" />
              <span className="text-lg font-medium">Change Photo</span>
            </div>
          </div>
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0] && onUpdateImage) {
                onUpdateImage(e.target.files[0])
              }
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-6 py-6" onClick={(e) => e.stopPropagation()}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                onUpdateName?.(e.target.value)
              }}
              className="w-full bg-transparent text-4xl font-medium leading-snug text-white border-0 p-0 focus:ring-0 placeholder-white/50"
              placeholder="Speaker Name"
            />
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                onUpdateTitle?.(e.target.value)
              }}
              className="w-full bg-transparent text-2xl leading-snug text-white/80 border-0 p-0 focus:ring-0 mt-1 placeholder-white/40"
              placeholder="Title / Affiliation"
            />
            <input
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                onUpdateRole?.(e.target.value)
              }}
              className="w-full bg-transparent text-2xl leading-snug text-white/80 border-0 p-0 focus:ring-0 placeholder-white/40"
              placeholder="Role"
            />
          </div>
        </div>

        {/* Content Section - Right Side */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Caption Section */}
          <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8">
            <AnimatePresence mode="wait">
              {activeCaption ? (
                <motion.p
                  key={activeCaption.start}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full text-center font-serif text-3xl leading-relaxed text-[#3d3d3d] md:text-4xl"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {activeCaption.text}
                </motion.p>
              ) : (
                <motion.p
                  key="empty-caption"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="text-center font-serif text-3xl text-[#8a8a8a] md:text-4xl"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Press play to listen
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Liquid Waveform and Controls Section */}
          <div
            ref={waveformContainerRef}
            className="flex items-center gap-4 bg-[#f5f2ed] px-6 py-4"
          >
            {/* Play/Pause Button */}
            <motion.button
              onClick={togglePlayPause}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#C84C21] text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
              )}
            </motion.button>

            {/* Liquid Waveform Visualizer */}
            <div className="flex flex-1 items-center justify-center">
              <BarWaveform
                frequencyData={frequencyData}
                width={waveformWidth}
                height={60}
              />
            </div>

            {/* Replace Audio Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#8a8a8a] hover:text-[#C84C21]"
                title="Replace Audio"
                onClick={() => audioInputRef.current?.click()}
              >
                <Music className="h-5 w-5" />
              </Button>
              <input
                type="file"
                ref={audioInputRef}
                className="hidden"
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files?.[0] && onUpdateAudio) {
                    onUpdateAudio(e.target.files[0])
                    // Stop playback if playing
                    if (isPlaying) togglePlayPause()
                  }
                }}
              />
            </div>

          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#e8e4de]">
            <motion.div
              className="h-full bg-[#C84C21]"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} preload="metadata" src={initialData.audioSrc}>
        </audio>
      </div>
    </div>
  )
}
