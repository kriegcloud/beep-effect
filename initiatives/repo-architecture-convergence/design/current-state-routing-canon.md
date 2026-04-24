# Current-State Routing Canon

## Objective

Close the route table from the repo's active legacy topology to the canonical
architecture grammar in `standards/ARCHITECTURE.md`.

This canon is target-accurate:

- `/public`, `/server`, `/secrets`, `/layer`, and `/test` are export subpaths
  on `use-cases` or `config` packages
- they are not destination package kinds
- route decisions therefore name packages first and export subpaths second

## Observed Legacy Seams

The current repo still exposes all of the transition-note roots called out by
the architecture packet, plus one additional live assistant root that the
current repo now carries:

- `packages/common/*`
- top-level `tooling/*`
- `packages/shared/providers/*`
- `packages/runtime/*`
- slice-local `protocol`, `runtime`, `model`, `store`, and `sqlite` package
  names
- repo-local agent roots: `.agents`, `.aiassistant`, `.claude`, `.codex`

The repo also still hard-codes those roots into workspaces, path aliases,
docgen mappings, app sidecar entrypoints, and the identity/scaffolder layer.
Routing therefore stays incomplete until the enablement rewrites land.

## `P0` Baseline Inputs And Audit Set

This routing canon is not a standalone baseline. Any `P0` evidence pack that
claims current-state routing or architecture/repo-law status must pair this
document with:

1. `design/legacy-path-coupling-inventory.md`
2. `design/agent-runtime-decomposition-matrix.md`

The minimum required baseline audit set is:

1. every legacy-root family named in `Observed Legacy Seams`, including the
   four repo-local agent roots `.agents`, `.aiassistant`, `.claude`, and
   `.codex`
2. canonical subpath/export usage for boundary-sensitive packages
3. live compatibility surfaces that may need rows in
   `../ops/compatibility-ledger.md`
4. `beep.family`, `beep.kind`, and agent `beep.json` metadata state

## Foundation Routing Canon

The current `packages/common/*` packages route into
`packages/foundation/<kind>/<name>` using the following default map:

| Current package | Target kind | Default target path | Reasoning |
|---|---|---|---|
| `@beep/chalk` | `primitive` | `packages/foundation/primitive/chalk` | terminal formatting helper with no domain semantics |
| `@beep/colors` | `primitive` | `packages/foundation/primitive/colors` | ANSI color utility surface |
| `@beep/data` | `primitive` | `packages/foundation/primitive/data` | static data and value helpers |
| `@beep/messages` | `primitive` | `packages/foundation/primitive/messages` | message/i18n utility surface without live services |
| `@beep/types` | `primitive` | `packages/foundation/primitive/types` | compile-time utility types |
| `@beep/utils` | `primitive` | `packages/foundation/primitive/utils` | domain-agnostic runtime helpers |
| `@beep/identity` | `modeling` | `packages/foundation/modeling/identity` | schema-first identity composers and package identity substrate |
| `@beep/md` | `modeling` | `packages/foundation/modeling/md` | markdown model and codec surface |
| `@beep/schema` | `modeling` | `packages/foundation/modeling/schema` | primary schema/modeling substrate |
| `@beep/semantic-web` | `modeling` | `packages/foundation/modeling/semantic-web` | schema-heavy semantic-web models and codecs |
| `@beep/nlp` | `capability` | `packages/foundation/capability/nlp` | runtime services, tool adapters, and boundary helpers |
| `@beep/observability` | `capability` | `packages/foundation/capability/observability` | services, layers, and runtime observability helpers |
| `@beep/ui` | `ui-system` | `packages/foundation/ui-system/ui` | shared domain-agnostic UI primitives and themes |

`common` is not a durable family and must not survive as a steady-state root.

## Tooling Routing Canon

Top-level `tooling/*` workspaces migrate into `packages/tooling/<kind>/<name>`:

| Current workspace | Target kind | Default target path |
|---|---|---|
| `tooling/cli` | `tool` | `packages/tooling/tool/cli` |
| `tooling/docgen` | `tool` | `packages/tooling/tool/docgen` |
| `tooling/repo-checks` | `tool` | `packages/tooling/tool/repo-checks` |
| `tooling/repo-utils` | `library` | `packages/tooling/library/repo-utils` |
| `tooling/configs` | `policy-pack` | `packages/tooling/policy-pack/repo-configs` |
| `tooling/test-utils` | `test-kit` | `packages/tooling/test-kit/test-utils` |
| `packages/_internal/db-admin` | `tool` | `packages/tooling/tool/db-admin` |
| `infra` | `tool` | `packages/tooling/tool/infra` unless the architecture is amended explicitly |

`create-package`, `docgen`, `repo-checks`, workspace globs, root path aliases,
and package metadata must move with these packages. Otherwise the repo will keep
re-creating the legacy roots after each migration batch.

## Drivers Routing Canon

The current repo has one direct `providers -> drivers` case and two
driver-oriented shared packages whose targets now close concretely:

| Current workspace | Committed destination | Notes |
|---|---|---|
| `packages/shared/providers/firecrawl` | `packages/drivers/firecrawl` | exact transition-note example |
| `packages/shared/server` | `packages/drivers/drizzle` | current package is entirely Effect/Drizzle integration surface and is not shared-kernel language |
| `packages/shared/tables` | `packages/drivers/drizzle` first; optional extraction to `packages/foundation/modeling/table-modeling` only for engine-neutral survivors | the live package is SQLite/Drizzle-shaped today, so driver routing is primary and any foundation extraction is secondary |

The routing decision for `shared/tables` is intentionally concrete:

- Drizzle- or SQLite-coupled factories, types, default columns, and helpers go
  to `packages/drivers/drizzle`
- only truly engine-neutral table-shape or identity-shape helpers may survive
  as `packages/foundation/modeling/table-modeling`
- if no such engine-neutral helpers survive the split audit, the foundation
  package is not created

## Shared-Kernel Routing Canon

`packages/shared` remains the cross-slice shared kernel, but only for deliberate
shared language:

- `packages/shared/domain` remains for real cross-slice product semantics
- `packages/shared/config` remains for shared config vocabulary with canonical
  config subpaths
- `packages/shared/use-cases` is a high-bar exception only for narrow shared
  sidecar control-plane contracts that truly cross `repo-memory` and `editor`
- `packages/shared/client` defaults to deletion
- `packages/shared/ui` defaults to deletion
- `packages/shared/server` and `packages/shared/tables` delete after extraction

`shared/use-cases` is therefore not a catch-all for old `runtime/protocol`.
Only the shared control-plane contract slice may live there, and even that
survives only if the post-slice audit proves it is still warranted.

## Repo-Memory Routing Canon

`repo-memory` is the first full slice migration target.

| Current workspace | Committed destination | Notes |
|---|---|---|
| `packages/repo-memory/model` | `packages/repo-memory/domain` and `packages/repo-memory/use-cases` | pure product language stays in domain; commands, queries, packets, and application contracts move to `use-cases` |
| `packages/repo-memory/store` | `packages/repo-memory/use-cases` publishing `@beep/repo-memory-use-cases/server` | current store contracts are product ports, not a durable `store` family |
| `packages/repo-memory/sqlite` | split across `packages/repo-memory/config`, `packages/repo-memory/tables`, `packages/repo-memory/server`, and `packages/drivers/drizzle` | the split audit is mandatory and file-by-file |
| `packages/repo-memory/runtime` | `packages/repo-memory/config`, `packages/repo-memory/server`, and any server-only application contracts in `packages/repo-memory/use-cases` | live runtime orchestration is not a lasting `runtime` family |
| `packages/repo-memory/client` | `packages/repo-memory/client` | client remains canonical after import rewrites to canonical `use-cases` and `config` subpaths |
| `packages/runtime/protocol` | split into `packages/shared/use-cases` plus `packages/repo-memory/use-cases` | `packages/shared/use-cases` publishes the shared control-plane contract, while repo-memory run contracts publish from `@beep/repo-memory-use-cases/public` and `/server` |
| `packages/runtime/server` | `packages/repo-memory/server` plus `packages/repo-memory/config` | desktop sidecar launch surfaces and docs must rewrite to the new location |

`packages/runtime/*` is therefore not a durable family. It is a legacy bucket
that must disappear into slice packages plus, where warranted, a narrow shared
control-plane contract package.

## Editor Routing Canon

`editor` is the second full slice migration target.

| Current workspace | Committed destination | Notes |
|---|---|---|
| `packages/editor/domain` | `packages/editor/domain` | already canonical in shape |
| `packages/editor/protocol` | `packages/editor/use-cases` publishing `@beep/editor-use-cases/public` and, if needed, `/server` | editor-specific contracts stay inside the editor slice; shared sidecar control-plane imports come from `@beep/shared-use-cases/public` rather than re-exporting repo-memory contracts |
| `packages/editor/runtime` | `packages/editor/config` and `packages/editor/server` | sidecar runtime code is adapter/config code, not a durable family |
| `packages/editor/client` | `packages/editor/client` | remains canonical after import rewrites |
| `packages/editor/lexical` | explicit new `packages/editor/ui` | the package is product-aware UI and should become `@beep/editor-ui` rather than stay as a legacy one-off name |

`tables` remains optional for `editor`, but `ui` is no longer optional because
the current Lexical package is already a concrete product UI surface.

## Agent Routing Canon

Agent routing is by subtree and file kind across `.agents`, `.aiassistant`,
`.claude`, and `.codex`, not by moving any of those roots as monoliths. The
committed file-class matrix lives in
`design/agent-runtime-decomposition-matrix.md`.

The canonical destinations are:

| Source artifact kind | Committed destination | Normalization rule |
|---|---|---|
| portable skill content such as `.claude/skills/**/SKILL.md`, runtime-agnostic `references/**`, and `assets/**` | `agents/skill-pack/*` | keep only runtime-agnostic skill guidance |
| extra skill-side prose or helper docs such as `.claude/skills/**/README.md`, `TASKS.md`, `Article.md`, `cli.md`, `customization.md`, `mcp.md`, or `command/**` | `agents/skill-pack/*/references/**` or delete/archive | do not leave non-canonical docs loose at a skill-pack root |
| declarative steering packets such as `.agents/policies/**/*.json`, `.claude/rules/**/*.md`, `.claude/patterns/**/*.md`, `.claude/skills/**/rules/**/*.md`, `.aiassistant/rules/**/*.md`, and `.aiassistant/patterns/**/*.md` | `agents/policy-pack/*` | policy content stays declarative and path-light |
| shared cross-skill authoring packets such as `.agents/skills/CONVENTIONS.md`, `.agents/skills/_shared/**`, `.claude/skills/CONVENTIONS.md`, or `.claude/skills/_shared/**` | `agents/policy-pack/*` | shared agent law needs an explicit owner rather than an unowned root subtree |
| runtime-specific descriptors, templates, mappings, or nested `.claude/skills/**/agents/*.yml`, `.claude/skills/**/agents/*.yaml`, and similar `skills/**/agents/*` files | `agents/runtime-adapter/<runtime>` | split by runtime name and rewrite raw legacy-root path references to canonical skill ids, policy selectors, or tooling-owned wrapper entrypoints before cutover proof can pass |
| executable hooks, runtime helpers, shell entrypoints, tests, sync logic, and package shells | `packages/tooling/tool/*` | executable logic never stays in `agents/*` |
| eval fixtures or scorecards such as `.claude/skills/**/evals/**` or other `evals/**` bundles | `packages/tooling/tool/*/test/fixtures` or delete/archive | keep only when an owned executable harness consumes them |
| vendored VCS state such as nested `.git/**` | delete from the migrated asset pack or govern as an external submodule outside the canonical agent package tree | VCS metadata is never canonical agent content |

`agents/runtime-adapter` remains declarative only. Executable hook programs,
sync logic, runtime state handling, and lifecycle orchestration do not stay
inside `agents/`.

Descriptor relocation is not enough on its own. Any runtime-adapter packet,
runtime config, or declarative agent doc that still points at raw `.agents`,
`.aiassistant`, `.claude`, or `.codex` filesystem roots keeps the old topology
canonical by content. `P2` and `P6` proof therefore requires content
normalization to canonical skill ids, policy selectors, or tooling-owned
wrapper entrypoints before the legacy roots can delete.

This coverage is intentionally explicit because the current `.claude` skill
tree already contains support docs, shared conventions, nested runtime
descriptors, eval fixtures, skill-local rules, and article/reference packets
that must not be left unrouted during `P0` or `P6`.

The live repo therefore has four legacy agent roots to retire: shared
`.agents` content, assistant-specific `.aiassistant` steering and skills, and
runtime-rooted `.claude` and `.codex` assemblies.

## Enablement And Closure Gates

The following routing-adjacent work must close before slice cutovers begin:

1. root workspaces, `tsconfig` paths, `turbo` filters, and package metadata
   stop treating any legacy root in the required audit set as canonical:
   `packages/common/*`, top-level `tooling/*`,
   `packages/shared/providers/*`, `packages/runtime/*`, `.agents`,
   `.aiassistant`, `.claude`, and `.codex`
2. app sidecar launch surfaces stop hard-coding
   `packages/runtime/server/src/main.ts` and
   `packages/editor/runtime/src/main.ts`
3. the identity registry at `@beep/identity/packages` and the `create-package`
   scaffolder stop encoding legacy package names and locations
4. runtime-adapter descriptors, runtime configs, and declarative agent docs stop
   hard-coding `.agents`, `.aiassistant`, `.claude`, or `.codex` filesystem
   roots and instead reference canonical skill ids, policy selectors, or
   tooling-owned wrapper entrypoints
5. every temporary alias or wrapper is entered in
   `../ops/compatibility-ledger.md`
6. any proposal to keep a non-canonical exception is entered in
   `../ops/architecture-amendment-register.md` instead of being silently
   grandfathered

The remaining post-slice confirmation gate is narrow: decide whether the shared
control-plane subset of `shared/use-cases` still needs to exist after
`repo-memory` and `editor` consume the split contracts. All other routes above
are closed now.
