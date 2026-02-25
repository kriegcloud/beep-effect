/**
 * Ingest command implementation.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path } from "effect";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { AgentEvalDecodeError, AgentEvalInvariantError } from "../errors.js";
import { addMemoryEpisode } from "../graphiti/mcp.js";
import { writeFileUtf8 } from "../io.js";
import {
  type AgentBenchSuite,
  type KnowledgeFeedbackEpisode,
  KnowledgeFeedbackEpisodeSchema,
} from "../schemas/index.js";
import { readSuiteFile } from "./bench.js";

/**
 * Ingest command arguments.
 *
 * @since 0.0.0
 * @category models
 */
export interface IngestArgs {
  readonly input: string;
  readonly output: string;
  readonly graphitiUrl: string;
  readonly graphitiGroupId: string;
  readonly publish: boolean;
}

const toEpisode = (suite: AgentBenchSuite, index: number): KnowledgeFeedbackEpisode => {
  const record = suite.records[index];
  if (!record) {
    throw new AgentEvalInvariantError({
      message: `Missing run record at index ${index}`,
    });
  }

  const failureType =
    record.failureSignature?.failureType === "effect_compliance"
      ? "EffectComplianceFailure"
      : record.result.wrongApiIncidentCount > 0
        ? "WrongApi"
        : "AcceptanceFailure";
  const rootCause =
    record.failureSignature?.rootCause ??
    record.retrievedFacts[0] ??
    (record.result.wrongApiIncidentCount > 0
      ? "Critical Effect v4 API mismatch detected"
      : "Acceptance command failure");

  return {
    runId: record.result.runId,
    taskId: record.task.id,
    failureType,
    rootCause,
    correctionFacts: record.retrievedFacts,
    sourceFiles: record.task.touchedPathAllowlist,
    condition: record.config.condition,
  };
};

/**
 * Convert failed runs into typed feedback episodes and optionally publish to Graphiti.
 *
 * @since 0.0.0
 * @category commands
 */
export const handleIngest: (
  args: IngestArgs
) => Effect.Effect<ReadonlyArray<KnowledgeFeedbackEpisode>, unknown, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (args) {
    const suite = yield* readSuiteFile(args.input);
    const failedIndexes: Array<number> = [];
    for (let index = 0; index < suite.records.length; index += 1) {
      const record = suite.records[index];
      if (record && !record.result.success) {
        failedIndexes.push(index);
      }
    }

    const decodeEpisode = S.decodeUnknownSync(KnowledgeFeedbackEpisodeSchema);
    const episodes = yield* Effect.forEach(failedIndexes, (index) =>
      Effect.try({
        try: () => decodeEpisode(toEpisode(suite, index)),
        catch: (cause) =>
          new AgentEvalDecodeError({
            source: args.input,
            message: `Invalid knowledge episode generated from ${args.input}`,
            cause,
          }),
      })
    );

    yield* writeFileUtf8(args.output, `${JSON.stringify(episodes, null, 2)}\n`);

    if (args.publish) {
      yield* Effect.forEach(
        episodes,
        (episode) =>
          Effect.promise(() => {
            const body = [
              `runId=${episode.runId}`,
              `taskId=${episode.taskId}`,
              `failureType=${episode.failureType}`,
              `rootCause=${episode.rootCause}`,
              `condition=${episode.condition}`,
              `sources=${episode.sourceFiles.join(",")}`,
              `facts=${episode.correctionFacts.join(" | ")}`,
            ].join("\n");

            return addMemoryEpisode(
              {
                url: args.graphitiUrl,
                groupId: args.graphitiGroupId,
              },
              `agent-eval:${episode.taskId}`,
              body
            );
          }).pipe(Effect.orElseSucceed(() => undefined)),
        { discard: true }
      );
    }

    return episodes;
  }
);
