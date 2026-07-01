import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Hook } from "./scenes/Hook";
import { Carros } from "./scenes/Carros";
import { Pecas } from "./scenes/Pecas";
import { Seguranca } from "./scenes/Seguranca";
import { Chat } from "./scenes/Chat";
import { CTA } from "./scenes/CTA";
import { scenes, TRANSITION_FRAMES, colors } from "./theme";

const transition = () => (
  <TransitionSeries.Transition
    timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
    presentation={fade()}
  />
);

/**
 * ~30s vertical promo for RecarGarage. Six scenes cross-faded together.
 * Total length is derived in `Root.tsx` from the same `scenes` durations.
 */
export const RecarGaragePromo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  // Music kicks in at the 7s mark; the first scenes play in silence.
  const musicStart = 7 * fps;
  const musicLength = durationInFrames - musicStart;
  const fadeIn = 0.6 * fps;
  const fadeOut = 1.5 * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.primaryNight }}>
      <Sequence from={musicStart}>
        <Audio
          src={staticFile("audio/rockit.mp3")}
          // Frame is relative to this Audio's start (frame 0 = the 7s mark).
          volume={(f) =>
            Math.min(
              interpolate(f, [0, fadeIn], [0, 0.7], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              interpolate(
                f,
                [musicLength - fadeOut, musicLength],
                [0.7, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            )
          }
        />
      </Sequence>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={scenes.hook}>
          <Hook />
        </TransitionSeries.Sequence>
        {transition()}
        <TransitionSeries.Sequence durationInFrames={scenes.carros}>
          <Carros />
        </TransitionSeries.Sequence>
        {transition()}
        <TransitionSeries.Sequence durationInFrames={scenes.pecas}>
          <Pecas />
        </TransitionSeries.Sequence>
        {transition()}
        <TransitionSeries.Sequence durationInFrames={scenes.seguranca}>
          <Seguranca />
        </TransitionSeries.Sequence>
        {transition()}
        <TransitionSeries.Sequence durationInFrames={scenes.chat}>
          <Chat />
        </TransitionSeries.Sequence>
        {transition()}
        <TransitionSeries.Sequence durationInFrames={scenes.cta}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
