# Canonical Slice Factory Codex Handoff Prompt

Use this prompt in a fresh Codex session rooted in this repo.

```text
You are working in the beep-effect repo. First confirm the repo root with
`pwd`, `git rev-parse --show-toplevel`, and targeted file reads. Do not assume
the checkout is clean.

This is an implementation session. Audit first, then implement. Ask the user
only when a decision is genuinely missing from the initiative packet and cannot
be resolved from the repo.

Use Graphiti memory for beep-effect context if the `graphiti-memory` MCP is
available. If it is unavailable, continue from repo-local docs and code search.

## Mission

Implement the `initiatives/canonical-slice-factory` initiative.

The goal is to replace the drifted `fixture-lab/Specimen` architecture proof
with a new staged `architecture-lab/WorkItem` proof, then systemize creation of
canonical architecture parts through a modular `beep architecture` command
group in `@beep/repo-cli`.

This work is not merely "make a scaffold CLI." It must prove the canonical
parts and make their creation repeatable and ergonomic.

## Source Of Truth

Read these first:

- `initiatives/canonical-slice-factory/README.md`
- `initiatives/canonical-slice-factory/SPEC.md`
- `initiatives/canonical-slice-factory/PLAN.md`
- `initiatives/canonical-slice-factory/ops/manifest.json`
- `standards/ARCHITECTURE.md`
- `standards/architecture/README.md`
- `standards/architecture/GLOSSARY.md`
- `standards/architecture/01-hexagonal-vertical-slices.md`
- `standards/architecture/05-layer-composition.md`
- `standards/architecture/07-non-slice-families.md`
- `standards/architecture/08-testing.md`
- `standards/architecture/09-errors-across-boundaries.md`
- `standards/architecture/13-onboarding-the-minimum-viable-slice.md`

Use `initiatives/repo-architecture-automation`,
`packages/tooling/tool/cli/test/fixtures/repo-architecture-automation`, and
`packages/fixture-lab/specimen` as reference material only. They are superseded
and should not remain active canonical guidance after implementation.

Treat architecture docs as target doctrine. If current code disagrees with
doctrine, classify the disagreement as current drift, transitional
compatibility, cleanup-on-touch, missing decision, or doctrine gap.

## Audit Before Editing

Before changing files:

1. Inspect the current git status.
2. Inventory active references to:
   - `fixture-lab/Specimen`
   - `fixture-lab`
   - `Specimen`
   - `@beep/fixture-lab-specimen`
   - `$FixtureLabSpecimenId`
3. Inspect `@beep/repo-cli` command patterns, especially:
   - `packages/tooling/tool/cli/src/commands/Root.ts`
   - `packages/tooling/tool/cli/src/commands/CreatePackage`
   - existing command groups with nested subcommands
4. Inspect package identity, config-sync, tsconfig, syncpack, docgen, and
   workspace surfaces that existing architecture proof packages touch.

After the audit, make a short implementation checklist and then execute it.

## Required Design

Build toward this CLI shape:

- `beep architecture create slice`
- `beep architecture add concept`
- `beep architecture add role`
- `beep architecture plan`
- `beep architecture apply`
- `beep architecture check`

The exact public grammar can evolve if repo constraints demand it, but the
internal model is fixed:

- all ergonomic commands compile into one schema-backed architecture operation
  plan;
- the operation plan is decoded and validated before writing;
- writer selection happens from the normalized plan;
- Handlebars may render reviewable source/docs leaves;
- structured writers own JSON, JSONC, package metadata, docgen, and manifests;
- ts-morph is used only for semantic TypeScript mutations such as identity,
  imports, exports, and stable generated indexes;
- commands write by default, support `--dry-run`, expose planned operations,
  and are idempotent on repeat.

Do not build separate one-off scaffold scripts for each command. The point is a
modular factory that can later create tables, protocol modules, foundation
packages, drivers, and other architecture parts through the same plan model.

Keep `create-package` compatible, but route future package-creation rules
toward the shared architecture planner rather than preserving a parallel
package scaffolder forever.

## Proof Target

Replace the old proof with `architecture-lab/WorkItem`.

`WorkItem` is a synthetic lifecycle task. Keep it boring and useful:
draft/open/done/archived-style lifecycle, create/assign/complete/reopen-style
commands, one query path, and enough typed failures to prove boundary
translation.

The proof is staged:

1. Minimal legal slice core: domain, use-cases, server.
2. Persistence adapter: config, tables, repository, package/slice Layer.
3. Protocol adapters: driver-neutral HTTP/RPC/AI declarations in use-cases and
   server handlers.
4. Client experience: client facade, UI surface, and a dedicated synthetic app
   harness such as `apps/architecture-lab-proof`.

Each stage must be valid on its own. Do not create packages or files only for
symmetry. Optional packages and role files exist only when they carry meaningful
behavior, contract, adapter, config, or tests.

## Old Proof Replacement

Supersede and remove active canonical reliance on:

- `initiatives/repo-architecture-automation`
- `packages/tooling/tool/cli/test/fixtures/repo-architecture-automation`
- `packages/fixture-lab/specimen`
- `@beep/fixture-lab-specimen-*`
- `$FixtureLabSpecimenId`
- docs that name `fixture-lab/Specimen` as the executable proof

Use the old packet and fixture to mine lessons before deleting or rewriting
references. Do not leave both proofs as parallel canonical examples.

## Documentation And Agent Guidance

Update agent-facing guidance once the command group exists. Agents should learn
to use `beep architecture` for canonical slices and architecture parts instead
of hand-authoring boilerplate.

Update only the surfaces that own the decision:

- root agent guidance for "use this command";
- relevant architecture docs for proof-target and generated-default updates;
- repo-cli README/docs for command usage;
- initiative docs/manifest for implementation status.

Do not create generic context files or ADR folders.

## Verification

Use targeted checks while building:

- operation-plan and idempotency tests for `@beep/repo-cli`;
- runtime and type tests for staged `architecture-lab/WorkItem` packages;
- search audits for stale `fixture-lab/Specimen` canonical references;
- package/config sync checks needed by generated workspaces.

When coherent, attempt:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- repo full audit command

If a full gate fails because of unrelated pre-existing state, record the exact
command, failure, and remaining follow-up.

## Final Response

Report:

- what changed;
- where the new proof and CLI factory live;
- which old fixture references were removed or intentionally left historical;
- exact verification commands and results;
- any unresolved blockers.
```
