# P2: Docgen Verification And Cleanup

## Status

**COMPLETED**

P2 exit-gate work is complete: current docgen ownership is proven from repo reality, the one live package that was still participating implicitly now has an explicit `docgen.json`, stale README guidance was removed, and no stale generated docs from the removed workspaces remain.

## Objective

Prove what currently drives docgen in the repo and remove only genuine stale docgen assumptions or artifacts.

## Ownership Decision

The current docgen owner is the repo-local `@beep/docgen` workspace at `tooling/docgen`, orchestrated by the root `bun run docgen` script and the repo CLI helpers in `tooling/cli`.

## Ownership Evidence

| Surface | Evidence | Decision | Notes |
|---|---|---|---|
| Root `package.json` and `turbo.json` | Root `docgen` runs `bunx turbo run docgen --filter=!scratchpad && bun run beep docs aggregate --clean`, and Turbo still declares a repo-wide `docgen` task | Root ownership is active and current | This is the entrypoint that fans out docgen across the workspace graph |
| `tooling/docgen` | `tooling/docgen/package.json` still owns `@beep/docgen`, exports the local CLI, and `tooling/docgen/src/bin.ts` still runs the repo-local command | Repo-local package ownership is current | This is not an external or removed dependency |
| `tooling/cli` | `tooling/cli/src/commands/Docgen/index.ts` and `tooling/cli/src/commands/DocsAggregate.ts` still own status, init, analyze, generate, and aggregate flows | Repo CLI remains the human-first control surface | `beep docgen` and `beep docs aggregate` intentionally share the same operations layer |
| Active dependency search | `rg -n '@effect/docgen' . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'` returned no active refs | `@effect/docgen` is absent from active repo wiring | The remaining `effect-ts/docgen` strings in `tooling/docgen/test/*.test.ts` are fixture URLs, not active dependency wiring |

## Cleanup Decisions

| Surface | Finding | Action | Notes |
|---|---|---|---|
| `packages/editor/runtime` | The package already had a `docgen` script and live generated docs, but no `docgen.json`, so `beep docgen status` reported it as `not-configured` even though root docgen still aggregated it | Added `packages/editor/runtime/docgen.json` | This formalizes an already-active docgen participant instead of deleting live docs as stale |
| `tooling/docgen/README.md` | The README still described `@beep/docgen` like an installable external package even though the workspace is private and owned in-repo | Rewrote the README to describe repo-local entrypoints and local development usage | Removes the stale “install from registry” assumption without widening scope into publish semantics |
| Removed-workspace generated docs | The root `docs/` tree no longer contains `docs/clawhole`, `docs/web`, or `docs/crypto-taxes` after P1 regeneration | Explicitly ruled out; no cleanup needed | `docs/common/observability/web/**` remains valid and unrelated to the removed `apps/web` workspace |
| `tooling/docgen/test/Parser.test.ts` and `tooling/docgen/test/Checker.test.ts` | The files still mention `https://github.com/effect-ts/docgen`, but only inside parser or printer fixture config | Preserved | These are test fixtures and do not represent active repo ownership or dependency drift |

## Status Evidence

- Pre-cleanup `bun run beep docgen status --verbose` reported `configured and generated: 37`, `not-configured: 3`, with `@beep/editor-runtime` listed as `not-configured`.
- Post-cleanup `bun run beep docgen status --verbose` reported `configured and generated: 38`, `not-configured: 2`, and `@beep/editor-runtime` moved to `configured-and-generated`.
- The remaining `not-configured` packages are `@beep/desktop` and `scratchpad`, both unchanged by P2.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `bun run trustgraph:context -- --prompt "P2 repo cleanup phase: identify current docgen ownership, active docgen wiring, and any known stale docgen references or generated-doc obligations after workspace removals."` | Limited signal | Returned generic guidance, so P2 relied on direct repo inspection for concrete ownership evidence |
| `git status --short`; targeted `sed`; targeted `rg`; targeted `find docs ...` | Success | Mapped the current docgen chain, current `docgen.json` coverage, and root-doc outputs |
| `bun run beep docgen status --verbose` | Success | Proved the initial state, including `@beep/editor-runtime` as the only generated package missing `docgen.json` |
| `bun run beep docgen init -p packages/editor/runtime --dry-run` | Success | Produced the canonical config content used to formalize `packages/editor/runtime` docgen participation |
| `bun run docgen` | Success | Re-ran package-local docgen and root docs aggregation after the config and README cleanup |
| `bun run beep docgen status --verbose` | Success | Confirmed `@beep/editor-runtime` now reports as `configured-and-generated` |
| `bun run lint` | Success | Passed after formatting the new `docgen.json` to repo standards |
| `bun run check` | Failure, out of P2 scope | Reproduced the existing `apps/editor-app` missing `@pigment-css/vite-plugin` dependency declaration |
| `bun run test` | Success | Passed completely after the P2 cleanup |

## Phase Commit

| Commit | Scope | Notes |
|---|---|---|
| `chore(docgen): formalize repo-local ownership` | P2 docgen verification and stale-guidance cleanup | Created at P2 closeout in this session; resolve the exact hash from Git history after the phase commit lands |

## Deferred Findings For Later Phases

| Finding | Carry To | Notes |
|---|---|---|
| `apps/editor-app` `check` is still blocked by the missing `@pigment-css/vite-plugin` dependency declaration | P5 | Reproduced during P2 verification; not introduced by docgen cleanup |

## Residual Risks

- `tooling/docgen` remains private while still carrying `publishConfig`; P2 treated that as future packaging intent rather than current stale ownership because repo-local usage is the current truth and no publish pipeline is active in this phase.
- `apps/editor-app` still needs `@pigment-css/vite-plugin` declared before repo-wide `check` can pass from a clean install.

## Handoff Notes For P3

- Start P3 from the now-stable docgen baseline: repo-local ownership is proven, `@beep/editor-runtime` is explicitly configured, and the root docs tree is already clean of the removed P1 workspaces.
- Keep the existing `apps/editor-app` `check` blocker logged as a P5 verification issue unless a P3-owned dependency cleanup directly touches that package.
- Continue treating test-fixture references to `effect-ts/docgen` as preserved evidence unless a future docgen-focused phase intentionally rewrites the fixture corpus.

## Exit Gate

P2 is complete because docgen ownership is proven from repo reality and stale docgen assumptions were either removed or explicitly ruled out with evidence.
