"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Video, X, Circle, Square, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportModalProps {
    isOpen: boolean
    onClose: () => void
    projectName: string
}

export function ExportModal({ isOpen, onClose, projectName }: ExportModalProps) {
    const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle")
    const [error, setError] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)

    const startRecording = useCallback(async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: "browser" } as MediaTrackConstraints,
                audio: true,
            })
            streamRef.current = stream

            const recorder = new MediaRecorder(stream, { mimeType: "video/webm" })
            mediaRecorderRef.current = recorder
            chunksRef.current = []

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            recorder.onstop = () => {
                setStatus("stopped")
            }

            // Handle user stopping share via browser UI
            stream.getVideoTracks()[0].onended = () => {
                if (mediaRecorderRef.current?.state === "recording") {
                    mediaRecorderRef.current.stop()
                }
            }

            recorder.start()
            setStatus("recording")
        } catch (err) {
            console.error("Recording error:", err)
            setError("Could not start recording. Please allow screen sharing.")
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop()
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
        }
    }, [])

    const downloadRecording = useCallback(() => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-export.webm`
        a.click()
        URL.revokeObjectURL(url)

        // Reset state
        setStatus("idle")
        chunksRef.current = []
        onClose()
    }, [projectName, onClose])

    const handleClose = useCallback(() => {
        if (status === "recording") {
            stopRecording()
        }
        setStatus("idle")
        setError(null)
        chunksRef.current = []
        onClose()
    }, [status, stopRecording, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md rounded-2xl bg-[#2a2a2a] p-6 shadow-2xl border border-[#3a3a3a]"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-[#C84C21]/20 flex items-center justify-center">
                                <Video className="h-8 w-8 text-[#C84C21]" />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-white">Export Video</h2>
                                <p className="text-gray-400 text-sm mt-1">{projectName}</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {status === "idle" && (
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">
                                        Click Start to begin screen recording. Your browser will ask you to share this tab.
                                    </p>
                                    <div className="bg-[#222] rounded-lg p-3 text-left text-xs text-gray-400 space-y-1">
                                        <p>💡 <strong className="text-gray-300">Tip:</strong> Select "Chrome Tab" and check "Share tab audio"</p>
                                        <p>📺 Make sure the audiogram is visible before starting</p>
                                    </div>
                                    <Button
                                        onClick={startRecording}
                                        className="w-full bg-[#C84C21] hover:bg-[#a03d1a] text-white"
                                    >
                                        <Circle className="h-4 w-4 mr-2 fill-current" />
                                        Start Recording
                                    </Button>
                                </div>
                            )}

                            {status === "recording" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-red-400">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        Recording in progress...
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Play your audiogram now. Click Stop when finished.
                                    </p>
                                    <Button
                                        onClick={stopRecording}
                                        variant="outline"
                                        className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                                    >
                                        <Square className="h-4 w-4 mr-2 fill-current" />
                                        Stop Recording
                                    </Button>
                                </div>
                            )}

                            {status === "stopped" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-green-400">
                                        <Loader2 className="h-4 w-4" />
                                        Recording complete!
                                    </div>
                                    <Button
                                        onClick={downloadRecording}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Video
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
