"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
    id: number
    x: number
    size: number
    opacity: number
    delay: number
}

interface BassParticlesProps {
    bassLevel: number
    isPlaying: boolean
    threshold?: number
    maxParticles?: number
    color?: string
    containerWidth?: number
    containerHeight?: number
}

/**
 * Bass Particles - Floating particle effects triggered by bass frequencies
 * 
 * Creates an "anti-gravity" effect where particles rise slowly from the bottom
 * when bass frequencies hit a certain threshold. Uses the Burnt Orange color palette.
 */
export function BassParticles({
    bassLevel,
    isPlaying,
    threshold = 0.6,
    maxParticles = 12,
    color = "#C84C21", // Burnt Orange
    containerWidth = 400,
    containerHeight = 200,
}: BassParticlesProps) {
    const [particles, setParticles] = useState<Particle[]>([])
    const [nextId, setNextId] = useState(0)

    // Spawn new particles when bass hits threshold
    const spawnParticle = useCallback(() => {
        const newParticle: Particle = {
            id: nextId,
            x: Math.random() * containerWidth,
            size: Math.random() * 6 + 3,
            opacity: Math.random() * 0.4 + 0.3,
            delay: Math.random() * 0.3,
        }

        setParticles(prev => {
            const updated = [...prev, newParticle]
            // Limit total particles
            if (updated.length > maxParticles) {
                return updated.slice(-maxParticles)
            }
            return updated
        })
        setNextId(prev => prev + 1)
    }, [nextId, containerWidth, maxParticles])

    // Monitor bass level and spawn particles
    useEffect(() => {
        if (!isPlaying || bassLevel < threshold) return

        // Spawn particles based on bass intensity
        const intensity = Math.min(3, Math.floor((bassLevel - threshold) / 0.1) + 1)

        for (let i = 0; i < intensity; i++) {
            setTimeout(() => spawnParticle(), i * 100)
        }
    }, [bassLevel, isPlaying, threshold, spawnParticle])

    // Clean up particles that have finished animating
    const removeParticle = (id: number) => {
        setParticles(prev => prev.filter(p => p.id !== id))
    }

    if (!isPlaying) return null

    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ width: containerWidth, height: containerHeight }}
        >
            <AnimatePresence>
                {particles.map(particle => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            left: particle.x,
                            bottom: 0,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: color,
                            boxShadow: `0 0 ${particle.size * 2}px ${color}40`,
                        }}
                        initial={{
                            y: 0,
                            opacity: 0,
                            scale: 0.5
                        }}
                        animate={{
                            y: -containerHeight - 20,
                            opacity: [0, particle.opacity, particle.opacity, 0],
                            scale: [0.5, 1, 1, 0.3],
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            delay: particle.delay,
                            ease: "easeOut",
                        }}
                        onAnimationComplete={() => removeParticle(particle.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
