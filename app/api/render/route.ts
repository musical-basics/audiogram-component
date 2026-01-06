import { NextRequest, NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, transcript, audioFile } = body;

        console.log(`Starting render for project: ${name} (${id})`);

        // 1. Bundle the Remotion project
        const bundled = await bundle({
            entryPoint: path.join(process.cwd(), "remotion/index.ts"),
            // In production, you'd cache this bundle to speed up subsequent renders
        });

        // 2. Select the composition
        const composition = await selectComposition({
            serveUrl: bundled,
            id: "Audiogram",
            inputProps: {
                audioSrc: audioFile || "/audio.wav", // Fallback for mock
                portraitSrc: "/images/carol-leone.png", // Mock
                speakerName: name.split("-")[0].trim(),
                speakerTitle: "Featured Artist",
                speakerRole: "Pianist",
                captions: [
                    // Mock captions logic - in real app, parse the transcript
                    { start: 0, end: 24, text: transcript }
                ],
            },
        });

        // 3. Render the video to _output folder
        const outputDir = path.join(process.cwd(), "_output");
        if (!fs.existsSync(outputDir)) {
            await fs.promises.mkdir(outputDir, { recursive: true });
        }

        const fileName = `${name.replace(/\s+/g, "_")}-${id}.mp4`;
        const finalOutput = path.join(outputDir, fileName);

        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: "h264",
            outputLocation: finalOutput,
            inputProps: composition.props,
        });

        console.log(`Render complete: ${finalOutput}`);

        // 4. Return success response with file path
        return NextResponse.json({
            success: true,
            filePath: finalOutput
        });

    } catch (err) {
        console.error("Render error:", err);
        return NextResponse.json(
            { error: "Failed to render video" },
            { status: 500 }
        );
    }
}
