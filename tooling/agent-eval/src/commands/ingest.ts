/**
 * Ingest command implementation.
 *
 * @since 0.0.0
 * @module
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { addMemoryEpisode } from "../graphiti/mcp.js";
import * as S from "effect/Schema";
import {
  KnowledgeFeedbackEpisodeSchema,
  type KnowledgeFeedbackEpisode,
  type AgentBenchSuite,
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
    throw new Error("Missing run record");
  }

  const failureType = record.result.wrongApiIncidentCount > 0 ? "WrongApi" : "AcceptanceFailure";
  const rootCause =
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
export const handleIngest = async (args: IngestArgs): Promise<ReadonlyArray<KnowledgeFeedbackEpisode>> => {
  const suite = await readSuiteFile(args.input);
  const failedIndexes = suite.records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => !record.result.success)
    .map(({ index }) => index);

  const decodeEpisode = S.decodeUnknownSync(KnowledgeFeedbackEpisodeSchema);
  const episodes = failedIndexes.map((index) => decodeEpisode(toEpisode(suite, index)));

  const outputPath = path.resolve(args.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(episodes, null, 2)}\n`, "utf8");

  if (args.publish) {
    for (const episode of episodes) {
      const body = [
        `runId=${episode.runId}`,
        `taskId=${episode.taskId}`,
        `failureType=${episode.failureType}`,
        `rootCause=${episode.rootCause}`,
        `condition=${episode.condition}`,
        `sources=${episode.sourceFiles.join(",")}`,
        `facts=${episode.correctionFacts.join(" | ")}`,
      ].join("\n");

      await addMemoryEpisode(
        {
          url: args.graphitiUrl,
          groupId: args.graphitiGroupId,
        },
        `agent-eval:${episode.taskId}`,
        body
      ).catch(() => undefined);
    }
  }

  return episodes;
};
