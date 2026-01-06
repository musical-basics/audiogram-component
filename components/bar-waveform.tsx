"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface BarWaveformProps {
    frequencyData: Uint8Array
    width?: number
    height?: number
}

export function BarWaveform({
    frequencyData,
    width = 600,
    height = 150,
}: BarWaveformProps) {
    // Memoize bars to avoid unnecessary recalculations
    const bars = useMemo(() => {
        // We only use the lower half of the frequency data as the high end is often empty
        // and we want fewer, wider bars for this aesthetic
        const sliceIndex = Math.floor(frequencyData.length * 0.75)
        const effectiveData = frequencyData.slice(0, sliceIndex)

        return Array.from(effectiveData).map((value, index) => {
            // Normalize value (0-255) to a height percentage
            // Use power function to make it look more dynamic (quiet sounds stay lower, loud ones pop more)
            const normalizedHeight = Math.pow(value / 255, 1.1)
            // Boost the height multiplier to make it fill the space better (was 0.9)
            const heightMultiplier = 1.2
            const barHeight = Math.min(height, Math.max(2, normalizedHeight * height * heightMultiplier))

            // Calculate simple x position
            const barWidth = (width / effectiveData.length) * 0.4 // Thinner bars (was 0.8)
            const x = index * (width / effectiveData.length)
            const y = (height - barHeight) / 2

            return { x, y, width: barWidth, height: barHeight, key: index }
        })
    }, [frequencyData, width, height])

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff5500" /> {/* Orange */}
                    <stop offset="20%" stopColor="#ffdd00" /> {/* Yellow */}
                    <stop offset="40%" stopColor="#ff0080" /> {/* Pink */}
                    <stop offset="60%" stopColor="#b300ff" /> {/* Violet */}
                    <stop offset="100%" stopColor="#0066ff" /> {/* Blue */}
                </linearGradient>
            </defs>

            {bars.map((bar) => (
                <motion.rect
                    key={bar.key}
                    x={bar.x + (width / bars.length - bar.width) / 2} // Center align in slot
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx={2} // Less round (was bar.width / 2)
                    fill="url(#rainbowGradient)"
                    animate={{
                        height: bar.height,
                        y: bar.y,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                    }}
                />
            ))}
        </svg>
    )
}
