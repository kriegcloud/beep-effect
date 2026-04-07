# P7 — Reuse Tool Implementation And Tooling-Stack Pilot

## Objective

Implement the `beep reuse` tool defined in P6, prove it against the tooling pilot scope, and leave future autonomous execution as a follow-on instead of silently widening this phase.

## Files And Surfaces Changed

### Reuse models and services

- `tooling/repo-utils/src/Reuse/Reuse.model.ts`
- `tooling/repo-utils/src/Reuse/Reuse.service.ts`
- `tooling/repo-utils/src/Reuse/index.ts`
- `tooling/repo-utils/src/index.ts`

### CLI command surface

- `tooling/cli/src/commands/Reuse/index.ts`
- `tooling/cli/src/commands/Reuse/internal/CodexRunner.ts`
- `tooling/cli/src/commands/Root.ts`
- `tooling/cli/src/index.ts`
- `tooling/cli/src/commands/TrustGraph/internal/TrustGraphRuntime.ts`

### Tests and package metadata

- `tooling/repo-utils/test/Reuse.service.test.ts`
- `tooling/cli/test/reuse-command.test.ts`
- `tooling/cli/package.json`
- root `package.json`
- `bun.lock`

## What Landed

### Structured reuse models

The repo now has schema-first models for:

- catalog entries
- scout and specialist work units
- reuse candidates
- inventories
- packets
- find results

### Shared reuse services

The repo now has live services for:

- building the shared catalog
- building scout and specialist partitions
- discovering high-confidence candidates
- materializing inventories and packets

The implementation memoizes the expensive scope, file, catalog, and pattern-scan work so repeated calls stay within the test budget and do not keep re-walking the same repo slices.

### CLI commands

The CLI now exposes:

- `beep reuse partitions`
- `beep reuse find`
- `beep reuse inventory`
- `beep reuse packet`
- `beep reuse codex-smoke`

The JSON mode now encodes through the schemas before printing, so the command contract stays stable and does not leak raw internal `Option` shapes.

### Codex smoke seam

The first Codex SDK integration is intentionally narrow. It validates:

- `@openai/codex-sdk` import
- client construction
- thread startup contract

It does not run a reuse loop and it does not mutate repo code.

## Tooling Pilot Result

The most useful pilot scope ended up being `tooling/cli`.

- `tooling/repo-utils` alone produced partitions but no candidate inventory.
- `tooling/cli` alone produced real candidates and specialist hotspots.
- the broader tooling pair remains useful for service tests, but the CLI integration tests are cheaper and still meaningful on `tooling/cli`.

Observed pilot outputs included:

- one scout unit for `tooling/cli`
- specialist units for JSON codec and JSON rendering hotspots
- three high-confidence reuse candidates in `tooling/cli`

## Commands Run

### Context and inspection

- `bun run codex:hook:session-start`

Result:

- failed because TrustGraph MCP initialization returned a non-2xx response in this session
- treated as a skipped repo-context lookup rather than a blocker

### Targeted implementation verification

- `bunx turbo run check --filter=@beep/repo-utils --filter=@beep/repo-cli`
- `bunx --bun vitest run tooling/repo-utils/test/Reuse.service.test.ts`
- `bunx --bun vitest run tooling/cli/test/reuse-command.test.ts`
- `bun run beep reuse partitions --scope tooling/cli --json`
- `bun run beep reuse inventory --scope tooling/cli --json`

Result:

- all of the above passed on the current tree

## Key Decisions During Implementation

- keep the catalog expansion modest by adding `packages/common` alongside any explicitly requested scope rather than scanning the whole repo by default for local `find` requests
- keep the service memoization inside a shared reuse-analysis context so repeated inventory and packet work stays fast without using broad type assertions
- keep the real Codex smoke path, because the SDK thread constructor itself does not own a spawned child-process lifecycle; the heavier child-process cleanup path only exists when `thread.run()` executes
- keep the CLI integration tests on a smaller `tooling/cli` scope because it still exercises real candidates while reducing unnecessary scan time

## Residual Risks

- the CLI integration file is still expensive because it intentionally runs real repo analysis and a real Codex smoke path
- `generatedAt` remains real-time metadata, so downstream consumers should treat candidate ordering and packet content as the deterministic parts of the contract
- embeddings and RAG are still deferred behind the current service seam
- autonomous reuse execution loops, automated edits, and approval policy are still intentionally out of scope

## Outcome

P7 is complete. The repo now has a reusable, typed `beep reuse` tool with a proven tooling-stack pilot, and the spec is ready to describe P6/P7 as completed extension phases rather than future ideas.
