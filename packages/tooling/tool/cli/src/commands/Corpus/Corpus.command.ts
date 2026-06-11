/**
 * Command definitions for corpus curation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { CorpusCatalogOptions } from "./Corpus.schemas.js";
import { CorpusCommandServiceLive, catalogCorpus, printCorpusIndex } from "./Corpus.service.js";

const catalogCorpusRootFlag = Flag.directory("corpus-root", { mustExist: true }).pipe(
  Flag.withDescription(
    "Salvaged corpus root containing raw/provenance.jsonl; catalog outputs land under <corpus-root>/catalog"
  )
);

const corpusCatalogCommand = Command.make(
  "catalog",
  {
    corpusRoot: catalogCorpusRootFlag,
  },
  Effect.fn(function* ({ corpusRoot }) {
    yield* catalogCorpus(CorpusCatalogOptions.make({ corpusRoot })).pipe(Effect.asVoid);
  })
).pipe(
  Command.withDescription(
    "Build the corpus DuckDB catalog, exact-duplicate report, and recycle-bin name-restoration manifest"
  ),
  Command.provide(CorpusCommandServiceLive)
);

/**
 * Corpus curation command group.
 *
 * @example
 * ```ts
 * import { corpusCommand } from "@beep/repo-cli/commands/Corpus"
 * console.log(corpusCommand)
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const corpusCommand = Command.make("corpus", {}, () => printCorpusIndex).pipe(
  Command.withDescription("Corpus salvage and curation commands"),
  Command.withSubcommands([corpusCatalogCommand])
);
