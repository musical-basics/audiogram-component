import { Composition } from "remotion";
import { AudiogramComposition, audiogramSchema } from "./AudiogramComposition";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Audiogram"
                component={AudiogramComposition}
                durationInFrames={30 * 24} // 24 seconds at 30fps
                fps={30}
                width={1920}
                height={1080}
                schema={audiogramSchema}
                defaultProps={{
                    audioSrc: "/audio.wav",
                    portraitSrc: "/images/carol-leone.png",
                    speakerName: "Dr Carol Leone",
                    speakerTitle: "SMU Meadows School of the Arts",
                    speakerRole: "Chair of Piano Studies",
                    captions: [
                        { start: 0, end: 4.6, text: "I often witness pianists place their hands for the first time on a keyboard that better suits their handspan." },
                        { start: 4.6, end: 7.5, text: "How often the pianist spontaneously bursts into tears..." },
                        { start: 7.5, end: 14.2, text: "A lifetime of struggling with a seemingly insurmountable problem vanishes in the moment they realize," },
                        { start: 14.2, end: 17.5, text: "it's not me that is the problem, it is the instrument." },
                        { start: 17.5, end: 20.0, text: "Following on that, the joy of possibility overwhelms them." },
                    ],
                }}
            />
        </>
    );
};
