"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Audiogram } from "@/components/audiogram"
import { ExportModal } from "@/components/export-modal"

function EditorContent() {
    const searchParams = useSearchParams()
    const [showExportModal, setShowExportModal] = useState(false)

    useEffect(() => {
        if (searchParams.get("export") === "true") {
            setShowExportModal(true)
        }
    }, [searchParams])

    return (
        <>
            <Audiogram />
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                projectName="Dr Carol Leone - Interview Clip"
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
