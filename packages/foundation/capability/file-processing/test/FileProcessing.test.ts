import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExtractFileOperation } from "@beep/file-processing/Operation";
import { extractFile, FileProcessingService } from "@beep/file-processing/Service";
import { TestFileProcessingEngine } from "@beep/file-processing/test";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const digest = S.decodeUnknownSync(ContentDigest)(
  "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
);
const artifactId = S.decodeUnknownSync(ArtifactId)(
  "artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
);
const operationId = S.decodeUnknownSync(OperationId)(
  "operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
);

const source = SourceArtifact.make({
  digest,
  extension: "md",
  id: artifactId,
  locator: ArtifactLocator.make({ kind: "synthetic", value: "fixtures/readme.md" }),
  name: "readme.md",
  relativePath: "readme.md",
  sizeBytes: 11,
  text: "hello proof",
});

describe("@beep/file-processing", () => {
  it.effect("extracts synthetic text through the service contract", () =>
    extractFile(
      ExtractFileOperation.make({
        format: "markdown",
        operationId,
        operationKind: "extract",
        preference: { engine: "test" },
        source,
      })
    ).pipe(
      Effect.provideService(
        FileProcessingService,
        FileProcessingService.of({
          detect: TestFileProcessingEngine.detect,
          exportArchive: TestFileProcessingEngine.exportArchive,
          extract: TestFileProcessingEngine.extract,
          process: Effect.fn("FileProcessingService.process")((operation) =>
            TestFileProcessingEngine.extract({
              format: "markdown",
              operationId: operation.operationId,
              operationKind: "extract",
              preference: operation.preference,
              source: operation.source,
            })
          ),
        })
      ),
      Effect.map((result) => {
        expect(result.text).toBe("hello proof");
        expect(result.format).toBe("markdown");
      })
    )
  );
});
