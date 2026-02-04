/**
 * CLI: Effect Ontology
 *
 * Command-line interface for knowledge extraction and reasoning tools.
 * Built with @effect/cli for type-safe command parsing.
 *
 * @since 2.0.0
 * @module Cli
 */

import { Command } from "@effect/cli"
import { FetchHttpClient } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as PgDrizzle from "@effect/sql-drizzle/Pg"
import { PgClient } from "@effect/sql-pg"
import { Config, Effect, Layer, Option } from "effect"
import { makeLanguageModelLayer } from "../Runtime/ProductionRuntime.js"
import { ConfigServiceDefault } from "../Service/Config.js"
import { ContentEnrichmentAgent } from "../Service/ContentEnrichmentAgent.js"
import { ImageExtractor } from "../Service/ImageExtractor.js"
import { ImageFetcher } from "../Service/ImageFetcher.js"
import { ImageStore } from "../Service/ImageStore.js"
import { JinaReaderClient } from "../Service/JinaReaderClient.js"
import { LinkIngestionService } from "../Service/LinkIngestionService.js"
import { RdfBuilder } from "../Service/Rdf.js"
import { Reasoner } from "../Service/Reasoner.js"
import { StorageServiceLive } from "../Service/Storage.js"
import { WikidataClient } from "../Service/WikidataClient.js"
import { extractCommand } from "./Commands/Extract.js"
import { documentsCommand, fetchCommand, ingestBatchCommand, ingestLinkCommand } from "./Commands/Fetch.js"
import { inferenceCommand } from "./Commands/Inference.js"
import { ingestCommand } from "./Commands/Ingest.js"
import { linkCommand } from "./Commands/Link.js"
import { reconcileCommand } from "./Commands/Reconcile.js"
import { storageCommand } from "./Commands/Storage.js"
import { workflowCommand } from "./Commands/Workflow.js"

// =============================================================================
// Root Command
// =============================================================================

const rootCommand = Command.make("effect-onto").pipe(
  Command.withSubcommands([
    extractCommand,
    inferenceCommand,
    ingestCommand,
    reconcileCommand,
    linkCommand,
    storageCommand,
    fetchCommand,
    ingestLinkCommand,
    ingestBatchCommand,
    documentsCommand,
    workflowCommand
  ]),
  Command.withDescription("Effect Ontology CLI - Knowledge extraction and reasoning tools")
)

// =============================================================================
// Layer Composition
// =============================================================================

/**
 * PostgreSQL client layer
 */
const PgClientLayer = PgClient.layerConfig({
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT").pipe(Config.withDefault(5432)),
  database: Config.string("POSTGRES_DATABASE").pipe(Config.withDefault("workflow")),
  username: Config.string("POSTGRES_USER").pipe(Config.withDefault("workflow")),
  password: Config.redacted("POSTGRES_PASSWORD")
})

/**
 * PgDrizzle layer with PgClient dependency
 */
const PgDrizzleLayer = PgDrizzle.layer.pipe(Layer.provideMerge(PgClientLayer))

/**
 * Full LinkIngestion stack when PostgreSQL is configured
 */
const LinkIngestionLive = LinkIngestionService.Default.pipe(
  Layer.provideMerge(ContentEnrichmentAgent.Default),
  Layer.provideMerge(JinaReaderClient.Default),
  Layer.provideMerge(PgDrizzleLayer),
  Layer.provideMerge(ImageExtractor.Default),
  Layer.provideMerge(ImageFetcher.Default),
  Layer.provideMerge(ImageStore.Default),
  Layer.provideMerge(makeLanguageModelLayer),
  Layer.provideMerge(FetchHttpClient.layer),
  Layer.provideMerge(StorageServiceLive),
  Layer.provideMerge(ConfigServiceDefault)
)

/**
 * Dynamic LinkIngestion layer selection based on POSTGRES_HOST config.
 * Uses Layer.unwrapEffect for config-driven layer selection.
 */
const LinkIngestionLayer = Layer.unwrapEffect(
  Effect.gen(function*() {
    const postgresHost = yield* Config.string("POSTGRES_HOST").pipe(Config.option)

    if (Option.isSome(postgresHost)) {
      return LinkIngestionLive
    } else {
      // Use the service's built-in Disabled layer
      return LinkIngestionService.Disabled
    }
  })
)

/**
 * CLI runtime layer with all required services
 *
 * Provides:
 * - ConfigService (via ConfigServiceDefault with env loading)
 * - RdfBuilder (Turtle parsing/serialization)
 * - Reasoner (RDFS reasoning)
 * - StorageService (file/GCS storage)
 * - WikidataClient (Wikidata API integration)
 * - JinaReaderClient (Jina Reader API for URL fetching)
 * - LinkIngestionService (mocked if Postgres not configured)
 * - BunContext (FileSystem, Path, etc.)
 */
const CliLive = Layer.mergeAll(
  Reasoner.Default,
  RdfBuilder.Default,
  StorageServiceLive,
  WikidataClient.Default,
  JinaReaderClient.Default,
  LinkIngestionLayer
).pipe(
  Layer.provide(ConfigServiceDefault),
  Layer.provideMerge(BunContext.layer)
)

// =============================================================================
// Entry Point
// =============================================================================

/**
 * Run the CLI with provided arguments
 *
 * @param args - Command line arguments (typically Bun.argv)
 */
export const runCli = (args: ReadonlyArray<string>) => {
  const effect = Command.run(rootCommand, {
    name: "effect-onto",
    version: "0.1.0"
  })(args)

  return effect.pipe(Effect.provide(CliLive), BunRuntime.runMain)
}
