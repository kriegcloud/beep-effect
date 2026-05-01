# Schema Sync Codec Migration Inventory

Generated during the Phase 1 inventory pass for replacing sync schema codecs with Effect, Result, or Option variants.

## Raw Inventory

- Raw exact hit list: `scratchpad/schema-codec-migration/sync-codec.raw.txt`
- Raw rows captured: 839
- Exact `S.*Sync` / `Schema.*Sync` / `SchemaParser.*Sync` rows in the raw inventory: 769

## Classification

- `fix-now`: active runtime code where sync codec failure can escape an Effect or typed error boundary.
- `agent-guidance`: examples, standards, skills, or policy code that teaches agents to introduce sync codecs.
- `record-only`: scratchpad, historical initiatives, generated docs, broad compatibility APIs, or test/JSDoc surfaces not rewritten in the first runtime pass.

## Phase 2 Work Slices

- Tooling: `tooling/docgen`, `tooling/configs`, `tooling/cli`, and `tooling/repo-utils`.
- Common runtime packages: `packages/common/semantic-web`, `packages/common/schema/src/csv/parse`, `packages/common/nlp/src/Tools`, and `packages/drivers/ffmpeg`.
- Shared packages: `packages/shared/domain` and `packages/shared/ui`.
- Agent guidance: `.claude`, `.codex`, `.agents`, and `standards/effect-first-development.md`.

## Error Mapping Rule

When migrating to `S.decodeUnknownEffect`, `S.decodeEffect`, `S.encodeUnknownEffect`, or `S.encodeEffect`, do not leave a raw schema error at a domain, service, command, or public helper boundary unless that API intentionally exposes schema validation failures. Map schema failures into the local typed error and preserve the original schema error as `cause` or existing structured detail.

## Current Hotspots

- Highest-volume test/JSDoc clusters: `packages/common/schema/test/HttpHeaders.test.ts`, `tooling/repo-utils/test/TSMorph.model.test.ts`, `packages/common/schema/test/Graph.test.ts`, `packages/common/schema/test/ProvO.test.ts`, `packages/common/semantic-web/test/JsonLd.test.ts`.
- Highest-risk runtime clusters: `tooling/repo-utils/src/TSMorph`, `packages/common/semantic-web/src/adapters`, `tooling/cli/src/commands`, `tooling/docgen/src`, and shared entity constructors.
- Guidance risks: `.claude/skills/domain-modeling/SKILL.md`, `.claude/patterns/code-smells/avoid-direct-json.md`, and dual-arity policy fixtures that still bless schema sync factories.
