import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExportArchiveOperation } from "@beep/file-processing/Operation";
import { makePffexportFileProcessingEngine, PffexportEngineConfig } from "@beep/libpff";
import { NonNegativeInt } from "@beep/schema";
import { PosixPath } from "@beep/schema/PosixPath";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";

const testLayer = NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer));

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const provideTestLayer = provideScopedLayer(testLayer);

const stubPffexport = `#!/usr/bin/env bash
target=""
prev=""
for arg in "$@"; do
  if [ "$prev" = "-t" ]; then target="$arg"; fi
  prev="$arg"
done
source="\${@: -1}"
[ -f "$source" ] || exit 2
mkdir -p "$target.export/Top of Personal Folders/Inbox/Message00001/Attachments"
printf 'hello body' > "$target.export/Top of Personal Folders/Inbox/Message00001/Message.txt"
printf 'headers' > "$target.export/Top of Personal Folders/Inbox/Message00001/OutlookHeaders.txt"
printf 'pdfbytes' > "$target.export/Top of Personal Folders/Inbox/Message00001/Attachments/report.pdf"
exit 0
`;

const failingStub = `#!/usr/bin/env bash
exit 2
`;

const fixture = Effect.fn(function* (stubScript: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: "libpff-pffexport-test-" });
  const stubPath = path.join(dir, "pffexport-stub");
  yield* fs.writeFileString(stubPath, stubScript);
  yield* fs.chmod(stubPath, 0o755);
  const sourcePath = path.join(dir, "mailbox.pst");
  yield* fs.writeFileString(sourcePath, "not a real pst");
  const exportRoot = path.join(dir, "out");

  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)(
    "artifact:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  );
  const digest = yield* S.decodeUnknownEffect(ContentDigest)(
    "sha256:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  );
  const operationId = yield* S.decodeUnknownEffect(OperationId)(
    "operation:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  );
  const locatorValue = yield* S.decodeUnknownEffect(PosixPath)(sourcePath);
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("mailbox.pst");

  const operation = ExportArchiveOperation.make({
    format: "pst",
    operationId,
    operationKind: "export-archive",
    preference: { engine: "libpff" },
    source: SourceArtifact.make({
      digest,
      extension: "pst",
      id: artifactId,
      locator: ArtifactLocator.make({ kind: "file", value: locatorValue }),
      name: "mailbox.pst",
      relativePath,
      sizeBytes: NonNegativeInt.make(14),
    }),
  });

  return { exportRoot, operation, stubPath };
});

describe("makePffexportFileProcessingEngine", () => {
  it.effect("exports children through the pffexport subprocess", () =>
    Effect.gen(function* () {
      const { exportRoot, operation, stubPath } = yield* fixture(stubPffexport);
      const engine = yield* makePffexportFileProcessingEngine(
        PffexportEngineConfig.make({ exportRoot, pffexportPath: stubPath })
      );

      const result = yield* engine.exportArchive(operation);

      expect(result.engine).toBe("libpff");
      expect(result.sourceArtifactId).toBe(operation.source.id);
      expect(result.children).toHaveLength(3);
      const relativePaths = result.children.map((child) => child.relativePath);
      expect(relativePaths).toStrictEqual([...relativePaths].sort());
      expect(relativePaths.every((value) => value.includes(".export/"))).toBe(true);
      expect(relativePaths.some((value) => value.endsWith("Attachments/report.pdf"))).toBe(true);
      expect(result.children.every((child) => child.id.startsWith("artifact:"))).toBe(true);
      expect(result.children.some((child) => child.sizeBytes === 10)).toBe(true);
    }).pipe(Effect.scoped, provideTestLayer)
  );

  it.effect("maps non-zero pffexport exits to archive-export-failed", () =>
    Effect.gen(function* () {
      const { exportRoot, operation, stubPath } = yield* fixture(failingStub);
      const engine = yield* makePffexportFileProcessingEngine(
        PffexportEngineConfig.make({ exportRoot, pffexportPath: stubPath })
      );

      const error = yield* engine.exportArchive(operation).pipe(Effect.flip);

      expect(error.reason).toBe("archive-export-failed");
      expect(error.details).toStrictEqual({ exitCode: "2" });
    }).pipe(Effect.scoped, provideTestLayer)
  );

  it.effect("maps a missing pffexport binary to engine-unavailable", () =>
    Effect.gen(function* () {
      const { exportRoot, operation } = yield* fixture(stubPffexport);
      const engine = yield* makePffexportFileProcessingEngine(
        PffexportEngineConfig.make({ exportRoot, pffexportPath: "/nonexistent/pffexport-missing" })
      );

      const error = yield* engine.exportArchive(operation).pipe(Effect.flip);

      expect(error.reason).toBe("engine-unavailable");
    }).pipe(Effect.scoped, provideTestLayer)
  );

  it.effect("rejects non-pst formats without spawning", () =>
    Effect.gen(function* () {
      const { exportRoot, operation } = yield* fixture(stubPffexport);
      const engine = yield* makePffexportFileProcessingEngine(
        PffexportEngineConfig.make({ exportRoot, pffexportPath: "/nonexistent/pffexport-missing" })
      );

      const error = yield* engine
        .exportArchive(ExportArchiveOperation.make({ ...operation, format: "docx" }))
        .pipe(Effect.flip);

      expect(error.reason).toBe("unsupported-file-format");
    }).pipe(Effect.scoped, provideTestLayer)
  );
});
