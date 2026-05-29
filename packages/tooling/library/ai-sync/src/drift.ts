/**
 * Local and strict drift checks for generated AI sync artifacts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, FileSystem, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { GENERATED_TIER_ONE_SOURCE_METADATA } from "./_generated/source-metadata.gen.ts";
import {
  fetchSourceText,
  GENERATED_SCHEMAS_PATH,
  GENERATED_SOURCE_METADATA_PATH,
  hashSourceText,
  renderGeneratedSchemas,
  renderGeneratedSourceMetadata,
} from "./generator.ts";
import { AiSyncDriftFinding, AiSyncDriftReport, AiSyncError, AiSyncSourceMetadata } from "./models.ts";
import { TIER_ONE_SOURCES } from "./source-map.ts";

const decodeGeneratedSources = S.decodeUnknownEffect(S.Array(AiSyncSourceMetadata));

const packageRoot = Effect.fn("AiSync.driftPackageRoot")(function* () {
  const path = yield* Path.Path;
  return path.resolve(import.meta.dirname, "..");
});

const readPackageFile = Effect.fn("AiSync.readPackageFile")(function* (relativePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const root = yield* packageRoot();
  return yield* fs.readFileString(path.join(root, relativePath));
});

/**
 * Decode committed generated source metadata.
 *
 * @example
 * ```ts
 * import { getGeneratedSourceMetadata } from "@beep/ai-sync"
 * console.log(getGeneratedSourceMetadata)
 * ```
 * @category constants
 * @since 0.0.0
 */
export const getGeneratedSourceMetadata = Effect.fn("AiSync.getGeneratedSourceMetadata")(function* () {
  return yield* decodeGeneratedSources(GENERATED_TIER_ONE_SOURCE_METADATA).pipe(
    Effect.mapError((cause) =>
      AiSyncError.make({
        message: "Generated source metadata failed schema validation.",
        cause,
      })
    )
  );
});

/**
 * Offline generated artifact freshness check.
 *
 * @example
 * ```ts
 * import { checkGeneratedArtifacts } from "@beep/ai-sync"
 * console.log(checkGeneratedArtifacts)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const checkGeneratedArtifacts = Effect.fn("AiSync.checkGeneratedArtifacts")(function* () {
  const schemaText = yield* readPackageFile(GENERATED_SCHEMAS_PATH).pipe(
    Effect.mapError((cause) =>
      AiSyncError.make({
        message: `Missing generated schemas at ${GENERATED_SCHEMAS_PATH}. Run bun run generate.`,
        cause,
      })
    )
  );
  const sourceMetadataText = yield* readPackageFile(GENERATED_SOURCE_METADATA_PATH).pipe(
    Effect.mapError((cause) =>
      AiSyncError.make({
        message: `Missing generated source metadata at ${GENERATED_SOURCE_METADATA_PATH}. Run bun run generate.`,
        cause,
      })
    )
  );
  const expectedSchemaText = renderGeneratedSchemas();
  const generatedSources = yield* getGeneratedSourceMetadata();
  const expectedSources = TIER_ONE_SOURCES;
  const metadataMatchesSourceMap =
    A.length(generatedSources) === A.length(expectedSources) &&
    A.every(expectedSources, (expected) =>
      A.some(
        generatedSources,
        (actual) =>
          actual.id === expected.id &&
          actual.agent === expected.agent &&
          actual.domain === expected.domain &&
          actual.tier === expected.tier &&
          actual.url === expected.url &&
          actual.versionPin === expected.versionPin &&
          actual.isOfficial === expected.isOfficial &&
          actual.driftMechanism === expected.driftMechanism &&
          actual.contentHash !== undefined
      )
    );
  const expectedSourceMetadataText = renderGeneratedSourceMetadata(generatedSources);
  if (
    schemaText !== expectedSchemaText ||
    sourceMetadataText !== expectedSourceMetadataText ||
    !metadataMatchesSourceMap
  ) {
    return yield* AiSyncError.make({
      message: "Generated AI sync schema artifacts are stale. Run bun run generate.",
    });
  }
  return AiSyncDriftReport.make({ mode: "local", findings: [] });
});

/**
 * Compare a set of sources with an injected fetcher.
 *
 * @param options - Sources and fetcher used to compare committed hashes.
 * @returns Drift findings for sources whose current content differs.
 * @example
 * ```ts
 * import { checkSourceDriftWithFetcher } from "@beep/ai-sync"
 * console.log(checkSourceDriftWithFetcher)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const checkSourceDriftWithFetcher = <R>(options: {
  readonly sources: ReadonlyArray<AiSyncSourceMetadata>;
  readonly fetcher: (source: AiSyncSourceMetadata) => Effect.Effect<string, AiSyncError, R>;
}): Effect.Effect<ReadonlyArray<AiSyncDriftFinding>, AiSyncError, R> =>
  Effect.forEach(
    options.sources,
    (source) =>
      options.fetcher(source).pipe(
        Effect.flatMap(hashSourceText),
        Effect.map((actualHash) =>
          source.contentHash === actualHash
            ? A.empty<AiSyncDriftFinding>()
            : A.make(
                AiSyncDriftFinding.make({
                  sourceId: source.id,
                  expectedHash: source.contentHash ?? "missing",
                  actualHash,
                  message: `${source.id} content hash differs from committed metadata.`,
                })
              )
        )
      ),
    { concurrency: 3 }
  ).pipe(Effect.map(A.flatten));

/**
 * Networked strict drift check against committed Tier-1 hashes.
 *
 * @example
 * ```ts
 * import { checkStrictDrift } from "@beep/ai-sync"
 * console.log(checkStrictDrift)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const checkStrictDrift = Effect.fn("AiSync.checkStrictDrift")(function* () {
  const generatedSources = yield* getGeneratedSourceMetadata();
  const findings = yield* checkSourceDriftWithFetcher({ sources: generatedSources, fetcher: fetchSourceText });

  return AiSyncDriftReport.make({ mode: "strict", findings });
});

/**
 * Fail when strict drift reports any findings.
 *
 * @example
 * ```ts
 * import { assertNoStrictDrift } from "@beep/ai-sync"
 * console.log(assertNoStrictDrift)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const assertNoStrictDrift = Effect.fn("AiSync.assertNoStrictDrift")(function* () {
  return yield* checkStrictDrift().pipe(
    Effect.flatMap((report) =>
      A.length(report.findings) > 0
        ? Effect.fail(
            AiSyncError.make({
              message: pipe(
                report.findings,
                A.map((finding) => `${finding.sourceId}: ${finding.expectedHash} -> ${finding.actualHash}`),
                A.join("\n")
              ),
            })
          )
        : Effect.succeed(report)
    )
  );
});
