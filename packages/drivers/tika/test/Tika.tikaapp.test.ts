import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExtractFileOperation } from "@beep/file-processing/Operation";
import { NonNegativeInt } from "@beep/schema";
import { PosixPath } from "@beep/schema/PosixPath";
import { makeTikaAppFileProcessingEngine, TikaAppEngineConfig } from "@beep/tika";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import type { FileFormatFamily } from "@beep/file-processing/Strategy";

const testLayer = NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer));

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const provideTestLayer = provideScopedLayer(testLayer);

const stubJava = `#!/usr/bin/env bash
printf '%s' '[{"Content-Type":"application/pdf","dc:title":"Probe Title","X-TIKA:Parsed-By":["org.apache.tika.parser.CompositeParser","org.apache.tika.parser.pdf.PDFParser"],"X-TIKA:content":"\\n\\n  hello corpus world\\n\\n"}]'
exit 0
`;

const failingStub = `#!/usr/bin/env bash
exit 1
`;

const fixture = Effect.fn(function* (stubScript: string, format: FileFormatFamily) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: "tika-app-test-" });
  const stubPath = path.join(dir, "java-stub");
  yield* fs.writeFileString(stubPath, stubScript);
  yield* fs.chmod(stubPath, 0o755);
  const sourcePath = path.join(dir, "document.pdf");
  yield* fs.writeFileString(sourcePath, "not a real pdf");

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
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("document.pdf");

  const operation = ExtractFileOperation.make({
    format,
    operationId,
    operationKind: "extract",
    preference: { engine: "tika" },
    source: SourceArtifact.make({
      digest,
      extension: "pdf",
      id: artifactId,
      locator: ArtifactLocator.make({ kind: "file", value: locatorValue }),
      name: "document.pdf",
      relativePath,
      sizeBytes: NonNegativeInt.make(14),
    }),
  });

  return { operation, stubPath };
});

describe("makeTikaAppFileProcessingEngine", () => {
  it.effect("extracts trimmed text and stringified metadata via tika-app", () =>
    Effect.gen(function* () {
      const { operation, stubPath } = yield* fixture(stubJava, "pdf-text-layer");
      const engine = yield* makeTikaAppFileProcessingEngine(
        TikaAppEngineConfig.make({ jarPath: "/opt/tika/tika-app.jar", javaPath: stubPath })
      );

      const result = yield* engine.extract(operation);

      expect(result.engine).toBe("apache-tika");
      expect(result.text).toBe("hello corpus world");
      expect(result.metadata["Content-Type"]).toBe("application/pdf");
      expect(result.metadata["dc:title"]).toBe("Probe Title");
      expect(result.metadata["X-TIKA:Parsed-By"]).toContain("PDFParser");
      expect(result.metadata["X-TIKA:content"]).toBeUndefined();
    }).pipe(Effect.scoped, provideTestLayer)
  );

  it.effect("returns metadata only for image-metadata sources", () =>
    Effect.gen(function* () {
      const { operation, stubPath } = yield* fixture(stubJava, "image-metadata");
      const engine = yield* makeTikaAppFileProcessingEngine(
        TikaAppEngineConfig.make({ jarPath: "/opt/tika/tika-app.jar", javaPath: stubPath })
      );

      const result = yield* engine.extract(operation);

      expect(result.text).toBeUndefined();
      expect(result.metadata["Content-Type"]).toBe("application/pdf");
    }).pipe(Effect.scoped, provideTestLayer)
  );

  it.effect("maps non-zero tika exits to file-extraction-failed", () =>
    Effect.gen(function* () {
      const { operation, stubPath } = yield* fixture(failingStub, "pdf-text-layer");
      const engine = yield* makeTikaAppFileProcessingEngine(
        TikaAppEngineConfig.make({ jarPath: "/opt/tika/tika-app.jar", javaPath: stubPath })
      );

      const error = yield* engine.extract(operation).pipe(Effect.flip);

      expect(error.reason).toBe("file-extraction-failed");
    }).pipe(Effect.scoped, provideTestLayer)
  );

  it.effect("maps a missing java binary to engine-unavailable", () =>
    Effect.gen(function* () {
      const { operation } = yield* fixture(stubJava, "pdf-text-layer");
      const engine = yield* makeTikaAppFileProcessingEngine(
        TikaAppEngineConfig.make({ jarPath: "/opt/tika/tika-app.jar", javaPath: "/nonexistent/java-missing" })
      );

      const error = yield* engine.extract(operation).pipe(Effect.flip);

      expect(error.reason).toBe("engine-unavailable");
    }).pipe(Effect.scoped, provideTestLayer)
  );
});
