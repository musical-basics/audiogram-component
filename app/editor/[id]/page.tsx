"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Audiogram } from "@/components/audiogram"
import { ExportModal } from "@/components/export-modal"

function EditorContent() {
    const searchParams = useSearchParams()
    const [showExportModal, setShowExportModal] = useState(false)

    // Editor State
    const [projectData, setProjectData] = useState({
        name: "Dr Carol Leone",
        title: "SMU Meadows School of the Arts in Dallas, Texas",
        role: "Chair of Piano Studies",
        imageSrc: "/images/carol-leone.png",
        audioSrc: "/audio.wav"
    })

    useEffect(() => {
        if (searchParams.get("export") === "true") {
            setShowExportModal(true)
        }
    }, [searchParams])

    const handleUpdateImage = (file: File) => {
        const url = URL.createObjectURL(file)
        setProjectData(prev => ({ ...prev, imageSrc: url }))
    }

    const handleUpdateAudio = (file: File) => {
        const url = URL.createObjectURL(file)
        setProjectData(prev => ({ ...prev, audioSrc: url }))
    }

    return (
        <>
            <Audiogram
                initialData={projectData}
                onUpdateName={(name) => setProjectData(prev => ({ ...prev, name }))}
                onUpdateTitle={(title) => setProjectData(prev => ({ ...prev, title }))}
                onUpdateRole={(role) => setProjectData(prev => ({ ...prev, role }))}
                onUpdateImage={handleUpdateImage}
                onUpdateAudio={handleUpdateAudio}
            />
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                projectName={projectData.name + " - Interview Clip"}
            />
        </>
    )
}

export default function EditorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#2a2a2a]" />}>
            <EditorContent />
        </Suspense>
    )
}
