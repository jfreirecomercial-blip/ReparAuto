import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { RecarGaragePromo } from "./RecarGaragePromo";
import { format, scenes, TRANSITION_FRAMES } from "./theme";

// Six scenes joined by five overlapping cross-fades.
const sceneFrames = Object.values(scenes).reduce((a, b) => a + b, 0);
const TRANSITIONS = Object.keys(scenes).length - 1;
const DURATION = sceneFrames - TRANSITIONS * TRANSITION_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RecarGaragePromo"
      component={RecarGaragePromo}
      durationInFrames={DURATION}
      fps={format.fps}
      width={format.width}
      height={format.height}
    />
  );
};
