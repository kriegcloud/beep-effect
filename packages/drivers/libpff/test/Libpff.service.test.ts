import {
  ArtifactId,
  ArtifactLocator,
  ContentDigest,
  OperationId,
  SourceArtifact,
} from "@beep/file-processing/Artifact";
import { ExportArchiveOperation } from "@beep/file-processing/Operation";
import { LibpffFileProcessingEngine, makeLibpffFileProcessingEngine } from "@beep/libpff";
import { NonNegativeInt } from "@beep/schema";
import { PosixPath } from "@beep/schema/PosixPath";
import { provideScopedLayer } from "@beep/test-utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

const SourceArtifactArbitrary = S.toArbitrary(SourceArtifact);
const ExportArchiveOperationArbitrary = S.toArbitrary(ExportArchiveOperation);
const encodeSourceArtifact = S.encodeEffect(SourceArtifact);
const decodeSourceArtifact = S.decodeUnknownEffect(SourceArtifact);
const encodeExportArchiveOperation = S.encodeEffect(ExportArchiveOperation);
const decodeExportArchiveOperation = S.decodeUnknownEffect(ExportArchiveOperation);
const providePlatform = provideScopedLayer(NodeServices.layer);

const fixtureIds = Effect.all({
  artifactId: S.decodeUnknownEffect(ArtifactId)(
    "artifact:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  ),
  digest: S.decodeUnknownEffect(ContentDigest)(
    "sha256:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  ),
  operationId: S.decodeUnknownEffect(OperationId)(
    "operation:3a6eb0790f39ac87c94f3856b2dd2c5d110e6811602261a9a923d3bb23adc8b7"
  ),
});

type FixtureIds = {
  readonly artifactId: ArtifactId;
  readonly digest: ContentDigest;
  readonly operationId: OperationId;
};

const decodeFixturePath = S.decodeUnknownEffect(PosixPath);

const source = Effect.fn("LibpffTest.source")(function* (ids: FixtureIds) {
  const relativePath = yield* decodeFixturePath("mailbox.pst");

  return SourceArtifact.make({
    digest: ids.digest,
    extension: "pst",
    id: ids.artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
    name: "mailbox.pst",
    relativePath,
    sizeBytes: NonNegativeInt.make(4),
  });
});

const operation = Effect.fn("LibpffTest.operation")(function* (ids: FixtureIds) {
  const mailbox = yield* source(ids);

  return ExportArchiveOperation.make({
    format: "pst",
    operationId: ids.operationId,
    operationKind: "export-archive",
    preference: { engine: "libpff" },
    source: mailbox,
  });
});

describe("@beep/libpff", () => {
  it("round-trips schema-derived archive operation data through file-processing schemas", () =>
    fc.assert(
      fc.property(SourceArtifactArbitrary, ExportArchiveOperationArbitrary, (sourceArtifact, exportOperation) => {
        const encodedSourceArtifact = Effect.runSync(encodeSourceArtifact(sourceArtifact));
        const decodedSourceArtifact = Effect.runSync(decodeSourceArtifact(encodedSourceArtifact));
        expect(Effect.runSync(encodeSourceArtifact(decodedSourceArtifact))).toEqual(encodedSourceArtifact);

        const encodedExportOperation = Effect.runSync(encodeExportArchiveOperation(exportOperation));
        const decodedExportOperation = Effect.runSync(decodeExportArchiveOperation(encodedExportOperation));
        expect(Effect.runSync(encodeExportArchiveOperation(decodedExportOperation))).toEqual(encodedExportOperation);
      }),
      { numRuns: 25 }
    ));

  it.effect("maps unavailable libpff runtime to an operation-level deferral", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const error = yield* LibpffFileProcessingEngine.exportArchive(yield* operation(ids)).pipe(Effect.flip);

      return yield* Effect.sync(() => {
        expect(error._tag).toBe("FileProcessingOperationError");
        expect(error.reason).toBe("engine-unavailable");
      });
    }).pipe(providePlatform)
  );

  it.effect("can emit synthetic child artifacts for proof fixtures", () =>
    Effect.gen(function* () {
      const ids = yield* fixtureIds;
      const result = yield* makeLibpffFileProcessingEngine({ syntheticExport: true }).exportArchive(
        yield* operation(ids)
      );

      return yield* Effect.sync(() => {
        expect(result.children).toHaveLength(1);
        expect(result.children[0]?.id).not.toBe(ids.artifactId);
        expect(result.engine).toBe("libpff");
      });
    }).pipe(providePlatform)
  );
});
