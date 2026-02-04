/**
 * Service: Extraction Workflow Interface
 *
 * Defines the contract for the high-level extraction workflow.
 * Allows services to depend on the interface without depending on calculations/implementations.
 *
 * @since 2.0.0
 * @module Service/ExtractionWorkflow
 */

import type { Effect } from "effect"
import { Context } from "effect"
import type { KnowledgeGraph } from "../Domain/Model/Entity.js"
import type { RunConfig } from "../Domain/Model/ExtractionRun.js"

// Define the interface
export interface ExtractionWorkflow {
  readonly extract: (
    text: string,
    config: RunConfig
  ) => Effect.Effect<KnowledgeGraph, unknown, never> // Error type is unknown for now, usually causes are logged
}

// Define the Tag
export const ExtractionWorkflow = Context.GenericTag<ExtractionWorkflow>("@core-v2/Service/ExtractionWorkflow")
