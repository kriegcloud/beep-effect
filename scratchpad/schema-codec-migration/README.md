# Schema Sync Codec Migration Inventory

Generated during the Phase 1 inventory pass for replacing sync schema codecs with Effect, Result, or Option variants.

## Raw Inventory

- Raw exact hit list: `scratchpad/schema-codec-migration/sync-codec.raw.txt`
- Raw rows captured after the foundation-topology implementation pass: 567
- Active source rows after excluding comments, tests, docs, dtslint, generated docs, and guidance text: 0

## Classification

- `fix-now`: active runtime code where sync codec failure can escape an Effect or typed error boundary.
- `agent-guidance`: examples, standards, skills, or policy code that teaches agents to introduce sync codecs.
- `record-only`: scratchpad, historical initiatives, generated docs, broad compatibility APIs, or test/JSDoc surfaces not rewritten in the first runtime pass.

## Phase 2 Work Slices

- Tooling: `tooling/docgen`, `tooling/configs`, `tooling/cli`, and `tooling/repo-utils`.
- Foundation modeling: `packages/foundation/modeling/schema`, `packages/foundation/modeling/identity`, and `packages/foundation/modeling/utils`.
- Foundation capability/UI: `packages/foundation/capability/*` and `packages/foundation/ui-system/ui`.
- Shared packages: `packages/shared/domain` and `packages/shared/ui`.
- Agent guidance: `.claude`, `.codex`, `.agents`, and `standards/effect-first-development.md`.

## Error Mapping Rule

When migrating to `S.decodeUnknownEffect`, `S.decodeEffect`, `S.encodeUnknownEffect`, or `S.encodeEffect`, do not leave a raw schema error at a domain, service, command, or public helper boundary unless that API intentionally exposes schema validation failures. Map schema failures into the local typed error and preserve the original schema error as `cause` or existing structured detail.

## Current Hotspots

- Highest-volume test/JSDoc clusters: `packages/foundation/modeling/schema/test/HttpHeaders.test.ts`, `tooling/repo-utils/test/TSMorph.model.test.ts`, `packages/foundation/modeling/schema/test/Graph.test.ts`, `packages/foundation/modeling/schema/test/Color.test.ts`, and `packages/foundation/modeling/schema/test/FilePath.test.ts`.
- Highest-risk runtime clusters already migrated: `tooling/repo-utils/src/TSMorph`, `packages/foundation/capability/semantic-web/src/adapters`, `tooling/cli/src/commands`, `tooling/docgen/src`, and shared entity constructors.
- Guidance pass: repo-local Effect/schema skills now steer agents toward Effect codecs, explicit `Effect.mapError(...)` at boundaries, and `Result.getOrThrowWith(...)` only when preserving a legacy throwing sync wrapper.
- Tooling guidance cleanup: the dual-arity law now recognizes Effect/Result/Option codec factories instead of sync codec factories, and the JSDoc tag-value docs advertise `S.decodeUnknownResult(...)` instead of `S.decodeSync(...)`.
