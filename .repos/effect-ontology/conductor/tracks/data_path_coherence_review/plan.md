# Plan: End-to-End Data Path Coherence Review

## Phase 1: Discovery & Mapping [checkpoint: pending]
- [x] Task: Identify and document all primary data entry points across all packages (`@core-v2`, `web`, etc.).
- [x] Task: Trace and document the high-level data flow for the "Ingestion" path (Input -> Processing -> Storage).
- [x] Task: Trace and document the high-level data flow for the "Extraction" path (Input Text -> NLP/LLM -> Entities/Relations -> Storage).
- [x] Task: Trace and document the high-level data flow for the "Query/Output" path (Storage -> Query -> Response).

## Phase 2: Domain & Model Alignment [checkpoint: pending]
- [x] Task: Verify that all data structures flowing through the system align with the centralized Domain Models (`packages/@core-v2/src/Domain`).
- [x] Task: Check for redundant or conflicting type definitions across modules (especially between `web` and `@core-v2`).
- [x] Task: Ensure unified error handling and domain error usage across all paths.

## Phase 3: Service Interaction & Dependency Review [checkpoint: pending]
- [x] Task: Review service boundaries and dependencies to ensure clean separation of concerns.
- [x] Task: Verify that `ConfigService` is consistently used for all configuration values.
- [x] Task: Check for hidden dependencies or side effects in pure domain functions.

## Phase 4: Implementation Verification (Deep Dive) [checkpoint: pending]
- [x] Task: Deep dive review of the "Ingestion" path implementation (coherence check).
- [x] Task: Deep dive review of the "Extraction" path implementation (coherence check).
- [x] Task: Deep dive review of the "Query/Output" path implementation (coherence check).

## Phase 5: Remediation [checkpoint: 591ce1e]
- [x] Task: Register missing CLI commands in `packages/@core-v2/src/Cli/index.ts` (`ingestLinkCommand`, `documentsCommand`, `ingestBatchCommand`).
- [x] Task: Add missing Routers to `packages/@core-v2/src/Runtime/HttpServer.ts` (`InferenceRouter`, `LinkIngestionRouter`, `JobPushRouter`).
- [x] Task: Move `KNOWN_VOCABULARIES` from `HttpServer.ts` to `packages/@core-v2/src/Domain/Rdf/Constants.ts` (or similar).
- [x] Task: Refactor `packages/web` to import shared types from `@core-v2` instead of redefining them (e.g., `ClaimWithRank`). (Deferred: Wire type vs Domain type mismatch requires frontend decoding logic change).
- [x] Task: Final End-to-End Verification.
