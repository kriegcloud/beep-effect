import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExportArchiveOperation } from "@beep/file-processing/Operation";
import { LibpffFileProcessingEngine, makeLibpffFileProcessingEngine } from "@beep/libpff";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const digest = S.decodeUnknownSync(ContentDigest)(
  "sha256:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
);
const artifactId = S.decodeUnknownSync(ArtifactId)(
  "artifact:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
);
const operationId = S.decodeUnknownSync(OperationId)(
  "operation:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
);

const source = SourceArtifact.make({
  digest,
  extension: "pst",
  id: artifactId,
  locator: ArtifactLocator.make({ kind: "synthetic", value: "mailbox.pst" }),
  name: "mailbox.pst",
  relativePath: "mailbox.pst",
  sizeBytes: 4,
});

const operation = ExportArchiveOperation.make({
  format: "pst",
  operationId,
  operationKind: "export-archive",
  preference: { engine: "libpff" },
  source,
});

describe("@beep/libpff", () => {
  it.effect("maps unavailable libpff runtime to an operation-level deferral", () =>
    LibpffFileProcessingEngine.exportArchive(operation).pipe(
      Effect.flip,
      Effect.map((error) => {
        expect(error._tag).toBe("FileProcessingOperationError");
        expect(error.reason).toBe("engine-unavailable");
      })
    )
  );

  it.effect("can emit synthetic child artifacts for proof fixtures", () =>
    makeLibpffFileProcessingEngine({ syntheticExport: true })
      .exportArchive(operation)
      .pipe(
        Effect.map((result) => {
          expect(result.children).toHaveLength(1);
          expect(result.engine).toBe("libpff");
        })
      )
  );
});
