# V2T - P0 Research

## Status

BOOTSTRAP BASELINE

## Objective

Ground the V2T PRD against current repo reality and classify which product claims are already supported by existing surfaces, which require new implementation, and which must remain explicit provider seams.

## Source Inputs

- `outputs/v2t_app_notes.html`
- `outputs/V2_animination_V2T.md`
- `apps/V2T`
- `packages/VT2`
- `apps/V2T/scripts/build-sidecar.ts`
- `packages/common/ui/src/components/speech-input.tsx`
- root `package.json`
- Graphiti operational scripts and commands

## PRD Synthesis

The preserved PRD describes V2T as a local-first conversation-to-content workflow:

1. record a conversation
2. transcribe and enrich it
3. review a structured document
4. configure animation style and dialogue mode
5. generate long-form or short-form outputs

The product promise is not just transcription. It is transcript plus context, memory, composition control, and export-ready media packaging.

## Repo-Grounded Findings

### Existing Surfaces

- `apps/V2T` already exists as a dedicated workspace with Vite, Vitest, and Tauri wiring.
- The current route tree renders a placeholder `TwoTvPage`, so the app shell exists but the product workflow does not.
- `apps/V2T/vite.config.ts` already proxies `/api` to `https://v2t-sidecar.localhost:1355`, which is the natural sidecar seam for local-first services.
- `packages/VT2` already exists as a SQLite-backed Effect sidecar package with a typed control-plane protocol in `packages/VT2/src/protocol.ts` and runtime wiring in `packages/VT2/src/Server/index.ts`.
- `apps/V2T/scripts/build-sidecar.ts` and `apps/V2T/scripts/dev-with-portless.ts` already compile and run the `packages/VT2` sidecar for the app shell.
- `packages/common/ui/src/components/speech-input.tsx` already provides a reusable recording and transcript-preview UI primitive backed by the repo's speech hooks.
- Root Graphiti commands and recovery/proxy scripts already exist, so memory infrastructure is a repo-native capability rather than an external afterthought.

### Gaps

- There is no canonical V2T domain model yet.
- The current `@beep/VT2` sidecar only exposes a simple document-oriented control plane, not V2T-native projects, sessions, transcripts, composition runs, or export artifacts.
- There is no implemented local persistence flow for V2T sessions, transcripts, composition runs, or export artifacts beyond the existing sidecar bootstrap and document storage seam.
- The current app does not expose the record -> review -> configure -> generate workflow from the PRD.
- Provider contracts for transcript enrichment, audio embedding, video generation, and export orchestration are not formalized.

## Research Conclusions

### Product Posture

- V2T should be treated as a local-first workspace first and an automated media-production pipeline second.
- The canonical spec should preserve the PRD ambition while sequencing delivery through explicit provider seams and local artifacts.
- The first implementation slice should stop at composition packets and tracked export artifacts unless a later phase proves end-to-end generator reliability.
- The first implementation slice should extend or explicitly supersede the current `@beep/VT2` control plane instead of inventing a second app-local server path.

### Provider Classification

- realtime or hosted transcription is a provider seam, not a UI concern
- memory retrieval is a provider seam with Graphiti as the initial repo-native default
- audio embeddings are a provider seam and should remain optional in the first slice
- video generation is a provider seam and should not be hard-coded into the app shell
- export formatting is a local orchestration seam even if later delegated to external providers

### Repo Constraints

- use the existing `apps/V2T` workspace instead of inventing a new app package
- use the existing `packages/VT2` sidecar package and scripts as the starting control-plane seam unless a later phase documents a migration
- keep the spec compatible with effect-first and schema-first repo rules
- prefer shared UI and runtime primitives before introducing V2T-specific duplicates
- treat the current naming drift between `apps/V2T` and `packages/VT2` as a documented repo fact rather than a bootstrap-time rename project

## Research Deliverables For This Package

P0 is complete when all of these are explicit:

- the product workflow is grounded in repo seams rather than PRD-only language
- the initial execution slice is named and scoped
- provider seams are classified as local, optional, or deferred
- preserved source artifacts remain linked and unmodified

## Open Research Questions To Close During Active P0 Work

- Should the first slice extend the existing `Vt2Document` control plane into V2T-native project/session endpoints or introduce parallel endpoints with an explicit migration path?
- Which existing speech hook/provider behavior is sufficient for V2T transcript capture versus where a dedicated adapter is required?
- Should transcript enrichment and research run entirely in the sidecar or as queued jobs surfaced through the sidecar?
- What exact artifact set is required before a composition run can be considered export-ready?
