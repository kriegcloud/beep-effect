# P0 Revalidation

Date: 2026-06-15

## Prerequisite

- `goals/desktop-chat-surface` is closed as `completed-retained`.
- The current `main` checkout still matches the POC parity audit's P1 gaps:
  sidecar DevTools, app `RegistryProvider`, error toasts, turn lifecycle
  metrics, title derivation, and Grafana dashboard provisioning are absent.

## Gate 1: Repair Call Shape

`@effect/ai-anthropic` `beta.83` still has the non-streaming tool-use decode
landmine: the `generateText` path maps missing `caller.tool_id` to
`toolId: undefined`, while the streaming path maps it to `null`. P2 should use
the POC's `streamText` consume-whole repair call shape unless the dependency is
upgraded and reverified.

## Gate 2: Title Path

Use a new `ThreadStore.setTitleIfEmpty` compare-and-set mutation keyed by the
existing `"New thread"` title sentinel. This keeps `Thread.title` as the
required `S.NonEmptyString` it is today and avoids the stop-listed nullable-title
schema and migration path.

## First Implementation Slice

P1 starts with the low-risk observability and UX affordances:

- sidecar Effect DevTools through `@beep/observability/server`
  `layerFilteredDevTools`;
- app-local Atom registry provider;
- UI-layer error toasts driven by agents-client atom state;
- turn lifecycle metrics;
- title derivation through the chosen `ThreadStore.setTitleIfEmpty` path;
- Grafana dashboard and provisioning for the chat metrics.
