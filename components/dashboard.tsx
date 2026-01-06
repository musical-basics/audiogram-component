"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { MoreHorizontal, FileAudio, Edit, Trash2, Video, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

interface Project {
    id: string
    name: string
    date: string
    duration: string
    transcript: string
    audioFile: string | null
}

// Mock data for initial display
const MOCK_PROJECTS: Project[] = [
    {
        id: "1",
        name: "Dr Carol Leone - Interview Clip",
        date: "Jan 5, 2026",
        duration: "0:24",
        transcript: "I often witness pianists place their hands for the first time on a keyboard that better suits their handspan.",
        audioFile: "audio.wav",
    },
    {
        id: "2",
        name: "Piano Masterclass - Intro",
        date: "Jan 4, 2026",
        duration: "1:15",
        transcript: "Welcome everyone to this session...",
        audioFile: "masterclass-intro.mp3",
    },
    {
        id: "3",
        name: "Student Recital Feedback",
        date: "Jan 2, 2026",
        duration: "3:45",
        transcript: "Great dynamics in the second movement...",
        audioFile: null,
    },
]

export function Dashboard() {
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    const handleDelete = (id: string) => {
        setProjects(projects.filter((p) => p.id !== id))
    }

    const handleExport = (name: string) => {
        alert(`Starting export for "${name}"... (This is a mock action)`)
    }

    const handleTranscriptChange = (id: string, newText: string) => {
        setProjects(projects.map((p) =>
            p.id === id ? { ...p, transcript: newText } : p
        ))
    }

    const handleAudioUpload = (id: string, file: File | null) => {
        setProjects(projects.map((p) =>
            p.id === id ? { ...p, audioFile: file ? file.name : null } : p
        ))
    }

    const handleClearAudio = (id: string) => {
        setProjects(projects.map((p) =>
            p.id === id ? { ...p, audioFile: null } : p
        ))
    }

    const triggerFileInput = (id: string) => {
        fileInputRefs.current[id]?.click()
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                        <p className="text-gray-400 mt-2">Manage your audiograms and transcripts</p>
                    </div>
                    <Button className="bg-[#C84C21] hover:bg-[#a03d1a]">
                        New Project
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project.id} className="bg-[#2a2a2a] border-[#3a3a3a] text-white overflow-hidden transition-colors hover:border-[#4a4a4a]">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div className="space-y-1 flex-1 pr-2">
                                    <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400 text-xs">
                                        Edited {project.date}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#333] flex-shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px] bg-[#2a2a2a] border-[#3a3a3a] text-white">
                                        <DropdownMenuItem
                                            className="cursor-pointer hover:bg-[#3a3a3a] focus:bg-[#3a3a3a]"
                                            onClick={() => handleExport(project.name)}
                                        >
                                            <Video className="mr-2 h-4 w-4" />
                                            Export Video
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer text-red-500 hover:bg-[#3a3a3a] hover:text-red-400 focus:bg-[#3a3a3a] focus:text-red-400"
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Audio File Section */}
                                <div className="bg-[#222] rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Audio File</span>
                                        <span className="text-xs font-mono text-gray-500">{project.duration}</span>
                                    </div>
                                    {project.audioFile ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FileAudio className="h-4 w-4 text-[#C84C21] flex-shrink-0" />
                                                <span className="text-sm text-gray-300 truncate">{project.audioFile}</span>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs text-gray-400 hover:text-white hover:bg-[#333]"
                                                    onClick={() => triggerFileInput(project.id)}
                                                >
                                                    <Upload className="h-3 w-3 mr-1" />
                                                    Replace
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-[#333]"
                                                    onClick={() => handleClearAudio(project.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full h-9 border-dashed border-[#444] bg-transparent text-gray-400 hover:text-white hover:bg-[#333] hover:border-[#555]"
                                            onClick={() => triggerFileInput(project.id)}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload MP3
                                        </Button>
                                    )}
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        ref={(el) => { fileInputRefs.current[project.id] = el }}
                                        onChange={(e) => handleAudioUpload(project.id, e.target.files?.[0] || null)}
                                    />
                                </div>

                                {/* Editable Transcript Section */}
                                <div className="space-y-2">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Transcript</span>
                                    <Textarea
                                        value={project.transcript}
                                        onChange={(e) => handleTranscriptChange(project.id, e.target.value)}
                                        className="bg-[#222] border-[#333] text-gray-300 text-sm resize-none min-h-[80px] focus:border-[#C84C21] focus:ring-[#C84C21]/20"
                                        placeholder="Enter transcript text..."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end pt-2">
                                    <Link href={`/editor/${project.id}`}>
                                        <Button size="sm" className="bg-[#C84C21] hover:bg-[#a03d1a] text-white">
                                            <Edit className="h-3.5 w-3.5 mr-2" />
                                            Open Editor
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <div className="bg-[#222] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileAudio className="h-8 w-8 opacity-50" />
                        </div>
                        <p>No projects yet. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
