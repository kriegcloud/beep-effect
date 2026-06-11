/**
 * Command definitions for corpus curation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect } from "effect";
import * as O from "effect/Option";
import { Command, Flag } from "effect/unstable/cli";
import { CorpusCatalogOptions, CorpusExtractOptions, CorpusSalvageOptions } from "./Corpus.schemas.js";
import {
  CorpusCommandServiceLive,
  catalogCorpus,
  extractCorpus,
  printCorpusIndex,
  verifySalvage,
} from "./Corpus.service.js";

const corpusRootFlag = Flag.directory("corpus-root", { mustExist: true }).pipe(
  Flag.withDescription(
    "Salvaged corpus root containing raw/provenance.jsonl; outputs land under <corpus-root>/catalog and <corpus-root>/staging"
  )
);
const tikaJarFlag = Flag.file("tika-jar", { mustExist: true }).pipe(
  Flag.withDescription("Apache tika-app jar used for text and metadata extraction")
);
const pffexportFlag = Flag.string("pffexport").pipe(
  Flag.withDescription("pffexport binary used for PST archive export"),
  Flag.optional
);
const javaFlag = Flag.string("java").pipe(
  Flag.withDescription("java binary used to run the tika-app jar"),
  Flag.optional
);
const exportChildrenFlag = Flag.boolean("export-children").pipe(
  Flag.withDescription("Export per-message child artifacts and attachments from PST archives")
);
const includeDuplicatesFlag = Flag.boolean("include-duplicates").pipe(
  Flag.withDescription("Process every manifest record instead of one representative per content digest")
);
const sourceLabelFlag = Flag.string("source").pipe(
  Flag.withDescription("Restrict extraction to one salvage source label"),
  Flag.optional
);
const extractConcurrencyFlag = Flag.integer("concurrency").pipe(
  Flag.withDefault(4),
  Flag.withDescription("Bounded number of concurrent extraction subprocesses")
);
const maxFilesFlag = Flag.integer("max-files").pipe(
  Flag.withDescription("Process at most this many sources (smoke runs)"),
  Flag.optional
);
const extractOverwriteFlag = Flag.boolean("overwrite").pipe(
  Flag.withDescription("Replace an existing staging/extract output tree")
);
const sampleStrideFlag = Flag.integer("sample-stride").pipe(
  Flag.withDescription("Verify every Nth provenance record instead of all records"),
  Flag.optional
);

const corpusCatalogCommand = Command.make(
  "catalog",
  {
    corpusRoot: corpusRootFlag,
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

const corpusExtractCommand = Command.make(
  "extract",
  {
    concurrency: extractConcurrencyFlag,
    corpusRoot: corpusRootFlag,
    exportChildren: exportChildrenFlag,
    includeDuplicates: includeDuplicatesFlag,
    java: javaFlag,
    maxFiles: maxFilesFlag,
    overwrite: extractOverwriteFlag,
    pffexport: pffexportFlag,
    source: sourceLabelFlag,
    tikaJar: tikaJarFlag,
  },
  Effect.fn(function* ({
    concurrency,
    corpusRoot,
    exportChildren,
    includeDuplicates,
    java,
    maxFiles,
    overwrite,
    pffexport,
    source,
    tikaJar,
  }) {
    yield* extractCorpus(
      CorpusExtractOptions.make({
        concurrency,
        corpusRoot,
        exportChildren,
        includeDuplicates,
        overwrite,
        tikaJarPath: tikaJar,
        ...(O.isNone(java) ? {} : { javaPath: java.value }),
        ...(O.isNone(maxFiles) ? {} : { maxFiles: maxFiles.value }),
        ...(O.isNone(pffexport) ? {} : { pffexportPath: pffexport.value }),
        ...(O.isNone(source) ? {} : { sourceLabel: source.value }),
      })
    ).pipe(Effect.asVoid);
  })
).pipe(
  Command.withDescription("Run libpff and Tika extraction over salvaged raw/ files into staging/extract"),
  Command.provide(CorpusCommandServiceLive)
);

const corpusSalvageCommand = Command.make(
  "salvage",
  {
    corpusRoot: corpusRootFlag,
    sampleStride: sampleStrideFlag,
  },
  Effect.fn(function* ({ corpusRoot, sampleStride }) {
    yield* verifySalvage(
      CorpusSalvageOptions.make({
        corpusRoot,
        ...(O.isNone(sampleStride) ? {} : { sampleStride: sampleStride.value }),
      })
    ).pipe(Effect.asVoid);
  })
).pipe(
  Command.withDescription("Re-hash salvaged raw/ files against the provenance manifest"),
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
  Command.withSubcommands([corpusCatalogCommand, corpusExtractCommand, corpusSalvageCommand])
);
