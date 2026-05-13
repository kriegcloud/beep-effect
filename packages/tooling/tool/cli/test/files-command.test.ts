import { Chalk } from "@beep/chalk";
import { createColors } from "@beep/colors";
import { filesCommand } from "@beep/repo-cli";
import {
  ArchivePoorCandidatesManifest,
  DetectBordersReport,
  DetectFacesReport,
  NormalizeManifest,
  renderFilesProgressBar,
} from "@beep/repo-cli/commands/Files/index";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { Data, Effect, FileSystem, Layer, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
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
const decodeArchivePoorCandidatesManifest = S.decodeUnknownSync(S.fromJsonString(ArchivePoorCandidatesManifest));
const decodeDetectBordersReport = S.decodeUnknownSync(S.fromJsonString(DetectBordersReport));
const decodeDetectFacesReport = S.decodeUnknownEffect(S.fromJsonString(DetectFacesReport));
const decodeNormalizeManifest = S.decodeUnknownSync(S.fromJsonString(NormalizeManifest));

class FilesTestError extends Data.TaggedError("FilesTestError")<{ readonly cause: unknown }> {}

const filesTestError = (cause: unknown) => new FilesTestError({ cause });

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
    catch: filesTestError,
  }).pipe(Effect.asVoid);
});

const writeJpegWithOrientationExif = Effect.fn("FilesTest.writeJpegWithOrientationExif")(function* (
  filePath: string,
  width: number,
  height: number,
  orientation: number
) {
  yield* Effect.tryPromise({
    try: () =>
      sharp({
        create: {
          background: { alpha: 1, b: 32, g: 64, r: 96 },
          channels: 3,
          height,
          width,
        },
      })
        .jpeg()
        .withMetadata({ orientation })
        .withExif({
          IFD0: {
            ImageDescription: "oriented-source",
          },
        })
        .toFile(filePath),
    catch: filesTestError,
  }).pipe(Effect.asVoid);
});

const readImageMetadata = Effect.fn("FilesTest.readImageMetadata")(function* (filePath: string) {
  return yield* Effect.tryPromise({
    try: () => sharp(filePath).metadata(),
    catch: filesTestError,
  });
});

const readNormalizeManifest = Effect.fn("FilesTest.readNormalizeManifest")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath);
  return decodeNormalizeManifest(content);
});

const readArchivePoorCandidatesManifest = Effect.fn("FilesTest.readArchivePoorCandidatesManifest")(function* (
  filePath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath);
  return decodeArchivePoorCandidatesManifest(content);
});

const readDetectBordersJsonLog = Effect.fn("FilesTest.readDetectBordersJsonLog")(function* () {
  const lines = yield* TestConsole.logLines;
  return decodeDetectBordersReport(A.join("\n")(lines));
});

const readDetectFacesJsonLog = Effect.fn("FilesTest.readDetectFacesJsonLog")(function* () {
  const lines = yield* TestConsole.logLines;
  return yield* decodeDetectFacesReport(A.join("\n")(lines)).pipe(Effect.mapError(filesTestError));
});

const readDetectFacesManifest = Effect.fn("FilesTest.readDetectFacesManifest")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath);
  return yield* decodeDetectFacesReport(content).pipe(Effect.mapError(filesTestError));
});

const writeInsetCanvasImage = Effect.fn("FilesTest.writeInsetCanvasImage")(function* (
  filePath: string,
  width: number,
  height: number,
  inset: { readonly bottom: number; readonly left: number; readonly right: number; readonly top: number },
  background: { readonly b: number; readonly g: number; readonly r: number },
  content: { readonly b: number; readonly g: number; readonly r: number }
) {
  yield* Effect.tryPromise({
    try: () =>
      sharp({
        create: {
          background,
          channels: 3,
          height,
          width,
        },
      })
        .composite([
          {
            input: {
              create: {
                background: content,
                channels: 3,
                height: height - inset.top - inset.bottom,
                width: width - inset.left - inset.right,
              },
            },
            left: inset.left,
            top: inset.top,
          },
        ])
        .png()
        .toFile(filePath),
    catch: filesTestError,
  }).pipe(Effect.asVoid);
});

const writePatternImage = Effect.fn("FilesTest.writePatternImage")(function* (
  filePath: string,
  width: number,
  height: number
) {
  const data = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3;
      data[offset] = (x * 17 + y * 31) % 256;
      data[offset + 1] = (x * 47 + y * 13) % 256;
      data[offset + 2] = (x * 7 + y * 71) % 256;
    }
  }

  yield* Effect.tryPromise({
    try: () =>
      sharp(data, { raw: { channels: 3, height, width } })
        .png()
        .toFile(filePath),
    catch: filesTestError,
  }).pipe(Effect.asVoid);
});

const writeLeftCanvasPatternImage = Effect.fn("FilesTest.writeLeftCanvasPatternImage")(function* (
  filePath: string,
  width: number,
  height: number,
  leftWidth: number
) {
  const data = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3;
      if (x < leftWidth) {
        data[offset] = 255;
        data[offset + 1] = 255;
        data[offset + 2] = 255;
        continue;
      }

      data[offset] = (x * 17 + y * 31) % 256;
      data[offset + 1] = (x * 47 + y * 13) % 256;
      data[offset + 2] = (x * 7 + y * 71) % 256;
    }
  }

  yield* Effect.tryPromise({
    try: () =>
      sharp(data, { raw: { channels: 3, height, width } })
        .png()
        .toFile(filePath),
    catch: filesTestError,
  }).pipe(Effect.asVoid);
});

const writeNearSolidJpegBorder = Effect.fn("FilesTest.writeNearSolidJpegBorder")(function* (
  filePath: string,
  width: number,
  height: number,
  borderWidth: number
) {
  const data = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3;
      const inBorder = x < borderWidth || x >= width - borderWidth;
      const value = inBorder ? (x + y) % 7 : 140;
      data[offset] = value;
      data[offset + 1] = inBorder ? value : 90;
      data[offset + 2] = inBorder ? value : 40;
    }
  }

  yield* Effect.tryPromise({
    try: () =>
      sharp(data, { raw: { channels: 3, height, width } })
        .jpeg({ quality: 85 })
        .toFile(filePath),
    catch: filesTestError,
  }).pipe(Effect.asVoid);
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
  it("renders a plain ascii files progress bar when colors are disabled", () => {
    const rendered = renderFilesProgressBar({
      chalk: new Chalk({ level: 0 }),
      colors: createColors(false),
      completed: 3,
      label: "normalize write",
      total: 6,
      width: 10,
    });

    expect(rendered).toBe("files normalize write <#####-----> 3/6 50.0%");
  });

  it("detects black pillarbox borders", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeInsetCanvasImage(
            path.join(datasetDir, "pillar.png"),
            100,
            80,
            { bottom: 0, left: 20, right: 20, top: 0 },
            { b: 0, g: 0, r: 0 },
            { b: 64, g: 96, r: 160 }
          );

          yield* runFilesCommand(["detect-borders", "--dir", datasetDir, "--json"]);

          const report = yield* readDetectBordersJsonLog();
          const entry = report.entries[0];

          expect(report.summary.borderedCount).toBe(1);
          expect(entry?.classification).toBe("pillarbox");
          expect(entry?.sides.find((side) => side.side === "left")?.widthPx).toBe(20);
          expect(entry?.sides.find((side) => side.side === "right")?.widthPx).toBe(20);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("writes an empty face detection manifest without loading the model", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const modelPath = path.join(tmpDir, "face_detection_yunet.onnx");
          const manifestPath = path.join(datasetDir, "detect-faces-manifest.json");

          yield* fs.writeFileString(modelPath, "not a real model");
          yield* runFilesCommand(["detect-faces", "--dir", datasetDir, "--model", modelPath, "--json"]);

          const report = yield* readDetectFacesJsonLog();
          const manifest = yield* readDetectFacesManifest(manifestPath);

          expect(report.summary.analyzedCount).toBe(0);
          expect(report.summary.movedNoFaceCount).toBe(0);
          expect(report.summary.skippedCount).toBe(0);
          expect(report.manifestWritten).toBe(true);
          expect(manifest.schemaVersion).toBe("beep.files.detect-faces.v1");
          expect(manifest.manifestWritten).toBe(true);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("creates an empty no-face move directory without loading the model", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const modelPath = path.join(tmpDir, "face_detection_yunet.onnx");
          const noFaceDir = path.join(tmpDir, "no-face");

          yield* fs.writeFileString(modelPath, "not a real model");
          yield* runFilesCommand([
            "detect-faces",
            "--dir",
            datasetDir,
            "--model",
            modelPath,
            "--move-no-face-to",
            noFaceDir,
            "--json",
          ]);

          const report = yield* readDetectFacesJsonLog();
          const noFaceDirExists = yield* fs.exists(noFaceDir);

          expect(report.options.moveNoFaceTo).toBe(noFaceDir);
          expect(report.summary.movedNoFaceCount).toBe(0);
          expect(noFaceDirExists).toBe(true);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("detects one-sided white canvas edges", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeLeftCanvasPatternImage(path.join(datasetDir, "canvas.png"), 80, 80, 10);

          yield* runFilesCommand(["detect-borders", "--dir", datasetDir, "--json"]);

          const report = yield* readDetectBordersJsonLog();
          const entry = report.entries[0];

          expect(report.summary.borderedCount).toBe(1);
          expect(entry?.classification).toBe("canvas-edge");
          expect(entry?.sides.find((side) => side.side === "left")?.colorHex).toBe("#ffffff");
          expect(entry?.sides.find((side) => side.side === "left")?.widthPx).toBe(10);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not report clean patterned images as bordered", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writePatternImage(path.join(datasetDir, "clean.png"), 64, 64);

          yield* runFilesCommand(["detect-borders", "--dir", datasetDir]);

          expect(yield* TestConsole.logLines).toContain(
            `files detect-borders: 0 bordered image(s) found in "${datasetDir}" (1 analyzed, 0 skipped).`
          );
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("detects near-solid jpeg-compressed borders with tolerance", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeNearSolidJpegBorder(path.join(datasetDir, "near-solid.jpg"), 90, 72, 12);

          yield* runFilesCommand(["detect-borders", "--dir", datasetDir, "--json", "--tolerance", "24"]);

          const report = yield* readDetectBordersJsonLog();
          const entry = report.entries[0];

          expect(entry?.classification).toBe("pillarbox");
          expect(entry?.sides.find((side) => side.side === "left")?.widthPx).toBeGreaterThanOrEqual(8);
          expect(entry?.sides.find((side) => side.side === "right")?.widthPx).toBeGreaterThanOrEqual(8);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("skips unsupported and unreadable sources during border detection", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeInsetCanvasImage(
            path.join(datasetDir, "bordered.png"),
            40,
            40,
            { bottom: 0, left: 5, right: 5, top: 0 },
            { b: 0, g: 0, r: 0 },
            { b: 120, g: 120, r: 120 }
          );
          yield* writeSizedFile(path.join(datasetDir, "broken.jpg"), 1, "x");
          yield* writeSvgFile(path.join(datasetDir, "vector.svg"), 2, 2);
          yield* fs.writeFileString(path.join(datasetDir, "caption.txt"), "caption");
          yield* fs.writeFileString(path.join(datasetDir, "clip.mp4"), "video");
          yield* fs.writeFileString(path.join(datasetDir, "extensionless"), "notes");
          yield* fs.makeDirectory(path.join(datasetDir, "nested"));

          yield* runFilesCommand(["detect-borders", "--dir", datasetDir, "--json"]);

          const report = yield* readDetectBordersJsonLog();

          expect(report.summary.analyzedCount).toBe(1);
          expect(report.summary.borderedCount).toBe(1);
          expect(A.map(report.skipped, (entry) => entry.reason)).toEqual([
            "unreadable-image",
            "non-media",
            "video",
            "extensionless",
            "directory",
            "unsupported-image",
          ]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("validates border detection threshold relationships", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writePatternImage(path.join(datasetDir, "clean.png"), 32, 32);

          yield* runFilesCommand([
            "detect-borders",
            "--dir",
            datasetDir,
            "--min-width-pct",
            "40",
            "--max-scan-pct",
            "10",
          ]);

          expect(yield* TestConsole.errorLines).toEqual([
            "[files] Expected --min-width-pct (40) to be less than or equal to --max-scan-pct (10).",
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("crops detected pillarbox borders in place", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const imagePath = path.join(datasetDir, "pillar.png");

          yield* writeInsetCanvasImage(
            imagePath,
            100,
            80,
            { bottom: 0, left: 20, right: 20, top: 0 },
            { b: 0, g: 0, r: 0 },
            { b: 64, g: 96, r: 160 }
          );

          yield* runFilesCommand(["crop-borders", "--dir", datasetDir]);

          const metadata = yield* readImageMetadata(imagePath);

          expect(metadata.width).toBe(60);
          expect(metadata.height).toBe(80);
          expect(yield* TestConsole.logLines).toContain("files crop-borders: cropped 1 image file(s).");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("preserves bordered images during crop-borders dry-run", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const imagePath = path.join(datasetDir, "canvas.png");

          yield* writeLeftCanvasPatternImage(imagePath, 80, 80, 10);

          yield* runFilesCommand(["crop-borders", "--dir", datasetDir, "--dry-run"]);

          const metadata = yield* readImageMetadata(imagePath);

          expect(metadata.width).toBe(80);
          expect(metadata.height).toBe(80);
          expect(yield* TestConsole.logLines).toContain("files crop-borders: dry run; no files rewritten.");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("validates border crop threshold relationships", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writePatternImage(path.join(datasetDir, "clean.png"), 32, 32);

          yield* runFilesCommand([
            "crop-borders",
            "--dir",
            datasetDir,
            "--min-width-pct",
            "40",
            "--max-scan-pct",
            "10",
          ]);

          expect(yield* TestConsole.errorLines).toEqual([
            "[files] Expected --min-width-pct (40) to be less than or equal to --max-scan-pct (10).",
          ]);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

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

  it("normalizes images into an output directory with orientation, metadata stripping, resizing, and a manifest", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "dataset", "images");
          const sourcePath = path.join(rawDir, "portrait.jpg");
          const outputPath = path.join(outDir, "portrait.png");
          const manifestPath = path.join(outDir, "normalize-manifest.json");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithOrientationExif(sourcePath, 3, 5, 6);
          expect((yield* readImageMetadata(sourcePath)).exif).toBeDefined();

          yield* runFilesCommand([
            "normalize",
            "--dir",
            rawDir,
            "--out-dir",
            outDir,
            "--format",
            "png",
            "--max-long-edge",
            "4",
          ]);

          const outputMetadata = yield* readImageMetadata(outputPath);
          const sourceMetadata = yield* readImageMetadata(sourcePath);
          const manifest = yield* readNormalizeManifest(manifestPath);

          expect(outputMetadata.format).toBe("png");
          expect(outputMetadata.exif).toBeUndefined();
          expect(outputMetadata.width).toBe(4);
          expect(outputMetadata.height).toBe(2);
          expect(sourceMetadata.exif).toBeDefined();
          expect(yield* sortedDirectoryEntries(rawDir)).toEqual(["portrait.jpg"]);
          expect(yield* sortedDirectoryEntries(outDir)).toEqual(["normalize-manifest.json", "portrait.png"]);
          expect(manifest.schemaVersion).toBe("beep.files.normalize.v1");
          expect(manifest.sourceDirectory).toBe(rawDir);
          expect(manifest.outputDirectory).toBe(outDir);
          expect(manifest.summary).toEqual({
            duplicateCount: 0,
            movedDuplicateCount: 0,
            normalizedCount: 1,
            plannedCount: 1,
            resizedCount: 1,
            skippedCount: 0,
          });
          expect(manifest.entries[0]?.sourceRelativePath).toBe("portrait.jpg");
          expect(manifest.entries[0]?.outputRelativePath).toBe("portrait.png");
          expect(manifest.entries[0]?.inputDimensions).toEqual({ width: 5, height: 3 });
          expect(manifest.entries[0]?.outputDimensions).toEqual({ width: 4, height: 2 });
          expect(manifest.entries[0]?.resized).toBe(true);
          expect(manifest.entries[0]?.outputSizeBytes).toBeDefined();
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not upscale images during normalization", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "out");
          const sourcePath = path.join(rawDir, "small.jpg");
          const outputPath = path.join(outDir, "small.webp");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(sourcePath, 3, 2);

          yield* runFilesCommand([
            "normalize",
            "--dir",
            rawDir,
            "--out-dir",
            outDir,
            "--format",
            "webp",
            "--max-long-edge",
            "20",
          ]);

          const outputMetadata = yield* readImageMetadata(outputPath);
          const manifest = yield* readNormalizeManifest(path.join(outDir, "normalize-manifest.json"));

          expect(outputMetadata.format).toBe("webp");
          expect(outputMetadata.width).toBe(3);
          expect(outputMetadata.height).toBe(2);
          expect(manifest.entries[0]?.resized).toBe(false);
          expect(manifest.summary.resizedCount).toBe(0);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("skips exact duplicate normalized outputs when normalize dedupe is enabled", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "out");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeInsetCanvasImage(
            path.join(rawDir, "alpha.png"),
            4,
            4,
            { bottom: 0, left: 0, right: 0, top: 0 },
            { b: 48, g: 32, r: 16 },
            { b: 48, g: 32, r: 16 }
          );
          yield* writeInsetCanvasImage(
            path.join(rawDir, "copy.png"),
            4,
            4,
            { bottom: 0, left: 0, right: 0, top: 0 },
            { b: 48, g: 32, r: 16 },
            { b: 48, g: 32, r: 16 }
          );

          yield* runFilesCommand(["normalize", "--dir", rawDir, "--out-dir", outDir, "--dedupe"]);

          const manifest = yield* readNormalizeManifest(path.join(outDir, "normalize-manifest.json"));
          const outputHash = manifest.entries[0]?.outputHash;
          const duplicate = manifest.skipped[0];

          expect(yield* sortedDirectoryEntries(outDir)).toEqual(["alpha.png", "normalize-manifest.json"]);
          expect(manifest.summary).toEqual({
            duplicateCount: 1,
            movedDuplicateCount: 0,
            normalizedCount: 1,
            plannedCount: 2,
            resizedCount: 0,
            skippedCount: 1,
          });
          expect(outputHash).toMatch(/^sha256:[a-f0-9]{64}$/);
          expect(duplicate?.reason).toBe("duplicate");
          expect(duplicate?.sourceName).toBe("copy.png");
          expect(duplicate?.duplicateOfOutputRelativePath).toBe("alpha.png");
          expect(duplicate?.duplicateOfSourceRelativePath).toBe("alpha.png");
          expect(duplicate?.outputHash).toBe(outputHash);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("moves exact duplicate source files when normalize move-duplicates-to is provided", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "out");
          const duplicatesDir = path.join(tmpDir, "duplicates");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeInsetCanvasImage(
            path.join(rawDir, "alpha.png"),
            4,
            4,
            { bottom: 0, left: 0, right: 0, top: 0 },
            { b: 48, g: 32, r: 16 },
            { b: 48, g: 32, r: 16 }
          );
          yield* writeInsetCanvasImage(
            path.join(rawDir, "copy.png"),
            4,
            4,
            { bottom: 0, left: 0, right: 0, top: 0 },
            { b: 48, g: 32, r: 16 },
            { b: 48, g: 32, r: 16 }
          );

          yield* runFilesCommand([
            "normalize",
            "--dir",
            rawDir,
            "--out-dir",
            outDir,
            "--move-duplicates-to",
            duplicatesDir,
          ]);

          const manifest = yield* readNormalizeManifest(path.join(outDir, "normalize-manifest.json"));
          const duplicate = manifest.skipped[0];

          expect(yield* sortedDirectoryEntries(rawDir)).toEqual(["alpha.png"]);
          expect(yield* sortedDirectoryEntries(outDir)).toEqual(["alpha.png", "normalize-manifest.json"]);
          expect(yield* sortedDirectoryEntries(duplicatesDir)).toEqual(["copy.png"]);
          expect(manifest.options.dedupe).toBe(true);
          expect(manifest.options.moveDuplicatesTo).toBe(duplicatesDir);
          expect(manifest.summary).toEqual({
            duplicateCount: 1,
            movedDuplicateCount: 1,
            normalizedCount: 1,
            plannedCount: 2,
            resizedCount: 0,
            skippedCount: 1,
          });
          expect(duplicate?.reason).toBe("duplicate");
          expect(duplicate?.sourceName).toBe("copy.png");
          expect(duplicate?.duplicateMovedPath).toBe(path.join(duplicatesDir, "copy.png"));
          expect(duplicate?.duplicateMovedRelativePath).toBe("copy.png");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("preserves stems, resolves same-run output collisions, and records skipped sources", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "out");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "foo.jpg"), 2, 2);
          yield* writeJpegWithExif(path.join(rawDir, "foo.png"), 2, 2);
          yield* fs.writeFileString(path.join(rawDir, "notes.txt"), "caption");
          yield* fs.writeFileString(path.join(rawDir, "clip.mp4"), "video");
          yield* fs.writeFileString(path.join(rawDir, "extensionless"), "notes");
          yield* fs.makeDirectory(path.join(rawDir, "nested.jpg"));
          yield* writeSvgFile(path.join(rawDir, "vector.svg"), 2, 2);

          yield* runFilesCommand(["normalize", "--dir", rawDir, "--out-dir", outDir]);

          const manifest = yield* readNormalizeManifest(path.join(outDir, "normalize-manifest.json"));

          expect(yield* sortedDirectoryEntries(outDir)).toEqual(["foo.png", "foo_01.png", "normalize-manifest.json"]);
          expect(A.map(manifest.entries, (entry) => entry.outputName)).toEqual(["foo.png", "foo_01.png"]);
          expect(A.map(manifest.skipped, (entry) => entry.reason)).toEqual([
            "video",
            "extensionless",
            "directory",
            "non-media",
            "unsupported-image",
          ]);
          expect(manifest.summary).toEqual({
            duplicateCount: 0,
            movedDuplicateCount: 0,
            normalizedCount: 2,
            plannedCount: 2,
            resizedCount: 0,
            skippedCount: 5,
          });
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not create outputs or directories during normalize dry-run", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "missing-out");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "photo.jpg"), 2, 2);

          yield* runFilesCommand(["normalize", "--dir", rawDir, "--out-dir", outDir, "--dry-run"]);

          expect(yield* fs.exists(outDir)).toBe(false);
          expect(yield* TestConsole.logLines).toContain("files normalize: dry run; no files written.");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("refuses existing normalize output files unless overwrite is enabled", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "out");
          const outputPath = path.join(outDir, "photo.png");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* fs.makeDirectory(outDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "photo.jpg"), 2, 2);
          yield* fs.writeFileString(outputPath, "existing");

          yield* runFilesCommand(["normalize", "--dir", rawDir, "--out-dir", outDir]);

          expect(yield* fs.readFileString(outputPath)).toBe("existing");
          expect(yield* fs.exists(path.join(outDir, "normalize-manifest.json"))).toBe(false);
          expect(process.exitCode).toBe(1);

          process.exitCode = 0;
          yield* runFilesCommand(["normalize", "--dir", rawDir, "--out-dir", outDir, "--overwrite"]);

          expect((yield* readImageMetadata(outputPath)).format).toBe("png");
          expect(yield* fs.exists(path.join(outDir, "normalize-manifest.json"))).toBe(true);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("refuses an existing normalize manifest unless overwrite is enabled", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "raw");
          const outDir = path.join(tmpDir, "out");
          const manifestPath = path.join(outDir, "normalize-manifest.json");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* fs.makeDirectory(outDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "photo.jpg"), 2, 2);
          yield* fs.writeFileString(manifestPath, "existing manifest");

          yield* runFilesCommand(["normalize", "--dir", rawDir, "--out-dir", outDir]);

          expect(yield* fs.readFileString(manifestPath)).toBe("existing manifest");
          expect(yield* fs.exists(path.join(outDir, "photo.png"))).toBe(false);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("creates missing same-stem caption sidecars for image files", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeJpegWithExif(path.join(datasetDir, "alpha.jpg"), 4, 4);
          yield* writeJpegWithExif(path.join(datasetDir, "beta.png"), 4, 4);
          yield* fs.writeFileString(path.join(datasetDir, "beta.txt"), "existing caption");
          yield* fs.writeFileString(path.join(datasetDir, "clip.mp4"), "video");
          yield* fs.writeFileString(path.join(datasetDir, "notes.md"), "notes");

          yield* runFilesCommand(["create-captions", "--dir", datasetDir, "--caption", "trigger token"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual([
            "alpha.jpg",
            "alpha.txt",
            "beta.png",
            "beta.txt",
            "clip.mp4",
            "notes.md",
          ]);
          expect(yield* fs.readFileString(path.join(datasetDir, "alpha.txt"))).toBe("trigger token");
          expect(yield* fs.readFileString(path.join(datasetDir, "beta.txt"))).toBe("existing caption");
          expect(yield* TestConsole.logLines).toContain(
            `files create-captions: created 1 caption sidecar file(s); overwritten 0 existing caption file(s).`
          );
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not create caption sidecars during create-captions dry-run", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeJpegWithExif(path.join(datasetDir, "alpha.jpg"), 4, 4);

          yield* runFilesCommand(["create-captions", "--dir", datasetDir, "--caption", "caption", "--dry-run"]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["alpha.jpg"]);
          expect(yield* fs.exists(path.join(datasetDir, "alpha.txt"))).toBe(false);
          expect(yield* TestConsole.logLines).toContain("files create-captions: dry run; no caption files written.");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("overwrites existing caption sidecars only when requested", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);
          const captionPath = path.join(datasetDir, "alpha.txt");

          yield* writeJpegWithExif(path.join(datasetDir, "alpha.jpg"), 4, 4);
          yield* fs.writeFileString(captionPath, "keep me");

          yield* runFilesCommand(["create-captions", "--dir", datasetDir, "--caption", "new caption"]);

          expect(yield* fs.readFileString(captionPath)).toBe("keep me");

          yield* runFilesCommand(["create-captions", "--dir", datasetDir, "--caption", "new caption", "--overwrite"]);

          expect(yield* fs.readFileString(captionPath)).toBe("new caption");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("skips duplicate caption targets during create-captions planning", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const datasetDir = yield* makeDatasetDir(tmpDir);

          yield* writeJpegWithExif(path.join(datasetDir, "same.jpg"), 4, 4);
          yield* writeJpegWithExif(path.join(datasetDir, "same.png"), 4, 4);

          yield* runFilesCommand(["create-captions", "--dir", datasetDir]);

          expect(yield* sortedDirectoryEntries(datasetDir)).toEqual(["same.jpg", "same.png", "same.txt"]);
          expect(yield* fs.readFileString(path.join(datasetDir, "same.txt"))).toBe("");
          expect(yield* TestConsole.logLines).toContain(
            `same.png [caption-target-collision] Another image in this run already targets "same.txt".`
          );
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("archives poor image candidates with same-stem txt sidecars by default", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "images");
          const archiveDir = path.join(tmpDir, "rejected");
          const tinyPath = path.join(rawDir, "tiny.jpg");
          const goodPath = path.join(rawDir, "good.jpg");
          const manifestPath = path.join(archiveDir, "archive-poor-candidates-manifest.json");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(tinyPath, 20, 80);
          yield* writeJpegWithExif(goodPath, 64, 64);
          yield* fs.writeFileString(path.join(rawDir, "tiny.txt"), "tiny caption");

          yield* runFilesCommand([
            "archive-poor-candidates",
            "--dir",
            rawDir,
            "--archive-dir",
            archiveDir,
            "--target-resolution",
            "64",
            "--min-short-edge",
            "32",
            "--max-aspect",
            "3",
            "--max-upscale",
            "1.5",
          ]);

          const manifest = yield* readArchivePoorCandidatesManifest(manifestPath);

          expect(yield* sortedDirectoryEntries(rawDir)).toEqual(["good.jpg"]);
          expect(yield* sortedDirectoryEntries(archiveDir)).toEqual([
            "archive-poor-candidates-manifest.json",
            "tiny.jpg",
            "tiny.txt",
          ]);
          expect(yield* fs.readFileString(path.join(archiveDir, "tiny.txt"))).toBe("tiny caption");
          expect(manifest.schemaVersion).toBe("beep.files.archive-poor-candidates.v1");
          expect(manifest.summary).toEqual({
            archivedCount: 1,
            assessedCount: 2,
            keptCount: 1,
            movedSidecarCount: 1,
            skippedCount: 0,
          });
          expect(manifest.entries.find((entry) => entry.sourceName === "tiny.jpg")?.decision).toBe("archive");
          expect(manifest.entries.find((entry) => entry.sourceName === "tiny.jpg")?.reasons).toEqual([
            "short-edge-too-small",
            "extreme-aspect-ratio",
            "upscale-too-large",
          ]);
          expect(manifest.entries.find((entry) => entry.sourceName === "good.jpg")?.decision).toBe("keep");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not create archives or directories during archive-poor-candidates dry-run", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "images");
          const archiveDir = path.join(tmpDir, "missing-rejected");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "tiny.jpg"), 20, 80);
          yield* fs.writeFileString(path.join(rawDir, "tiny.txt"), "tiny caption");

          yield* runFilesCommand([
            "archive-poor-candidates",
            "--dir",
            rawDir,
            "--archive-dir",
            archiveDir,
            "--target-resolution",
            "64",
            "--min-short-edge",
            "32",
            "--dry-run",
          ]);

          expect(yield* sortedDirectoryEntries(rawDir)).toEqual(["tiny.jpg", "tiny.txt"]);
          expect(yield* fs.exists(archiveDir)).toBe(false);
          expect(yield* TestConsole.logLines).toContain("files archive-poor-candidates: dry run; no files moved.");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("leaves captions in place when archive-poor-candidates sidecars are disabled", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "images");
          const archiveDir = path.join(tmpDir, "rejected");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "tiny.jpg"), 20, 80);
          yield* fs.writeFileString(path.join(rawDir, "tiny.txt"), "tiny caption");

          yield* runFilesCommand([
            "archive-poor-candidates",
            "--dir",
            rawDir,
            "--archive-dir",
            archiveDir,
            "--target-resolution",
            "64",
            "--min-short-edge",
            "32",
            "--sidecars",
            "none",
          ]);

          expect(yield* sortedDirectoryEntries(rawDir)).toEqual(["tiny.txt"]);
          expect(yield* sortedDirectoryEntries(archiveDir)).toEqual([
            "archive-poor-candidates-manifest.json",
            "tiny.jpg",
          ]);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("refuses existing archive targets unless overwrite is enabled", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "images");
          const archiveDir = path.join(tmpDir, "rejected");
          const archivePath = path.join(archiveDir, "tiny.jpg");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* fs.makeDirectory(archiveDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "tiny.jpg"), 20, 80);
          yield* fs.writeFileString(archivePath, "existing");

          yield* runFilesCommand([
            "archive-poor-candidates",
            "--dir",
            rawDir,
            "--archive-dir",
            archiveDir,
            "--target-resolution",
            "64",
            "--min-short-edge",
            "32",
          ]);

          expect(yield* fs.readFileString(archivePath)).toBe("existing");
          expect(yield* fs.exists(path.join(rawDir, "tiny.jpg"))).toBe(true);
          expect(process.exitCode).toBe(1);

          process.exitCode = 0;
          yield* runFilesCommand([
            "archive-poor-candidates",
            "--dir",
            rawDir,
            "--archive-dir",
            archiveDir,
            "--target-resolution",
            "64",
            "--min-short-edge",
            "32",
            "--overwrite",
          ]);

          expect((yield* readImageMetadata(archivePath)).format).toBe("jpeg");
          expect(yield* fs.exists(path.join(rawDir, "tiny.jpg"))).toBe(false);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("records skipped sources while archiving poor candidates", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "images");
          const archiveDir = path.join(tmpDir, "rejected");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeSizedFile(path.join(rawDir, "broken.jpg"), 1, "x");
          yield* fs.writeFileString(path.join(rawDir, "caption.txt"), "caption");
          yield* fs.writeFileString(path.join(rawDir, "clip.mp4"), "video");
          yield* fs.writeFileString(path.join(rawDir, "extensionless"), "notes");
          yield* fs.makeDirectory(path.join(rawDir, "nested.jpg"));
          yield* writeSvgFile(path.join(rawDir, "vector.svg"), 2, 2);

          yield* runFilesCommand(["archive-poor-candidates", "--dir", rawDir, "--archive-dir", archiveDir]);

          const manifest = yield* readArchivePoorCandidatesManifest(
            path.join(archiveDir, "archive-poor-candidates-manifest.json")
          );

          expect(manifest.entries).toEqual([]);
          expect(A.map(manifest.skipped, (entry) => entry.reason)).toEqual([
            "unreadable-image",
            "non-media",
            "video",
            "extensionless",
            "directory",
            "unsupported-image",
          ]);
          expect(manifest.summary.skippedCount).toBe(6);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("refuses to archive poor candidates into the source directory", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const rawDir = path.join(tmpDir, "images");

          yield* fs.makeDirectory(rawDir, { recursive: true });
          yield* writeJpegWithExif(path.join(rawDir, "tiny.jpg"), 20, 80);

          yield* runFilesCommand(["archive-poor-candidates", "--dir", rawDir, "--archive-dir", rawDir]);

          expect(yield* TestConsole.errorLines).toEqual([
            `[files] Refusing to archive into the source directory: "${rawDir}"`,
          ]);
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
