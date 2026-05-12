# Canonical Slice Factory Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-12
- **Updated:** 2026-05-12

## Mission

Replace the drifted repo architecture automation proof with a new staged
canonical proof and derive a modular `beep architecture` factory from it.

The goal is not only to create new slices from scratch. The factory must also
support granular creation of architecture parts: domain kinds, concepts, role
modules, tables, protocol modules, foundation packages, drivers, and future
architecture units without duplicating generation logic.

## Non-Negotiable Contract

- This initiative supersedes `initiatives/repo-architecture-automation`.
- `fixture-lab/Specimen` is reference material only and must not remain the
  canonical proof after implementation.
- The new proof target is `architecture-lab/WorkItem`.
- `WorkItem` is a synthetic lifecycle task, not product roadmap code.
- The first proof must start from the smallest legal slice and add optional
  parts through explicit stages.
- `beep architecture` owns the future CLI command group.
- Every ergonomic command must compile to one schema-backed architecture
  operation plan before writing files.
- Commands write by default, support `--dry-run`, emit or expose the planned
  operations, and are idempotent on repeat.
- `create-package` should remain compatible but route future package creation
  rules through the shared operation planner.

## Proof Matrix

The `architecture-lab/WorkItem` proof is staged:

1. **Core slice:** minimal legal domain, use-cases, and server package set.
2. **Persistence adapter:** config, tables, server repository, and slice Layer.
3. **Protocol adapters:** driver-neutral HTTP/RPC/AI declarations in
   use-cases plus server handlers.
4. **Client experience:** client facade, UI surface, and dedicated synthetic app
   harness for app-local Layer composition.

Each stage must be a valid target state. Optional packages or role files are
created only when the stage requires meaningful behavior.

## CLI Architecture

The command group should use this shape:

- `beep architecture create slice`
- `beep architecture add concept`
- `beep architecture add role`
- `beep architecture plan`
- `beep architecture apply`
- `beep architecture check`

The public command grammar may evolve, but the internal model must not: every
path normalizes into a decoded operation plan, then flows through writer
selection, template rendering, structured writers, and semantic TypeScript
writers when required.

## Artifact Homes

- Human initiative contract: `initiatives/canonical-slice-factory`.
- Agent launch prompt: `initiatives/canonical-slice-factory/ops/codex-handoff-prompt.md`.
- Machine-readable initiative manifest:
  `initiatives/canonical-slice-factory/ops/manifest.json`.
- Executable repo-cli fixtures: repo-cli test fixtures under
  `packages/tooling/tool/cli/test/fixtures`.
- Runtime proof app: a dedicated synthetic app such as
  `apps/architecture-lab-proof`, not `apps/professional-runtime-proof`.

## Documentation And Agent Guidance

Implementation must update agent-facing guidance so future agents use the new
commands instead of hand-authoring canonical architecture parts. Root guidance,
relevant architecture standards, and repo-cli docs should describe the command
group once it exists.

## Required Verification

Use targeted tests while building and full gates when the replacement is
coherent:

- focused repo-cli factory tests;
- proof-package runtime and type tests;
- fixture/reference search audits proving `fixture-lab/Specimen` is no longer
  active canonical guidance;
- package/config sync checks required by generated packages;
- final attempts of `bun run check`, `bun run lint`, `bun run test`,
  `bun run docgen`, and the repo full audit command.

If a full gate is blocked by unrelated existing repo state, record the exact
command, failure, and follow-up.

## Out Of Scope

- Turning `architecture-lab/WorkItem` into product behavior.
- Building every granular factory in v1.
- Keeping `fixture-lab/Specimen` as a parallel canonical proof.
- Making `@turbo/gen` the generator core; it can become a later wrapper only.
- Moving app-level Layer composition into a monorepo runtime package.

## Source-Of-Truth Order

When sources disagree, use this order:

1. this `SPEC.md`;
2. `standards/ARCHITECTURE.md`;
3. `ops/manifest.json`;
4. `PLAN.md`;
5. `ops/codex-handoff-prompt.md`;
6. old `repo-architecture-automation` design notes as historical reference.
