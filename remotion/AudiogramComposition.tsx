import React from "react";
import { z } from "zod";
import {
    AbsoluteFill,
    Audio,
    Img,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    staticFile,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

// Schema for props validation
export const audiogramSchema = z.object({
    audioSrc: z.string(),
    portraitSrc: z.string(),
    speakerName: z.string(),
    speakerTitle: z.string(),
    speakerRole: z.string(),
    captions: z.array(
        z.object({
            start: z.number(),
            end: z.number(),
            text: z.string(),
        })
    ),
});

type AudiogramProps = z.infer<typeof audiogramSchema>;

// Rainbow gradient colors for bars
const GRADIENT_COLORS = [
    "#ff5500", // Orange
    "#ffaa00", // Yellow-Orange
    "#ffdd00", // Yellow
    "#ff0080", // Pink
    "#b300ff", // Violet
    "#0066ff", // Blue
];

const getBarColor = (index: number, total: number) => {
    const position = index / total;
    const colorIndex = Math.floor(position * (GRADIENT_COLORS.length - 1));
    return GRADIENT_COLORS[colorIndex];
};

export const AudiogramComposition: React.FC<AudiogramProps> = ({
    audioSrc,
    portraitSrc,
    speakerName,
    speakerTitle,
    speakerRole,
    captions,
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const currentTime = frame / fps;

    // Get audio data for visualization
    const audioData = useAudioData(staticFile(audioSrc));

    // Find active caption
    const activeCaption = captions.find(
        (c) => currentTime >= c.start && currentTime < c.end
    );

    // Calculate progress
    const audioDuration = 24; // seconds
    const progress = (currentTime / audioDuration) * 100;

    // Generate frequency visualization
    const numBars = 64;
    let frequencyValues: number[] = new Array(numBars).fill(0);

    if (audioData) {
        const visualization = visualizeAudio({
            fps,
            frame,
            audioData,
            numberOfSamples: numBars,
        });
        frequencyValues = visualization;
    }

    // Caption animation
    const captionOpacity = activeCaption
        ? spring({
            frame: frame - Math.floor(activeCaption.start * fps),
            fps,
            config: { damping: 200 },
        })
        : 0;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
            }}
        >
            {/* Audio (plays during render) */}
            <Audio src={staticFile(audioSrc)} />

            {/* Main Card */}
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    maxWidth: 1500,
                    height: "auto",
                    aspectRatio: "16 / 9",
                    backgroundColor: "#faf8f5",
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
            >
                {/* Portrait Section */}
                <div
                    style={{
                        position: "relative",
                        width: "45%",
                        height: "100%",
                        flexShrink: 0,
                        overflow: "hidden",
                    }}
                >
                    <Img
                        src={staticFile(portraitSrc)}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                        }}
                    />
                    {/* Speaker Info Overlay */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "48px 32px 32px",
                            background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                            color: "white",
                        }}
                    >
                        <div style={{ fontSize: 48, fontWeight: 500, marginBottom: 8 }}>
                            {speakerName}
                        </div>
                        <div style={{ fontSize: 28, opacity: 0.8 }}>{speakerTitle}</div>
                        <div style={{ fontSize: 28, opacity: 0.8 }}>{speakerRole}</div>
                    </div>
                </div>

                {/* Content Section */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Caption Area */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "40px 48px",
                        }}
                    >
                        {activeCaption ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontSize: 44,
                                    lineHeight: 1.4,
                                    color: "#3d3d3d",
                                    opacity: captionOpacity,
                                    transform: `translateY(${interpolate(captionOpacity, [0, 1], [20, 0])}px)`,
                                }}
                            >
                                {activeCaption.text}
                            </div>
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontSize: 44,
                                    color: "#8a8a8a",
                                    opacity: 0.5,
                                }}
                            >
                                Press play to listen
                            </div>
                        )}
                    </div>

                    {/* Waveform Section */}
                    <div
                        style={{
                            backgroundColor: "#f5f2ed",
                            padding: "24px 32px",
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                        }}
                    >
                        {/* Play Button (static for video) */}
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                backgroundColor: "#C84C21",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: "16px solid white",
                                    borderTop: "10px solid transparent",
                                    borderBottom: "10px solid transparent",
                                    marginLeft: 4,
                                }}
                            />
                        </div>

                        {/* Waveform Bars */}
                        <div
                            style={{
                                flex: 1,
                                height: 80,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 3,
                            }}
                        >
                            {frequencyValues.map((value, i) => {
                                const barHeight = Math.max(4, value * 70);
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            width: 6,
                                            height: barHeight,
                                            borderRadius: 3,
                                            backgroundColor: getBarColor(i, numBars),
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                        style={{
                            height: 6,
                            width: "100%",
                            backgroundColor: "#e8e4de",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${progress}%`,
                                backgroundColor: "#C84C21",
                            }}
                        />
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
