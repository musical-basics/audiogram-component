"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { line, area, curveCatmullRom } from "d3-shape"

interface LiquidWaveformProps {
    frequencyData: Uint8Array
    isPlaying: boolean
    progress: number
    width?: number
    height?: number
    primaryColor?: string
    secondaryColor?: string
}

/**
 * Liquid Waveform - A smooth, organic audio visualizer using SVG and d3 curves
 * 
 * Instead of blocky rectangular bars, this renders a fluid spline curve
 * that morphs organically with the audio frequency data.
 */
export function LiquidWaveform({
    frequencyData,
    isPlaying,
    progress,
    width = 400,
    height = 60,
    primaryColor = "#C84C21", // Burnt Orange
    secondaryColor = "#d4cfc7", // Inactive color
}: LiquidWaveformProps) {
    // Convert frequency data to smooth curve points
    const { topPath, bottomPath, areaPath } = useMemo(() => {
        const points: [number, number][] = []
        const bottomPoints: [number, number][] = []
        const numBins = frequencyData.length

        // Create points for the waveform, mapping frequency to y-position
        for (let i = 0; i < numBins; i++) {
            const x = (i / (numBins - 1)) * width
            // Normalize frequency value (0-255) to height ratio
            const normalizedValue = frequencyData[i] / 255
            // Calculate amplitude with some base height
            const amplitude = isPlaying ? normalizedValue * (height * 0.7) : height * 0.15

            // Center point
            const centerY = height / 2

            // Create mirrored points for top and bottom wave
            points.push([x, centerY - amplitude / 2])
            bottomPoints.push([x, centerY + amplitude / 2])
        }

        // Create smooth curve generators using Catmull-Rom spline
        const lineGenerator = line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(curveCatmullRom.alpha(0.5))

        // Create area generator for the filled region
        const areaGenerator = area<[number, number]>()
            .x((d, i) => points[i][0])
            .y0((d, i) => bottomPoints[i][1])
            .y1((d, i) => points[i][1])
            .curve(curveCatmullRom.alpha(0.5))

        return {
            topPath: lineGenerator(points) || "",
            bottomPath: lineGenerator(bottomPoints) || "",
            areaPath: areaGenerator(points) || "",
        }
    }, [frequencyData, width, height, isPlaying])

    // Calculate the position for the progress mask
    const progressWidth = (progress / 100) * width

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
        >
            <defs>
                {/* Gradient for the active (played) portion */}
                <linearGradient id="waveGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity="0.9" />
                    <stop offset="50%" stopColor={primaryColor} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity="0.2" />
                </linearGradient>

                {/* Gradient for the inactive portion */}
                <linearGradient id="waveGradientInactive" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.1" />
                </linearGradient>

                {/* Clip paths for progress indicator */}
                <clipPath id="progressClipActive">
                    <rect x="0" y="0" width={progressWidth} height={height} />
                </clipPath>
                <clipPath id="progressClipInactive">
                    <rect x={progressWidth} y="0" width={width - progressWidth} height={height} />
                </clipPath>
            </defs>

            {/* Inactive (unplayed) portion of the wave */}
            <g clipPath="url(#progressClipInactive)">
                <motion.path
                    d={areaPath}
                    fill="url(#waveGradientInactive)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
                <motion.path
                    d={topPath}
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d={bottomPath}
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                />
            </g>

            {/* Active (played) portion of the wave */}
            <g clipPath="url(#progressClipActive)">
                <motion.path
                    d={areaPath}
                    fill="url(#waveGradientActive)"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        scale: isPlaying ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                        opacity: { duration: 0.3 },
                        scale: {
                            duration: 0.8,
                            repeat: isPlaying ? Infinity : 0,
                            ease: "easeInOut"
                        }
                    }}
                    style={{ transformOrigin: "center" }}
                />
                <motion.path
                    d={topPath}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d={bottomPath}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                />
            </g>

            {/* Optional glow effect for the active line */}
            {isPlaying && (
                <g clipPath="url(#progressClipActive)" opacity="0.4">
                    <motion.path
                        d={topPath}
                        fill="none"
                        stroke={primaryColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        filter="blur(4px)"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                </g>
            )}
        </svg>
    )
}
