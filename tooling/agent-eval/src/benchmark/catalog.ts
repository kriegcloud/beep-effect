/**
 * Benchmark task catalog loading and strict count enforcement.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Path } from "effect";
import * as S from "effect/Schema";
import { AgentEvalConfigError, AgentEvalDecodeError } from "../errors.js";
import { resolveFromCwd } from "../io.js";
import { type AgentTaskSpec, AgentTaskSpecSchema } from "../schemas/index.js";

const decodeTask = S.decodeUnknownSync(S.fromJsonString(AgentTaskSpecSchema));

/**
 * Load task catalog from JSON files and enforce strict task count.
 *
 * @since 0.0.0
 * @category functions
 */
export const loadTaskCatalog: (
  directory: string,
  strictCount: number
) => Effect.Effect<ReadonlyArray<AgentTaskSpec>, unknown, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (directory, strictCount) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const absoluteDirectory = yield* resolveFromCwd(directory);

    const entries = yield* fs.readDirectory(absoluteDirectory);
    const files = entries.filter((entry) => entry.endsWith(".json")).sort((left, right) => left.localeCompare(right));

    const tasks = yield* Effect.forEach(files, (fileName) =>
      Effect.gen(function* () {
        const filePath = path.join(absoluteDirectory, fileName);
        const content = yield* fs.readFileString(filePath, "utf8");
        return yield* Effect.try({
          try: () => decodeTask(content),
          catch: (cause) =>
            new AgentEvalDecodeError({
              source: filePath,
              message: `Invalid task spec in ${filePath}`,
              cause,
            }),
        });
      })
    );

    if (tasks.length !== strictCount) {
      return yield* Effect.fail(
        new AgentEvalConfigError({
          message: `Task count mismatch: expected ${strictCount}, got ${tasks.length}`,
        })
      );
    }

    return tasks;
  }
);
