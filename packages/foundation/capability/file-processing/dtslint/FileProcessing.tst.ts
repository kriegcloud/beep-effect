import { ArtifactLocator, SourceArtifact } from "@beep/file-processing/Artifact";
import { ExtractFileOperation, ProcessFileOperation } from "@beep/file-processing/Operation";
import { extractFile, makeFileProcessingServiceLayer, processFile } from "@beep/file-processing/Service";
import { SelectedStrategy, StrategyPreference } from "@beep/file-processing/Strategy";
import { TestFileProcessingEngine } from "@beep/file-processing/test";
import { describe, expect, it } from "tstyche";
import type { ArtifactId, ContentDigest, OperationId } from "@beep/file-processing/Artifact";
import type { ExtractionResult, ProcessFileResult, SourceProcessingRecord } from "@beep/file-processing/Extraction";
import type { FileProcessingOperationError } from "@beep/file-processing/Operation";
import type { FileProcessingEngineShape, FileProcessingService } from "@beep/file-processing/Service";
import type { FileFormatFamily } from "@beep/file-processing/Strategy";
import type { NonNegativeInt } from "@beep/schema";
import type { PosixPath } from "@beep/schema/PosixPath";
import type { Effect, Layer } from "effect";
import type * as Crypto from "effect/Crypto";

declare const artifactId: ArtifactId;
declare const digest: ContentDigest;
declare const operationId: OperationId;
declare const fixturePath: PosixPath;
declare const sizeBytes: NonNegativeInt;

const source = SourceArtifact.make({
  digest,
  extension: "md",
  id: artifactId,
  locator: ArtifactLocator.make({ kind: "synthetic", value: fixturePath }),
  name: "fixture.md",
  relativePath: fixturePath,
  sizeBytes,
  text: "hello proof",
});

describe("@beep/file-processing", () => {
  it("resolves root, concept, service, and test subpath exports", () => {
    const extract = ExtractFileOperation.make({
      format: "markdown",
      operationId,
      operationKind: "extract",
      preference: StrategyPreference.make({ engine: "test" }),
      source,
    });
    const process = ProcessFileOperation.make({
      exportChildren: false,
      operationId,
      operationKind: "process",
      preference: StrategyPreference.make({ engine: "test" }),
      source,
    });
    expect<"markdown">().type.toBeAssignableTo<FileFormatFamily>();
    expect(SelectedStrategy).type.toBeAssignableTo<object>();
    expect(TestFileProcessingEngine).type.toBe<FileProcessingEngineShape>();
    expect(makeFileProcessingServiceLayer([TestFileProcessingEngine])).type.toBe<
      Layer.Layer<FileProcessingService, never, Crypto.Crypto>
    >();
    expect(extractFile(extract)).type.toBe<
      Effect.Effect<ExtractionResult, FileProcessingOperationError, FileProcessingService>
    >();
    expect(processFile(process)).type.toBe<
      Effect.Effect<ProcessFileResult, FileProcessingOperationError, FileProcessingService>
    >();
  });

  it("keeps manifest row state combinations typed", () => {
    expect<SourceProcessingRecord["status"]>().type.toBe<"succeeded" | "skipped" | "failed">();
    expect<ProcessFileResult["resultKind"]>().type.toBe<"extracted" | "archive-exported" | "skipped">();
  });
});
