# V2T - P1 Design Research

## Status

BOOTSTRAP BASELINE

## Goal

Translate the research baseline into a decision-complete V2T system contract that another agent can plan and implement without reopening the core product shape.

## Canonical User Flow

1. The user creates or opens a V2T project.
2. The user records audio or imports an existing recording.
3. The app persists a session record and produces a transcript artifact with speaker and timing metadata when available.
4. The user reviews a session brief that combines transcript, notes, and memory or research context.
5. The user configures a composition profile:
   style, output target, raw-audio-only versus enhanced-dialogue mode, and clip strategy.
6. The app creates a composition run packet and routes it through local orchestration and provider adapters.
7. The app stores run results and export artifacts for later review, retry, or publishing.

## Domain Model

The canonical domain objects are:

- `V2tProject`: named container for recordings, notes, runs, and export history
- `ConversationSession`: one captured or imported conversation with user notes and timestamps
- `RecordingAsset`: audio file metadata, local path, duration, and capture source
- `TranscriptArtifact`: transcript body, chunk or speaker metadata, transcript provenance, and generation status
- `SessionBrief`: enriched review document combining transcript, extracted topics, entities, and linked context
- `MemoryContextPacket`: references returned from Graphiti or other retrieval providers
- `CompositionProfile`: user-selected style, duration target, dialogue mode, and export intent
- `CompositionRun`: one generation request with status, provider inputs, outputs, and retry state
- `ExportArtifact`: concrete long-form or clip deliverable metadata with local path and format

## System Boundaries

### App Surface

`apps/V2T` owns the user workflow, page routing, local app state, and composition controls.

### Sidecar Surface

The sidecar owns filesystem access, SQLite persistence, provider adapters, orchestration jobs, and long-running generation or export work.

### Shared Package Reuse

- reuse the shared speech input component for recording and transcript-preview interactions
- reuse repo identity and schema packages for domain ids and typed contracts
- reuse root Graphiti infrastructure instead of inventing separate memory plumbing

## Storage Posture

- audio and generated media live on local disk
- durable session, run, and artifact metadata live in SQLite
- transcript and session brief artifacts are stored as filesystem documents with corresponding SQLite records
- memory retrieval references are cached as packet snapshots attached to sessions or composition runs

## Provider Adapter Contract

All external integrations must be expressed as adapters behind local service contracts:

- `TranscriptProvider`
- `SessionEnrichmentProvider`
- `MemoryProvider`
- `AudioEmbeddingProvider`
- `CompositionProvider`
- `ExportProvider`

React components and route modules are not allowed to call external providers directly.

## First Execution Slice

The first committed execution slice should deliver:

- project shell and session list in `apps/V2T`
- record or import flow using repo-native UI
- transcript artifact persistence and review surface
- memory context packet retrieval through a Graphiti-backed adapter seam
- composition profile editor and composition packet generation
- export artifact records and stub-or-real queue orchestration

The first slice does not need to prove fully autonomous final video quality. It must prove the local-first workflow and the orchestration contracts.

## Deferred By Default

- automated social distribution
- sophisticated scene editing timelines
- mandatory local Qwen embedding generation on day one
- claiming Grok or any other generator as irreversible product lock-in

## Design Exit Gate

P1 is complete when the workflow, domain objects, storage posture, adapter seams, and first execution slice are explicit enough that P2 can produce a file-level plan without product-side guesswork.
