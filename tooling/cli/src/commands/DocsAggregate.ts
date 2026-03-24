/**
 * Docs aggregation command implementation.
 *
 * This command delegates to the shared human-first docgen aggregation helper so
 * `beep docs aggregate` and `beep docgen aggregate` cannot drift.
 *
 * @module
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import * as O from "effect/Option";
import { Command, Flag } from "effect/unstable/cli";
import { aggregateGeneratedDocs } from "./Docgen/internal/Operations.js";

const packageFlag = Flag.string("package").pipe(
  Flag.withAlias("p"),
  Flag.withDescription("Limit aggregation to one workspace package"),
  Flag.optional
);
const cleanFlag = Flag.boolean("clean").pipe(Flag.withDescription("Remove the root docs directory before aggregating"));

const aggregateDocs = Effect.fn(function* (selector: O.Option<string>, clean: boolean) {
  const results = yield* aggregateGeneratedDocs({
    clean,
    package: O.getOrUndefined(selector),
  });

  if (results.length === 0) {
    yield* Console.log("docs aggregate: no generated package docs found");
    return;
  }

  for (const result of results) {
    yield* Console.log(`docs aggregate: ${result.packagePath} -> docs/${result.docsOutputPath}`);
  }
});

/**
 * Aggregate generated package docs into the root `docs/` layout.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const docsAggregateCommand = Command.make(
  "aggregate",
  {
    package: packageFlag,
    clean: cleanFlag,
  },
  ({ package: selector, clean }) =>
    aggregateDocs(selector, clean).pipe(
      Effect.catchTag(
        "DomainError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docs aggregate: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docs aggregate: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Aggregate generated docs into the current root docs layout"));
