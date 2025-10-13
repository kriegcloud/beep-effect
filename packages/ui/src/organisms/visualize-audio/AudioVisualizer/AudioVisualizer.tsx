import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import React, {
  type ForwardedRef,
  type ForwardRefExoticComponent,
  forwardRef,
  type RefAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { DataPoint } from "./types";
import { calculateBarData, draw } from "./utils";

class AudioVisualizerError extends Data.TaggedClass("AudioVisualizerError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

interface Props {
  /**
   * Audio blob to visualize
   */
  readonly blob: Blob;
  /**
   * Width of the visualizer
   */
  readonly width: number;
  /**
   * Height of the visualizer
   */
  readonly height: number;
  /**
   * Width of each individual bar in the visualization. Default: `2`
   */
  readonly barWidth?: number;
  /**
   * Gap between each bar in the visualization. Default: `1`
   */
  readonly gap?: number;
  /**
   * BackgroundColor for the visualization: Default: `"transparent"`
   */
  readonly backgroundColor?: string;
  /**
   * Color for the bars that have not yet been played: Default: `"rgb(184, 184, 184)""`
   */
  readonly barColor?: string;
  /**
   * Color for the bars that have been played: Default: `"rgb(160, 198, 255)""`
   */
  readonly barPlayedColor?: string;
  /**
   * Current time stamp till which the audio blob has been played.
   * Visualized bars that fall before the current time will have `barPlayerColor`, while that ones that fall after will have `barColor`
   */
  readonly currentTime?: number;
  /**
   * Custom styles that can be passed to the visualization canvas
   */
  readonly style?: React.CSSProperties;
  /**
   * A `ForwardedRef` for the `HTMLCanvasElement`
   */
  readonly ref?: React.ForwardedRef<HTMLCanvasElement>;
}

type ProcessBlobParams = {
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly barWidth: number;
  readonly gap: number;
  readonly backgroundColor: string;
  readonly barColor: string;
  readonly blob: Blob;
  readonly barPlayedColor: string;
  readonly setData: React.Dispatch<React.SetStateAction<Array<DataPoint>>>;
  readonly setDuration: React.Dispatch<React.SetStateAction<number>>;
  readonly height: number;
  readonly width: number;
};

const processBlob = Effect.fnUntraced(function* ({
  canvasRef,
  barWidth,
  gap,
  backgroundColor,
  barColor,
  barPlayedColor,
  blob,
  setData,
  setDuration,
  height,
  width,
}: ProcessBlobParams) {
  if (!canvasRef.current) return;

  if (!blob) {
    const barsData = Array.from({ length: 100 }, () => ({ max: 0, min: 0 }) as const);
    draw(barsData, canvasRef.current, barWidth, gap, backgroundColor, barColor, barPlayedColor);
    return;
  }

  const audioBuffer = yield* Effect.tryPromise({
    try: () => blob.arrayBuffer(),
    catch: (e) => new AudioVisualizerError({ message: "Failed to read blob", cause: e }),
  });

  const audioCtx = new AudioContext();

  yield* Effect.tryPromise({
    try: () =>
      audioCtx.decodeAudioData(audioBuffer, (buffer) => {
        if (!canvasRef.current) return;
        setDuration(buffer.duration);
        const barsData = calculateBarData(buffer, height, width, barWidth, gap);
        setData(barsData);
        draw(barsData, canvasRef.current, barWidth, gap, backgroundColor, barColor, barPlayedColor);
      }),
    catch: (e) => new AudioVisualizerError({ message: "Failed to decode audio data", cause: e }),
  });
});

const AudioVisualizer: ForwardRefExoticComponent<Props & RefAttributes<HTMLCanvasElement>> = forwardRef(
  (
    {
      blob,
      width,
      height,
      barWidth = 2,
      gap = 1,
      currentTime,
      style,
      backgroundColor = "transparent",
      barColor = "rgb(184, 184, 184)",
      barPlayedColor = "rgb(160, 198, 255)",
    }: Props,
    ref?: ForwardedRef<HTMLCanvasElement>
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [data, setData] = useState<DataPoint[]>([]);
    const [duration, setDuration] = useState<number>(0);

    useImperativeHandle<HTMLCanvasElement | null, HTMLCanvasElement | null>(ref, () => canvasRef.current, []);

    useEffect(() => {
      void Effect.runPromise(
        processBlob({
          canvasRef,
          barWidth,
          gap,
          backgroundColor,
          barColor,
          barPlayedColor,
          blob,
          setData,
          setDuration,
          height,
          width,
        })
      );
    }, [blob, canvasRef.current]);

    useEffect(() => {
      if (!canvasRef.current) return;

      draw(data, canvasRef.current, barWidth, gap, backgroundColor, barColor, barPlayedColor, currentTime, duration);
    }, [currentTime, duration]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          ...style,
        }}
      />
    );
  }
);

AudioVisualizer.displayName = "AudioVisualizer";

export { AudioVisualizer };
