"use client"

import { useEffect, useRef, useState, useCallback, RefObject } from "react"

interface AudioAnalyzerResult {
  frequencyData: Uint8Array
  bassLevel: number
  isAnalyzing: boolean
  connect: () => void
  disconnect: () => void
}

/**
 * Custom hook for real-time audio frequency analysis using Web Audio API
 * 
 * @param audioRef - Reference to the HTML audio element to analyze
 * @param fftSize - Size of the FFT (default: 128 for 64 frequency bins)
 * @returns Object containing frequency data, bass level, and control functions
 */
export function useAudioAnalyzer(
  audioRef: RefObject<HTMLAudioElement | null>,
  fftSize: number = 128
): AudioAnalyzerResult {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(() => new Uint8Array(fftSize / 2))
  const [bassLevel, setBassLevel] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isConnectedRef = useRef(false)

  // Generate simulated frequency data when no audio source is connected
  const generateSimulatedData = useCallback(() => {
    const data = new Uint8Array(fftSize / 2)
    const time = Date.now() / 1000

    for (let i = 0; i < data.length; i++) {
      // Create organic-looking wave patterns
      const baseFreq = Math.sin(time * 2 + i * 0.3) * 0.3 + 0.5
      const variation = Math.sin(time * 3.7 + i * 0.5) * 0.2
      const noise = (Math.random() - 0.5) * 0.1

      // Higher values for lower frequencies (bass emphasis)
      const frequencyFactor = 1 - (i / data.length) * 0.5

      data[i] = Math.floor(Math.max(0, Math.min(255,
        (baseFreq + variation + noise) * frequencyFactor * 200
      )))
    }

    return data
  }, [fftSize])

  // Analyze frequency data in real-time
  const analyze = useCallback(() => {
    if (!analyserRef.current) {
      // Use simulated data when not connected to a real audio source
      if (isAnalyzing) {
        const simData = generateSimulatedData()
        setFrequencyData(simData)

        // Calculate simulated bass level (average of first 4 bins)
        const bassSum = simData.slice(0, 4).reduce((a, b) => a + b, 0)
        setBassLevel(bassSum / (4 * 255))

        animationFrameRef.current = requestAnimationFrame(analyze)
      }
      return
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    setFrequencyData(dataArray)

    // Calculate bass level (average of first 4 frequency bins, typically 0-172Hz)
    const bassSum = dataArray.slice(0, 4).reduce((a, b) => a + b, 0)
    setBassLevel(bassSum / (4 * 255)) // Normalize to 0-1

    animationFrameRef.current = requestAnimationFrame(analyze)
  }, [isAnalyzing, generateSimulatedData])

  // Connect to audio element
  const connect = useCallback(() => {
    const audioElement = audioRef.current
    if (isConnectedRef.current || !audioElement) {
      // Start analyzing with simulated data even without audio element
      setIsAnalyzing(true)
      return
    }

    try {
      // Create AudioContext
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

      // Create and configure analyser
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = fftSize
      // CRITICAL: Balanced smoothing (0.75) to be reactive but not too twitchy
      analyserRef.current.smoothingTimeConstant = 0.75

      // Create source from audio element and connect
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)

      isConnectedRef.current = true
      setIsAnalyzing(true)
    } catch (error) {
      console.warn("Failed to connect audio analyzer, using simulated data:", error)
      // Fall back to simulated data
      setIsAnalyzing(true)
    }
  }, [audioRef, fftSize])

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    setIsAnalyzing(false)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  // Start/stop analysis loop based on isAnalyzing state
  useEffect(() => {
    if (isAnalyzing) {
      animationFrameRef.current = requestAnimationFrame(analyze)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isAnalyzing, analyze])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    frequencyData,
    bassLevel,
    isAnalyzing,
    connect,
    disconnect,
  }
}
