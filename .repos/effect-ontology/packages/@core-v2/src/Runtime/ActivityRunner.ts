/**
 * Activity Runner Entry Point
 *
 * Single Cloud Run Job that dispatches activities based on ACTIVITY_NAME env var.
 * Receives ACTIVITY_PAYLOAD as JSON and routes to the appropriate activity.
 *
 * Environment Variables:
 * - ACTIVITY_NAME: "extraction" | "resolution" | "validation" | "ingestion"
 * - ACTIVITY_PAYLOAD: JSON string containing activity input
 *
 * @since 2.0.0
 * @module Runtime/ActivityRunner
 */

import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Config, Console, Effect, Layer, Match, Schema } from "effect"
import {
  ExtractionActivityInput,
  IngestionActivityInput,
  ResolutionActivityInput,
  ValidationActivityInput
} from "../Domain/Schema/Batch.js"
import { ConfigServiceDefault } from "../Service/Config.js"
import { EntityExtractor, RelationExtractor } from "../Service/Extraction.js"
import { StageTimeoutServiceLive } from "../Service/LlmControl/StageTimeout.js"
import { NlpService } from "../Service/Nlp.js"
import { OntologyService } from "../Service/Ontology.js"
import { RdfBuilder } from "../Service/Rdf.js"
import { ShaclService } from "../Service/Shacl.js"
import { StorageServiceLive } from "../Service/Storage.js"
import { makeIngestionActivity, makeResolutionActivity, makeValidationActivity } from "../Workflow/Activities.js"
import { ExtractionWorkflowLive } from "../Workflow/StreamingExtraction.js"
import { makeStreamingExtractionActivity } from "../Workflow/StreamingExtractionActivity.js"
import { makeLanguageModelLayer } from "./ProductionRuntime.js"

// -----------------------------------------------------------------------------
// Activity Name Schema
// -----------------------------------------------------------------------------

const ActivityName = Schema.Literal("extraction", "resolution", "validation", "ingestion")
type ActivityName = typeof ActivityName.Type

// -----------------------------------------------------------------------------
// Activity Dispatcher
// -----------------------------------------------------------------------------

/**
 * Parse activity name from environment
 */
const getActivityName = Config.string("ACTIVITY_NAME").pipe(
  Config.withDefault("extraction")
)

/**
 * Parse activity payload from environment
 */
const getActivityPayload = Config.string("ACTIVITY_PAYLOAD").pipe(
  Config.withDefault("{}")
)

/**
 * Dispatch to correct activity based on ACTIVITY_NAME
 *
 * Schema validation happens at ingress - the decoded payload is passed directly to the activity.
 */
const dispatchActivity = (name: ActivityName, payloadJson: string) =>
  Match.value(name).pipe(
    Match.when("extraction", () =>
      Effect.gen(function*() {
        const payload = yield* Schema.decodeUnknown(ExtractionActivityInput)(JSON.parse(payloadJson))
        // ExtractionActivityInput has: batchId, documentId, sourceUri, ontologyUri, targetNamespace
        // Use unified 6-phase streaming extraction activity
        const activity = makeStreamingExtractionActivity(payload)
        return yield* activity.execute
      })),
    Match.when("resolution", () =>
      Effect.gen(function*() {
        const payload = yield* Schema.decodeUnknown(ResolutionActivityInput)(JSON.parse(payloadJson))
        // ResolutionActivityInput has: batchId, documentGraphUris
        const activity = makeResolutionActivity(payload)
        return yield* activity.execute
      })),
    Match.when("validation", () =>
      Effect.gen(function*() {
        const payload = yield* Schema.decodeUnknown(ValidationActivityInput)(JSON.parse(payloadJson))
        // ValidationActivityInput has: batchId, resolvedGraphUri, shaclUri (optional)
        const activity = makeValidationActivity(payload)
        return yield* activity.execute
      })),
    Match.when("ingestion", () =>
      Effect.gen(function*() {
        const payload = yield* Schema.decodeUnknown(IngestionActivityInput)(JSON.parse(payloadJson))
        // IngestionActivityInput has: batchId, validatedGraphUri, targetNamespace
        const activity = makeIngestionActivity(payload)
        return yield* activity.execute
      })),
    Match.exhaustive
  )

// -----------------------------------------------------------------------------
// Main Entry Point
// -----------------------------------------------------------------------------

const program = Effect.gen(function*() {
  const activityNameRaw = yield* getActivityName
  const payloadJson = yield* getActivityPayload

  yield* Console.log(`ActivityRunner starting`)
  yield* Console.log(`  ACTIVITY_NAME: ${activityNameRaw}`)
  yield* Console.log(`  ACTIVITY_PAYLOAD length: ${payloadJson.length} chars`)

  // Parse and validate activity name
  const activityName = yield* Schema.decodeUnknown(ActivityName)(activityNameRaw).pipe(
    Effect.mapError((_e) =>
      new Error(`Invalid ACTIVITY_NAME: ${activityNameRaw}. Expected: extraction, resolution, validation, or ingestion`)
    )
  )

  // Dispatch to activity
  const result = yield* dispatchActivity(activityName, payloadJson).pipe(
    Effect.tapError((error) => Console.error(`Activity ${activityName} failed: ${error}`))
  )

  yield* Console.log(`Activity ${activityName} completed successfully`)
  yield* Console.log(`Result: ${JSON.stringify(result, null, 2)}`)

  return result
}).pipe(
  Effect.catchAllDefect((defect) =>
    Effect.gen(function*() {
      yield* Console.error(`Activity runner crashed with defect: ${defect}`)
      return yield* Effect.die(defect)
    })
  )
)

// -----------------------------------------------------------------------------
// Layer Composition
// -----------------------------------------------------------------------------

/**
 * Activity runner layer - provides all dependencies for activities
 *
 * Layer composition order matters:
 * 1. BunContext provides FileSystem and Path (platform layer)
 * 2. ConfigServiceDefault provides ConfigService
 * 3. makeLanguageModelLayer provides LanguageModel (requires ConfigService)
 * 4. StageTimeoutServiceLive provides StageTimeoutService
 * 5. EntityExtractor/RelationExtractor require LanguageModel + ConfigService + StageTimeoutService
 * 6. NlpService requires ConfigService
 * 7. OntologyService requires RdfBuilder + NlpService + BunContext
 * 8. StorageServiceLive requires ConfigService + FileSystem/Path
 * 9. RdfBuilder.Default requires ConfigService
 *
 * Type Assertion Rationale:
 * The composed layer provides all services needed by the activities:
 * - StorageService, ConfigService, RdfBuilder, EntityExtractor, RelationExtractor
 * - OntologyService, NlpService, ShaclService, StageTimeoutService, LanguageModel
 * TypeScript's inference has difficulty with deep Effect layer compositions,
 * but the runtime composition is correct. The assertion documents this explicitly.
 */
const ActivityRunnerLive = Layer.mergeAll(
  StorageServiceLive,
  RdfBuilder.Default,
  EntityExtractor.Default,
  RelationExtractor.Default,
  OntologyService.Default,
  NlpService.Default,
  StageTimeoutServiceLive,
  ExtractionWorkflowLive // For unified streaming extraction activity
).pipe(
  Layer.provideMerge(makeLanguageModelLayer),
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(BunContext.layer),
  Layer.provideMerge(ShaclService.Default)
) as Layer.Layer<
  // All provided services (ROut)
  | import("../Service/Storage.js").StorageService
  | import("../Service/Rdf.js").RdfBuilder
  | import("../Service/Extraction.js").EntityExtractor
  | import("../Service/Extraction.js").RelationExtractor
  | import("../Service/Ontology.js").OntologyService
  | import("../Service/Nlp.js").NlpService
  | import("../Service/LlmControl/StageTimeout.js").StageTimeoutService
  | import("@effect/ai").LanguageModel.LanguageModel
  | import("../Service/Config.js").ConfigService
  | import("../Service/Shacl.js").ShaclService
  | import("../Service/ExtractionWorkflow.js").ExtractionWorkflow,
  // Error type (E)
  never,
  // Requirements (RIn) - none, all satisfied
  never
>

// Run the program with all dependencies provided
BunRuntime.runMain(program.pipe(
  Effect.provide(ActivityRunnerLive)
) as Effect.Effect<unknown, unknown, never>)

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------

// (execution starts above)
