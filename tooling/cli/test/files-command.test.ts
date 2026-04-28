import { filesCommand } from "@beep/repo-cli";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer))
);
const runFilesCommand = Command.runWith(filesCommand, { version: "0.0.0" });

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

const makeDatasetDir = Effect.fn("FilesTest.makeDatasetDir")(function* (tmpDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const datasetDir = path.join(tmpDir, "dataset");
  yield* fs.makeDirectory(datasetDir, { recursive: true });
  return datasetDir;
});

const writeSizedFile = Effect.fn("FilesTest.writeSizedFile")(function* (filePath: string, size: number, fill: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString(filePath, pipe(fill, Str.repeat(size)));
});

const writeSvgFile = Effect.fn("FilesTest.writeSvgFile")(function* (
  filePath: string,
  width: number,
  height: number,
  padding = 0
) {
  const fs = yield* FileSystem.FileSystem;
  const filler = pipe("x", Str.repeat(padding));
  yield* fs.writeFileString(
    filePath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${filler}</svg>`
  );
});

const writeJpegWithExif = Effect.fn("FilesTest.writeJpegWithExif")(function* (
  filePath: string,
  width: number,
  height: number
) {
  yield* Effect.tryPromise({
    try: () =>
      sharp({
        create: {
          background: { alpha: 1, b: 48, g: 32, r: 16 },
          channels: 3,
          height,
          width,
        },
      })
        .jpeg()
        .withExif({
          IFD0: {
            Copyright: "beep-secret",
            ImageDescription: "dataset-source",
          },
        })
        .toFile(filePath),
    catch: (cause) => cause,
  }).pipe(Effect.asVoid);
});

const readImageMetadata = Effect.fn("FilesTest.readImageMetadata")(function* (filePath: string) {
  return yield* Effect.tryPromise({
    try: () => sharp(filePath).metadata(),
    catch: (cause) => cause,
  });
});

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

const writeFfprobeShim = Effect.fn("FilesTest.writeFfprobeShim")(function* (
  binDir: string,
  width: number,
  height: number,
  rotation: number
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const shimPath = path.join(binDir, "ffprobe");
  yield* fs.makeDirectory(binDir, { recursive: true });
  yield* fs.writeFileString(
    shimPath,
    `#!/usr/bin/env sh\nprintf '%s\\n' '{"streams":[{"width":${width},"height":${height},"side_data_list":[{"rotation":${rotation}}]}]}'\n`
  );
  yield* fs.chmod(shimPath, 0o755);
});

const writeFfmpegShim = Effect.fn("FilesTest.writeFfmpegShim")(function* (
  binDir: string,
  argsPath: string,
  outputText = "clean video"
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const shimPath = path.join(binDir, "ffmpeg");
  yield* fs.makeDirectory(binDir, { recursive: true });
  yield* fs.writeFileString(
    shimPath,
    `#!/usr/bin/env sh\nprintf '%s\\n' "$@" > '${argsPath}'\nlast=''\nfor arg do last="$arg"; done\nprintf '%s\\n' '${outputText}' > "$last"\n`
  );
  yield* fs.chmod(shimPath, 0o755);
});

const writeFailingFfmpegShim = Effect.fn("FilesTest.writeFailingFfmpegShim")(function* (
  binDir: string,
  argsPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const shimPath = path.join(binDir, "ffmpeg");
  yield* fs.makeDirectory(binDir, { recursive: true });
  yield* fs.writeFileString(
    shimPath,
    `#!/usr/bin/env sh\nprintf '%s\\n' "$@" > '${argsPath}'\nprintf '%s\\n' 'ffmpeg boom' >&2\nexit 7\n`
  );
  yield* fs.chmod(shimPath, 0o755);
});

const sortedDirectoryEntries = Effect.fn("FilesTest.sortedDirectoryEntries")(function* (dir: string) {
  const fs = yield* FileSystem.FileSystem;
  return A.sort(yield* fs.readDirectory(dir), Order.String);
});

const fileSize = Effect.fn("FilesTest.fileSize")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const stat = yield* fs.stat(filePath);
  return stat.size;
});

describe.sequential("files command", () => {
  it("sorts direct files by size and renames with generated indexes", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          for (const size of [7, 6, 5, 4, 3, 2, 1]) {
            yield* writeSizedFile(path.join(datasetDir, `${size}.png`), size, "x");
          }

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual([
            "image_00.png",
            "image_01.png",
            "image_02.png",
            "image_03.png",
            "image_04.png",
            "image_05.png",
            "image_06.png",
          ]);
          expect(yield* fileSize(path.join(datasetDir, "image_00.png"))).toBe(7n);
          expect(yield* fileSize(path.join(datasetDir, "image_06.png"))).toBe(1n);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("breaks equal-size ties by original name", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* fs.writeFileString(path.join(datasetDir, "b.png"), "bb");
          yield* fs.writeFileString(path.join(datasetDir, "a.png"), "aa");
          yield* fs.writeFileString(path.join(datasetDir, "c.png"), "ccc");

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* fs.readFileString(path.join(datasetDir, "image_00.png"))).toBe("ccc");
          expect(yield* fs.readFileString(path.join(datasetDir, "image_01.png"))).toBe("aa");
          expect(yield* fs.readFileString(path.join(datasetDir, "image_02.png"))).toBe("bb");
        })
      )
    );
  });

  it("increases index width from the file count", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          for (const index of A.range(0, 99)) {
            yield* fs.writeFileString(path.join(datasetDir, `source-${index}.png`), "x");
          }

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* fs.exists(path.join(datasetDir, "image_0000.png"))).toBe(true);
          expect(yield* fs.exists(path.join(datasetDir, "image_0099.png"))).toBe(true);
          expect(A.length(yield* sortedDirectoryEntries(datasetDir))).toBe(100);
        })
      )
    );
  });

  it("preserves files during dry-run", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSizedFile(path.join(datasetDir, "large.png"), 2, "x");
          yield* writeSizedFile(path.join(datasetDir, "small.png"), 1, "x");

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir, "--dry-run"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["large.png", "small.png"]);
          expect(yield* fs.exists(path.join(datasetDir, "image_00.png"))).toBe(false);
          expect(yield* TestConsole.logLines).toContain("files sort-and-rename: dry run; no files renamed.");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("preserves extension casing", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSizedFile(path.join(datasetDir, "large.PNG"), 2, "x");
          yield* writeSizedFile(path.join(datasetDir, "small.jpg"), 1, "x");

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["image_00.PNG", "image_01.jpg"]);
        })
      )
    );
  });

  it("fails before mutation when a selected file has no extension", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSizedFile(path.join(datasetDir, "extensionless"), 2, "x");
          yield* writeSizedFile(path.join(datasetDir, "small.png"), 1, "x");

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["extensionless", "small.png"]);
          expect(yield* fs.exists(path.join(datasetDir, "image_00.png"))).toBe(false);
          expect(yield* TestConsole.errorLines).toEqual([
            `[files] Cannot rename extensionless file: "${path.join(datasetDir, "extensionless")}"`,
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("fails before mutation when a target path exists outside the rename set", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const collidingDirectory = path.join(datasetDir, "image_00.png");

          yield* writeSizedFile(path.join(datasetDir, "source.png"), 1, "x");
          yield* fs.makeDirectory(collidingDirectory);

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["image_00.png", "source.png"]);
          expect(yield* fs.exists(path.join(datasetDir, "source.png"))).toBe(true);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("skips directories and symlink entries", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const outsideFile = path.join(tmpDir, "outside.png");

          yield* writeSizedFile(path.join(datasetDir, "large.png"), 2, "x");
          yield* writeSizedFile(path.join(datasetDir, "small.png"), 1, "x");
          yield* fs.makeDirectory(path.join(datasetDir, "nested.png"));
          yield* fs.writeFileString(outsideFile, "outside");
          yield* fs.symlink(outsideFile, path.join(datasetDir, "linked.png"));

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual([
            "image_00.png",
            "image_01.png",
            "linked.png",
            "nested.png",
          ]);
          expect(yield* fs.exists(path.join(datasetDir, "image_02.png"))).toBe(false);
        })
      )
    );
  });

  it("succeeds as a no-op for empty directories", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual([]);
          expect(yield* TestConsole.logLines).toEqual([
            `files sort-and-rename: 0 file(s) in "${datasetDir}"; nothing to rename.`,
          ]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("includes media dimensions in generated names when requested", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSvgFile(path.join(datasetDir, "small.svg"), 1, 1);
          yield* writeSvgFile(path.join(datasetDir, "large.svg"), 2, 1, 20);

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir, "--with-dimensions"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["image_00_2x1.svg", "image_01_1x1.svg"]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("leaves non-media files untouched when dimensions are requested", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSvgFile(path.join(datasetDir, "photo.svg"), 1, 1);
          yield* fs.writeFileString(path.join(datasetDir, "photo.txt"), "caption");
          yield* fs.writeFileString(path.join(datasetDir, "extensionless"), "notes");

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir, "--with-dimensions"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["extensionless", "image_00_1x1.svg", "photo.txt"]);
          expect(yield* fs.readFileString(path.join(datasetDir, "photo.txt"))).toBe("caption");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not append duplicate dimension suffixes when rerun", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSvgFile(path.join(datasetDir, "source.svg"), 3, 2);

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir, "--with-dimensions"]);
          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir, "--with-dimensions"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["image_00_3x2.svg"]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("uses ffprobe stream rotation for video dimensions", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const binDir = path.join(tmpDir, "bin");

          yield* writeFfprobeShim(binDir, 640, 360, 90);
          yield* writeSizedFile(path.join(datasetDir, "clip.mp4"), 4, "x");

          yield* withPathPrefix(
            binDir,
            runFilesCommand(["sort-and-rename", "--prefix", "clip", "--dir", datasetDir, "--with-dimensions"])
          );

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["clip_00_360x640.mp4"]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("fails before mutation when selected media dimensions cannot be probed", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSvgFile(path.join(datasetDir, "valid.svg"), 1, 1);
          yield* writeSizedFile(path.join(datasetDir, "broken.png"), 2, "x");

          yield* runFilesCommand(["sort-and-rename", "--prefix", "image", "--dir", datasetDir, "--with-dimensions"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["broken.png", "valid.svg"]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("strips image metadata by normalizing selected image files", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const imagePath = path.join(datasetDir, "photo.jpg");

          yield* writeJpegWithExif(imagePath, 4, 3);
          expect((yield* readImageMetadata(imagePath)).exif).toBeDefined();

          yield* runFilesCommand(["strip-metadata", "--dir", datasetDir]);

          const metadata = yield* readImageMetadata(imagePath);
          expect(metadata.exif).toBeUndefined();
          expect(metadata.width).toBe(4);
          expect(metadata.height).toBe(3);
          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["photo.jpg"]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("preserves files during strip-metadata dry-run without decoding media", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeSizedFile(path.join(datasetDir, "broken.jpg"), 1, "x");
          yield* writeSizedFile(path.join(datasetDir, "clip.mp4"), 1, "v");

          yield* runFilesCommand(["strip-metadata", "--dir", datasetDir, "--dry-run"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["broken.jpg", "clip.mp4"]);
          expect(yield* TestConsole.logLines).toContain("files strip-metadata: dry run; no files rewritten.");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("skips non-media files and unsupported image formats", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const imagePath = path.join(datasetDir, "photo.jpg");

          yield* writeJpegWithExif(imagePath, 2, 2);
          yield* writeSvgFile(path.join(datasetDir, "vector.svg"), 1, 1);
          yield* fs.writeFileString(path.join(datasetDir, "caption.txt"), "caption");

          yield* runFilesCommand(["strip-metadata", "--dir", datasetDir]);

          expect((yield* readImageMetadata(imagePath)).exif).toBeUndefined();
          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["caption.txt", "photo.jpg", "vector.svg"]);
          expect(yield* TestConsole.logLines).toContain(
            "files strip-metadata: skipped 2 unsupported or non-media file(s)."
          );
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("uses ffmpeg stream copy flags for selected video files", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const binDir = path.join(tmpDir, "bin");
          const argsPath = path.join(tmpDir, "ffmpeg-args.txt");
          const clipPath = path.join(datasetDir, "clip.mp4");

          yield* writeFfmpegShim(binDir, argsPath);
          yield* writeSizedFile(clipPath, 4, "v");

          yield* withPathPrefix(binDir, runFilesCommand(["strip-metadata", "--dir", datasetDir]));

          const args = pipe(yield* fs.readFileString(argsPath), Str.split("\n"));
          expect(args.slice(0, -2)).toEqual([
            "-hide_banner",
            "-nostdin",
            "-y",
            "-i",
            clipPath,
            "-map",
            "0",
            "-c",
            "copy",
            "-map_metadata",
            "-1",
            "-map_metadata:s",
            "-1",
            "-map_metadata:c",
            "-1",
            "-map_chapters",
            "-1",
          ]);
          expect(args.at(-2)).toContain(".beep-files-strip-metadata-");
          expect(yield* fs.readFileString(clipPath)).toBe("clean video\n");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("leaves originals untouched when strip-metadata transform fails", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const validPath = path.join(datasetDir, "valid.jpg");

          yield* writeJpegWithExif(validPath, 3, 3);
          yield* writeSizedFile(path.join(datasetDir, "broken.png"), 1, "x");

          yield* runFilesCommand(["strip-metadata", "--dir", datasetDir]);

          expect((yield* readImageMetadata(validPath)).exif).toBeDefined();
          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["broken.png", "valid.jpg"]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("leaves video originals untouched when ffmpeg fails", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const binDir = path.join(tmpDir, "bin");
          const argsPath = path.join(tmpDir, "ffmpeg-args.txt");
          const clipPath = path.join(datasetDir, "clip.mp4");

          yield* writeFailingFfmpegShim(binDir, argsPath);
          yield* writeSizedFile(clipPath, 4, "v");

          yield* withPathPrefix(binDir, runFilesCommand(["strip-metadata", "--dir", datasetDir]));

          expect(yield* fs.readFileString(clipPath)).toBe("vvvv");
          expect(yield* fs.exists(argsPath)).toBe(true);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });
});
