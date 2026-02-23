import * as Layer from "effect/Layer";
import { CentralRateLimiterServiceLive, StageTimeoutServiceLive, TokenBudgetServiceLive } from "../LlmControl";
import { ExternalEntityCatalogNoneLive } from "../Service/ExternalEntityCatalog";
import { ReconciliationServiceLive } from "../Service/ReconciliationService";
import { StorageMemoryLive } from "../Service/Storage";
import { LlmLive } from "./LlmLayers";
import { WorkflowRuntimeLive } from "./WorkflowRuntime";

/**
 * LLM provider only (no control-plane services).
 * Compose with `LlmControlBundleLive` when needed.
 */
export const LlmProviderBundleLive = Layer.mergeAll(LlmLive);

/**
 * LLM control-plane services for budgeting, rate limits, and stage timeouts.
 * Kept separate from provider layer for test/runtime composition.
 */
export const LlmControlBundleLive = Layer.mergeAll(
  TokenBudgetServiceLive,
  CentralRateLimiterServiceLive,
  StageTimeoutServiceLive
);

/**
 * Default runtime bundle for LLM-powered extraction/grounded generation paths.
 */
export const LlmRuntimeBundleLive = Layer.mergeAll(LlmProviderBundleLive, LlmControlBundleLive);

/**
 * Workflow runtime bundle for mode-gated execution.
 */
export const WorkflowRuntimeBundleLive = Layer.mergeAll(WorkflowRuntimeLive);

/**
 * Reconciliation capability bundle with safe defaults.
 *
 * Notes:
 * - Uses `ExternalEntityCatalogNoneLive` by default (no network dependency).
 * - Uses in-memory storage by default.
 * - Production wiring can replace either dependency via `Layer.provideMerge(...)`.
 */
export const ReconciliationBundleLive = Layer.mergeAll(ReconciliationServiceLive).pipe(
  Layer.provideMerge(ExternalEntityCatalogNoneLive),
  Layer.provideMerge(StorageMemoryLive)
);
