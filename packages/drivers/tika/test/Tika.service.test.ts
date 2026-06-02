import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExtractFileOperation } from "@beep/file-processing/Operation";
import { TikaFileProcessingEngine } from "@beep/tika";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const digest = S.decodeUnknownSync(ContentDigest)(
  "sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
);
const artifactId = S.decodeUnknownSync(ArtifactId)(
  "artifact:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
);
const operationId = S.decodeUnknownSync(OperationId)(
  "operation:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
);

const source = (extension: string) =>
  SourceArtifact.make({
    digest,
    extension,
    id: artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: `fixture.${extension}` }),
    name: `fixture.${extension}`,
    relativePath: `fixture.${extension}`,
    sizeBytes: 1,
    text: "a",
  });

describe("@beep/tika", () => {
  it.effect("extracts text for a P1 text fixture", () =>
    TikaFileProcessingEngine.extract(
      ExtractFileOperation.make({
        format: "plain-text",
        operationId,
        operationKind: "extract",
        preference: { engine: "tika" },
        source: source("txt"),
      })
    ).pipe(
      Effect.map((result) => {
        expect(result.text).toBe("a");
        expect(result.engine).toBe("apache-tika");
      })
    )
  );

  it.effect("defers DOCX extraction behind an operation-level error", () =>
    TikaFileProcessingEngine.extract(
      ExtractFileOperation.make({
        format: "docx",
        operationId,
        operationKind: "extract",
        preference: { engine: "tika" },
        source: source("docx"),
      })
    ).pipe(
      Effect.flip,
      Effect.map((error) => {
        expect(error._tag).toBe("FileProcessingOperationError");
        expect(error.reason).toBe("engine-unavailable");
      })
    )
  );
});
