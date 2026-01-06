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
        // This creates a webpack bundle of your React code required for rendering
        const bundled = await bundle({
            entryPoint: path.join(process.cwd(), "remotion/index.ts"),
            // In production, you'd cache this bundle to speed up subsequent renders
        });

        // 2. Select the composition
        const composition = await selectComposition({
            serveUrl: bundled,
            id: "Audiogram",
            inputProps: {
                // Pass dynamic props here based on the project
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

        // 3. Render the video
        const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "remotion-"));
        const finalOutput = path.join(tmpDir, "out.mp4");

        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: "h264",
            outputLocation: finalOutput,
            inputProps: composition.props, // Use props from selection
        });

        console.log(`Render complete: ${finalOutput}`);

        // 4. Read file and return response
        const fileBuffer = await fs.promises.readFile(finalOutput);

        // Clean up temp file (optional: keep for caching)
        // await fs.promises.unlink(finalOutput); 
        // await fs.promises.rmdir(tmpDir);



    } catch (err) {
        console.error("Render error:", err);
        return NextResponse.json(
            { error: "Failed to render video" },
            { status: 500 }
        );
    }
}
