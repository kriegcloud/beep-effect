import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExtractFileOperation, ProcessFileOperation } from "@beep/file-processing/Operation";
import { extractFile, makeFileProcessingServiceLayer, processFile } from "@beep/file-processing/Service";
import { TestFileProcessingEngine } from "@beep/file-processing/test";
import { PosixPath } from "@beep/schema/PosixPath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const fixtureIds = Effect.all({
  artifactId: S.decodeUnknownEffect(ArtifactId)(
    "artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  ),
  digest: S.decodeUnknownEffect(ContentDigest)(
    "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  ),
  operationId: S.decodeUnknownEffect(OperationId)(
    "operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  ),
});

type FixtureIds = {
  readonly artifactId: ArtifactId;
  readonly digest: ContentDigest;
  readonly operationId: OperationId;
};

const decodeFixturePath = S.decodeUnknownEffect(PosixPath);

const makeSource = Effect.fn("FileProcessingTest.makeSource")(function* (
  ids: FixtureIds,
  extension: string,
  text?: string
) {
  const relativePath = yield* decodeFixturePath(`readme.${extension}`);
  const locatorPath = yield* decodeFixturePath(`fixtures/readme.${extension}`);

  return SourceArtifact.make({
    digest: ids.digest,
    extension,
    id: ids.artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: locatorPath }),
    name: `readme.${extension}`,
    relativePath,
    sizeBytes: text?.length ?? 11,
    ...(text === undefined ? {} : { text }),
  });
});

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const serviceLayer = makeFileProcessingServiceLayer([TestFileProcessingEngine]);

describe("@beep/file-processing", () => {
  it.effect("extracts synthetic text through the service contract", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const result = yield* extractFile(
        ExtractFileOperation.make({
          format: "markdown",
          operationId: ids.operationId,
          operationKind: "extract",
          preference: { engine: "test" },
          source: yield* makeSource(ids, "md", "hello proof"),
        })
      ).pipe(provideScopedLayer(serviceLayer));

      expect(result.text).toBe("hello proof");
      expect(result.format).toBe("markdown");
    })
  );

  it.effect("processes synthetic text through the service contract", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const result = yield* processFile(
        ProcessFileOperation.make({
          exportChildren: false,
          operationId: ids.operationId,
          operationKind: "process",
          preference: { engine: "test" },
          source: yield* makeSource(ids, "md", "hello proof"),
        })
      ).pipe(provideScopedLayer(serviceLayer));

      expect(result.resultKind).toBe("extracted");
      if (result.resultKind === "extracted") {
        expect(result.extraction.text).toBe("hello proof");
      }
    })
  );

  it.effect("exports PST children through process when requested", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const result = yield* processFile(
        ProcessFileOperation.make({
          exportChildren: true,
          operationId: ids.operationId,
          operationKind: "process",
          preference: { engine: "test" },
          source: yield* makeSource(ids, "pst"),
        })
      ).pipe(provideScopedLayer(serviceLayer));

      expect(result.resultKind).toBe("archive-exported");
      if (result.resultKind === "archive-exported") {
        expect(result.archiveExport.children).toHaveLength(1);
      }
    })
  );

  it.effect("skips PST child export when it is not requested", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const result = yield* processFile(
        ProcessFileOperation.make({
          exportChildren: false,
          operationId: ids.operationId,
          operationKind: "process",
          preference: { engine: "test" },
          source: yield* makeSource(ids, "pst"),
        })
      ).pipe(provideScopedLayer(serviceLayer));

      expect(result.resultKind).toBe("skipped");
      if (result.resultKind === "skipped") {
        expect(result.skipReason).toBe("operation-not-required");
      }
    })
  );
});
