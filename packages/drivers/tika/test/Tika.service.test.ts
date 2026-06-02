import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExtractFileOperation } from "@beep/file-processing/Operation";
import { PosixPath } from "@beep/schema/PosixPath";
import { TikaFileProcessingEngine } from "@beep/tika";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const fixtureIds = Effect.all({
  artifactId: S.decodeUnknownEffect(ArtifactId)(
    "artifact:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
  ),
  digest: S.decodeUnknownEffect(ContentDigest)(
    "sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
  ),
  operationId: S.decodeUnknownEffect(OperationId)(
    "operation:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
  ),
});

type FixtureIds = {
  readonly artifactId: ArtifactId;
  readonly digest: ContentDigest;
  readonly operationId: OperationId;
};

const decodeFixturePath = S.decodeUnknownEffect(PosixPath);

const source = Effect.fn("TikaTest.source")(function* (ids: FixtureIds, extension: string) {
  const relativePath = yield* decodeFixturePath(`fixture.${extension}`);

  return SourceArtifact.make({
    digest: ids.digest,
    extension,
    id: ids.artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
    name: `fixture.${extension}`,
    relativePath,
    sizeBytes: 1,
    text: "a",
  });
});

describe("@beep/tika", () => {
  it.effect("extracts text for a P1 text fixture", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const result = yield* TikaFileProcessingEngine.extract(
        ExtractFileOperation.make({
          format: "plain-text",
          operationId: ids.operationId,
          operationKind: "extract",
          preference: { engine: "tika" },
          source: yield* source(ids, "txt"),
        })
      );

      return yield* Effect.sync(() => {
        expect(result.text).toBe("a");
        expect(result.engine).toBe("apache-tika");
      });
    })
  );

  it.effect("defers DOCX extraction behind an operation-level error", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const error = yield* TikaFileProcessingEngine.extract(
        ExtractFileOperation.make({
          format: "docx",
          operationId: ids.operationId,
          operationKind: "extract",
          preference: { engine: "tika" },
          source: yield* source(ids, "docx"),
        })
      ).pipe(Effect.flip);

      return yield* Effect.sync(() => {
        expect(error._tag).toBe("FileProcessingOperationError");
        expect(error.reason).toBe("engine-unavailable");
      });
    })
  );
});
