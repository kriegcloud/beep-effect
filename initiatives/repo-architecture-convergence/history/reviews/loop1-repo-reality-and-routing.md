# Loop 1 Repo Reality And Routing Review

## Repo Reality Snapshot

- The initiative correctly identifies the main legacy roots: `packages/common/*`, top-level `tooling/*`, `packages/runtime/*`, `packages/shared/providers/*`, `.agents`, `.claude`, and `.codex`.
- The live root workspace graph still hard-codes those roots in `package.json`, `tsconfig.json`, `syncpack.config.ts`, `tsconfig.packages.json`, `tsconfig.quality.packages.json`, `turbo.json`, and `scratchpad/tsconfig.json`.
- The repo has two active app workspaces that are path-coupled to slice entrypoints:
  - `apps/desktop` hard-codes `packages/runtime/server/src/main.ts` in Tauri, build, dev, and docs surfaces.
  - `apps/editor-app` hard-codes `packages/editor/runtime/src/main.ts` and `packages/common/ui` paths in app config and shadcn config.
- `packages/runtime/protocol` is not purely a repo-memory concern in practice. It mixes:
  - repo-memory run contracts and RPC groups
  - generic sidecar bootstrap and control-plane payloads reused by `packages/editor/protocol` and `apps/desktop`
- `.claude` and `.codex` are not just declarative agent roots. They are actual workspace packages with executable TypeScript, tests, scripts, and runtime hooks.
- `packages/shared/server` and `packages/shared/tables` are already strongly Drizzle-coupled technical packages, not abstract shared-kernel candidates.
- `packages/shared/client` and `packages/shared/ui` are currently placeholder workspaces with almost no real surface area, but they still consume workspace, path-alias, lockfile, identity-registry, and test budget.

## Findings

### Critical

#### 1. `runtime/protocol` is not safely routable as a fully repo-memory-owned package

- Category: `misalignment`
- Evidence:
  - `packages/runtime/protocol/src/index.ts` exports both repo-memory run contracts and generic sidecar control-plane contracts such as `SidecarBootstrap` and `SidecarHealthStatus`.
  - `packages/editor/protocol/src/index.ts` imports and re-exports `@beep/runtime-protocol`.
  - `apps/desktop/package.json` depends on `@beep/runtime-protocol`, and desktop code imports `SidecarBootstrap`.
  - The initiative currently routes all of `packages/runtime/protocol` into `repo-memory/use-cases/public` and `repo-memory/use-cases/server`.
- Why it matters:
  - This package is not just a bad name for repo-memory contracts. It is a mixed package. If P3 collapses it wholesale into repo-memory, editor and desktop either break or inherit repo-memory-specific topology for generic sidecar control-plane contracts.
  - That prevents clean 100 percent convergence because a real cross-slice contract boundary still remains unresolved.
- Concrete remediation:
  - Split `packages/runtime/protocol` into:
    - a high-bar shared control-plane contract package, most likely `packages/shared/use-cases` with `/public` for generic sidecar bootstrap and control-plane payloads
    - `repo-memory/use-cases/public` and `repo-memory/use-cases/server` for repo-memory-specific run contracts, commands, queries, and RPC groups
  - Update P3 and P4 so editor consumes the shared control-plane contract rather than re-exporting repo-memory-owned protocol.

#### 2. The phase order is too late for repo wiring that current slice moves depend on

- Category: `better phase`
- Evidence:
  - The plan says topology and metadata groundwork comes first, but actual operational rewrites that current moves depend on are deferred to P5.
  - Root and repo wiring already hard-code legacy roots in `package.json`, `tsconfig.json`, `syncpack.config.ts`, `turbo.json`, `tsconfig.packages.json`, `tsconfig.quality.packages.json`, and `scratchpad/tsconfig.json`.
  - `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/scripts/build-sidecar.ts`, and `apps/desktop/scripts/dev-with-portless.ts` hard-code `packages/runtime/server/src/main.ts`.
  - `apps/editor-app/src-tauri/src/lib.rs`, `apps/editor-app/scripts/build-sidecar.ts`, and `apps/editor-app/scripts/dev-with-portless.ts` hard-code `packages/editor/runtime/src/main.ts`.
- Why it matters:
  - P3 and P4 cannot be implemented safely if the repo still treats old filesystem locations as canonical launch surfaces.
  - This is a sequencing problem, not just an implementation detail.
- Concrete remediation:
  - Split the current P5 into two tracks:
    - an earlier `Repo Wiring Preparation` phase before P3 that exhaustively rewrites and inventories root workspaces, aliases, filters, script entrypoints, and hard-coded package paths
    - a later operational package relocation phase for moving tooling and infra packages themselves
  - Make the early wiring phase an explicit gate for P3 and P4.

### High

#### 3. `shared/server` and `shared/tables` are already concrete Drizzle-coupled packages, but the route table still treats them as open-ended guesses

- Category: `issue`
- Evidence:
  - `packages/shared/server/package.json` and `packages/shared/tables/package.json` depend on `drizzle-orm`.
  - `packages/shared/server/src/factories/effect-drizzle.ts` exports an Effect Drizzle integration surface.
  - `packages/shared/server` currently exports technical factories, and `packages/shared/tables` exports generic table builders.
  - The initiative currently says they should split into `drivers/*` and/or `foundation/*` based on later inspection.
- Why it matters:
  - The architecture forbids `shared/*` from owning technical wrappers and driver concerns.
  - For a convergence initiative, this routing is already specific enough to close now. Leaving it fuzzy raises the risk that later phases have to invent the route under pressure.
- Concrete remediation:
  - Explicitly route Drizzle-coupled surfaces to a real driver package, most likely `packages/drivers/drizzle`.
  - Route any driver-neutral table modeling helpers to `packages/foundation/modeling/*` only if they truly remain engine-neutral after extraction.
  - Update P0 and P2 to close these routes as committed targets, not provisional guesses.

#### 4. The agent cutover underestimates how much executable workspace logic lives in `.claude` and `.codex`

- Category: `inconsistency`
- Evidence:
  - `.claude/package.json` and `.codex/package.json` define full workspace packages.
  - `.claude/internal/runtime.ts`, `.claude/scripts/*`, `.claude/test/*`, and `.claude/hooks/*` contain executable/runtime code.
  - `.codex/Domain/Hooks/*` and `.codex/test/*` contain executable/runtime code.
  - Root scripts call `.claude/hooks/*` directly from `package.json`.
- Why it matters:
  - The current initiative talks about declarative runtime config and executable hooks in broad terms, but repo reality is not one root equals one target.
  - Without a subtree-level split matrix, the migration will either strand executable code inside runtime-adapter packages or break root scripts and workspace wiring.
- Concrete remediation:
  - Add a route matrix for `.claude` and `.codex` by subtree:
    - declarative config/templates -> `agents/runtime-adapter/*`
    - portable skill/policy content -> `agents/skill-pack/*` and `agents/policy-pack/*`
    - hooks, scripts, runtime helpers, tests, and packaging logic -> `packages/tooling/tool/*`
  - Move this matrix into the durable design docs and make it a P1 prerequisite for P6.

#### 5. The initiative does not yet treat legacy path-coupling as a first-class burn-down artifact

- Category: `better process`
- Evidence:
  - The repo contains very large path-coupling volume to legacy locations, including roughly:
    - `packages/common/` in 759 files
    - `tooling/cli` in 179 files
    - `tooling/repo-utils` in 155 files
    - `tooling/docgen` in 135 files
    - `.claude` in 62 files
    - `packages/runtime/` in 40 files
  - These references span root configs, app configs, docgen files, tooling tests, quality configs, and scratchpad configs.
- Why it matters:
  - A convergence packet can claim the right routing and still fail in implementation if the repo has no explicit burn-down of every path-coupled surface.
  - Missing this inventory guarantees tail risk and drift reintroduction.
- Concrete remediation:
  - Add a P0 output or companion artifact named something like `legacy-path-coupling-inventory.md`.
  - For each file family, record:
    - legacy root referenced
    - owner phase
    - required rewrite type
    - whether temporary compatibility is allowed

### Medium

#### 6. `shared/client` and `shared/ui` should default to deletion, not indefinite audit limbo

- Category: `improvement`
- Evidence:
  - `packages/shared/client/src/index.ts` and `packages/shared/ui/src/index.ts` export only `VERSION`.
  - Their references are mostly self-docgen, tests, identity registry entries, lockfile entries, and root path aliases.
  - They do not currently carry meaningful shared-kernel behavior.
- Why it matters:
  - These packages look like architecture exceptions even though they are basically placeholders.
  - Keeping them open-ended makes the shared-kernel audit noisier than it needs to be.
- Concrete remediation:
  - Mark both packages as default-delete candidates in P0 and P2.
  - Require explicit evidence before preserving either package as a legitimate high-bar shared exception.

#### 7. Identity registry migration is a missing explicit workstream

- Category: `issue`
- Evidence:
  - `packages/common/identity/src/packages.ts` includes package composers for `runtime-protocol`, `runtime-server`, `repo-memory-*`, `shared-*`, `editor-lexical`, `claude`, `codex`, `repo-cli`, `repo-utils`, `test-utils`, and `firecrawl`.
  - `tooling/cli/src/commands/CreatePackage/Handler.ts` is coupled to the identity package registry file path.
- Why it matters:
  - Package moves are not just workspace and import rewrites. This repo also centralizes package identity wiring.
  - If the initiative does not name this work explicitly, the migration will leave broken package identity composers, stale examples, and stale scaffolding behavior.
- Concrete remediation:
  - Add explicit identity-registry migration tasks to P1, P3, P4, and P5.
  - Treat package composer updates as a required step for every canonical move, not as incidental cleanup.

### Low

#### 8. `editor-lexical -> editor/ui` is directionally right, but the packet should say the destination package must be created explicitly

- Category: `improvement`
- Evidence:
  - `apps/editor-app/package.json` depends directly on `@beep/editor-lexical`.
  - `packages/editor/lexical/src/EditorSurface.tsx` is clearly product-specific UI code rather than generic shared UI.
  - The current slice topology does not yet include `packages/editor/ui`.
- Why it matters:
  - The route itself looks right, but the artifact reads like a default judgment rather than a committed package-creation step.
  - That creates avoidable ambiguity for implementers.
- Concrete remediation:
  - Update P4 and the editor migration design doc so `packages/editor/ui` is an explicit package creation task with import rewrites from `@beep/editor-lexical` to the new canonical public name.

## Better Routing

- Split `packages/runtime/protocol` by concern instead of moving it wholesale:
  - generic sidecar bootstrap and control-plane contracts -> high-bar `packages/shared/use-cases` with canonical `/public`
  - repo-memory run contracts and RPC -> `packages/repo-memory/use-cases/{public,server}`
- Route `packages/shared/server` into a dedicated driver package, most likely `packages/drivers/drizzle`, rather than leaving it under shared-kernel review.
- Route `packages/shared/tables` into:
  - driver-coupled Drizzle helpers -> `packages/drivers/drizzle`
  - only truly driver-neutral table modeling helpers -> `packages/foundation/modeling/*`
- Route `.claude` and `.codex` by subtree, not by root:
  - declarative runtime files -> `agents/runtime-adapter/*`
  - portable guidance -> `agents/skill-pack/*` and `agents/policy-pack/*`
  - executable hooks, scripts, tests, and runtime code -> `packages/tooling/tool/*`
- Default-route `packages/shared/client` and `packages/shared/ui` to deletion unless a high-bar shared-kernel exception is proven.

## Required Remediations

1. Add an early repo-wiring phase before slice migrations and make it a gate for P3 and P4.
2. Revise the routing canon so `runtime/protocol` is split into shared sidecar control-plane contracts plus repo-memory-specific use-case contracts.
3. Close `shared/server` and `shared/tables` with committed destinations centered on a real Drizzle driver package.
4. Add a subtree-level `.claude` and `.codex` decomposition matrix and wire it into P1 and P6.
5. Create an exhaustive legacy path-coupling inventory with phase ownership and rewrite strategy.
6. Add identity-registry migration as explicit required work for every package move phase.
7. Mark `shared/client` and `shared/ui` as default-delete unless preserved by evidence.
8. Make `editor/ui` an explicit package creation step in P4.

## Residual Risks

- A shared `sidecar control-plane` package is a real shared-kernel exception and should be justified narrowly so it does not become a new horizontal dumping ground.
- Historical initiative docs and archived plans still mention old paths. The initiative should decide whether archives are exempt or whether only active operational docs must be rewritten.
- Even after routing is fixed, the repo still has a very large tail of tests, docgen mappings, and generated config that can silently reintroduce old paths if not tracked centrally.

## Verdict

The initiative is not currently acceptable as a complete 100 percent convergence plan. The packet is directionally strong, but repo reality exposes one wrong routing assumption, one phase-order problem, and several under-specified high-risk migrations that must be fixed before this can safely serve as the canonical end-state program.

Checklist:

- [ ] Split `runtime/protocol` into shared sidecar control-plane contracts plus repo-memory-specific contracts.
- [ ] Introduce an early repo-wiring phase before P3/P4.
- [ ] Commit `shared/server` and `shared/tables` to concrete Drizzle-oriented target routes.
- [ ] Add subtree-level `.claude` and `.codex` routing.
- [ ] Create a legacy path-coupling inventory artifact.
- [ ] Add identity-registry migration work.
- [ ] Default-delete `shared/client` and `shared/ui` unless evidence preserves them.
- [ ] Make `editor/ui` an explicit package creation target.
