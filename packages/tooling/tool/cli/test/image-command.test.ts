import { ExtractFramesManifest } from "@beep/ffmpeg";
import { imageCommand } from "@beep/repo-cli";
import { A, Str } from "@beep/utils";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Order, Path, pipe } from "effect";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer))
);
const runImageCommand = Command.runWith(imageCommand, { version: "0.0.0" });
const decodeManifest = S.decodeUnknownSync(S.fromJsonString(ExtractFramesManifest));

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();

      process.chdir(tmpDir);
      process.exitCode = 0;

      return { fs, previousCwd, tmpDir } as const;
    }),
    ({ tmpDir }) => use(tmpDir),
    ({ fs, previousCwd, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        process.exitCode = 0;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  ).pipe(Effect.provide(testLayer));

const withPathPrefix = <A, E, R>(pathPrefix: string, use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      const previousPath = process.env.PATH;
      process.env.PATH = `${pathPrefix}:${previousPath ?? ""}`;
      return previousPath;
    }),
    () => use,
    (previousPath) =>
      Effect.sync(() => {
        process.env.PATH = previousPath;
      })
  );

const sortedDirectoryEntries = Effect.fn("ImageTest.sortedDirectoryEntries")(function* (dir: string) {
  const fs = yield* FileSystem.FileSystem;
  return A.sort(yield* fs.readDirectory(dir), Order.String);
});

const writeFfprobeShim = Effect.fn("ImageTest.writeFfprobeShim")(function* (binDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const shimPath = path.join(binDir, "ffprobe");
  yield* fs.makeDirectory(binDir, { recursive: true });
  yield* fs.writeFileString(
    shimPath,
    `#!/usr/bin/env sh\nprintf '%s\\n' '{"streams":[{"width":4,"height":3,"duration":"2.0","avg_frame_rate":"30/1","nb_frames":"60"}],"format":{"duration":"2.0"}}'\n`
  );
  yield* fs.chmod(shimPath, 0o755);
});

const writeExtractFramesFfmpegShim = Effect.fn("ImageTest.writeExtractFramesFfmpegShim")(function* (
  binDir: string,
  argsPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const shimPath = path.join(binDir, "ffmpeg");
  yield* fs.makeDirectory(binDir, { recursive: true });
  yield* fs.writeFileString(
    shimPath,
    `#!/usr/bin/env sh
printf '%s\\n' "$@" > '${argsPath}'
last=''
for arg do last="$arg"; done
first="$(printf '%s\\n' "$last" | sed 's/%0[0-9][0-9]*d/00000/')"
second="$(printf '%s\\n' "$last" | sed 's/%0[0-9][0-9]*d/00001/')"
printf '%s\\n' 'frame zero' > "$first"
printf '%s\\n' 'frame one' > "$second"
printf '%s\\n' 'frame=1' 'progress=continue' 'frame=2' 'progress=end'
`
  );
  yield* fs.chmod(shimPath, 0o755);
});

describe.sequential("image command", () => {
  it("extracts frames, writes the default manifest, and prints a non-TTY summary", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const binDir = path.join(tmpDir, "bin");
          const argsPath = path.join(tmpDir, "ffmpeg-args.txt");
          const videoPath = path.join(tmpDir, "clip.mp4");
          const outDir = path.join(tmpDir, "frames");

          yield* fs.writeFileString(videoPath, "video");
          yield* writeFfprobeShim(binDir);
          yield* writeExtractFramesFfmpegShim(binDir, argsPath);
          yield* withPathPrefix(
            binDir,
            runImageCommand(["extract-frames", "--video", videoPath, "--out-dir", outDir, "--fps", "1"])
          );

          expect(yield* sortedDirectoryEntries(outDir)).toEqual([
            "clip_frame_00000.png",
            "clip_frame_00001.png",
            "extract-frames-manifest.json",
          ]);
          const manifest = decodeManifest(yield* fs.readFileString(path.join(outDir, "extract-frames-manifest.json")));
          expect(manifest.summary.frameCount).toBe(2);
          expect(manifest.options.fps).toBe(1);
          expect(manifest.options.prefix).toBe("clip_frame");
          expect(pipe(yield* fs.readFileString(argsPath), (value) => Str.includes("fps=1")(value))).toBe(true);
          expect(yield* TestConsole.logLines).toEqual([
            `image extract-frames: wrote 2 frame(s) to ${outDir}. manifest: ${path.join(outDir, "extract-frames-manifest.json")}`,
          ]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("fails instead of overwriting existing frame outputs without --overwrite", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const binDir = path.join(tmpDir, "bin");
          const argsPath = path.join(tmpDir, "ffmpeg-args.txt");
          const videoPath = path.join(tmpDir, "clip.mp4");
          const outDir = path.join(tmpDir, "frames");

          yield* fs.makeDirectory(outDir, { recursive: true });
          yield* fs.writeFileString(videoPath, "video");
          yield* fs.writeFileString(path.join(outDir, "clip_frame_00000.png"), "existing");
          yield* writeFfprobeShim(binDir);
          yield* writeExtractFramesFfmpegShim(binDir, argsPath);
          yield* withPathPrefix(
            binDir,
            runImageCommand(["extract-frames", "--video", videoPath, "--out-dir", outDir, "--fps", "1"])
          );

          expect(yield* fs.readFileString(path.join(outDir, "clip_frame_00000.png"))).toBe("existing");
          expect(yield* TestConsole.errorLines).toEqual([
            `[image] Refusing to overwrite existing frame output: "${path.join(outDir, "clip_frame_00000.png")}"`,
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });
});
