import React from "react";
import { AbsoluteFill } from "remotion";
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
  return (
    <AbsoluteFill style={{ backgroundColor: colors.primaryNight }}>
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
