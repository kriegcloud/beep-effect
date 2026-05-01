import {
  ExtractFramesRequest,
  type ExtractFramesResult,
  FFmpeg,
  FFmpegError,
  type FFmpegEvent,
  type FFmpegEventSink,
  type FFmpegShape,
  ProbeVideoRequest,
  type VideoProbe,
} from "@beep/ffmpeg";
import type { Effect, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "tstyche";

declare const service: FFmpegShape;
declare const sink: FFmpegEventSink;

describe("@beep/ffmpeg", () => {
  it("exports typed errors and the service layer", () => {
    expect(new FFmpegError({ message: "boom", operation: "extractFrames" })).type.toBe<FFmpegError>();
    expect(FFmpegError.fromUnknown("probeVideo", "boom", { cause: new Error("nope") })).type.toBe<FFmpegError>();
    expect(FFmpeg.makeLayer()).type.toBe<
      Layer.Layer<
        FFmpeg,
        never,
        FileSystem.FileSystem | Path.Path | import("effect/unstable/process").ChildProcessSpawner.ChildProcessSpawner
      >
    >();
  });

  it("exports request, result, and event types", () => {
    const request = new ExtractFramesRequest({
      fps: 1,
      manifestPath: O.none(),
      outDir: "./frames",
      overwrite: false,
      prefix: O.none(),
      videoPath: "./clip.mp4",
    });

    expect(service.probeVideo(new ProbeVideoRequest({ videoPath: "./clip.mp4" }))).type.toBe<
      Effect.Effect<VideoProbe, FFmpegError>
    >();
    expect(service.extractFrames(request, sink)).type.toBe<Effect.Effect<ExtractFramesResult, FFmpegError>>();
    expect<FFmpegEvent["kind"]>().type.toBe<"completed" | "progress" | "started">();
  });
});
