# Agent Runtime Decomposition Matrix

## Purpose

Split `.agents`, `.aiassistant`, `.claude`, and `.codex` by artifact type
instead of by root folder.

The governing rule is simple:

- portable content goes to `agents/*`
- declarative steering and authoring packets go to `agents/policy-pack/*`
- declarative runtime assembly goes to `agents/runtime-adapter/<runtime>`
- executable code goes to `packages/tooling/tool/*`

`P0` baseline work and the `P2` enablement gate treat `.agents`,
`.aiassistant`, `.claude`, and `.codex` as one required legacy-root audit set.
No downstream slice or `P6` cutover gate is complete while any of those roots
still survives as a canonical home.

## `.agents` Matrix

| Current subtree or file class | Classification | Committed destination | Notes |
|---|---|---|---|
| `.agents/policies/**/*.json`, `.agents/policies/README.md` | declarative policy overlays | `agents/policy-pack/*` | keep policy data declarative and path-light |
| `.agents/skills/**/SKILL.md`, `.agents/skills/**/references/**`, `.agents/skills/**/assets/**` | portable skill content | `agents/skill-pack/*` | keep runtime-agnostic guidance only |
| `.agents/skills/CONVENTIONS.md`, `.agents/skills/_shared/**` | shared authoring rules and shared reference packets | `agents/policy-pack/*` | cross-skill guidance needs an explicit owner rather than an unowned root subtree |
| `.agents/skills/**/README.md`, `.agents/skills/**/TASKS.md`, `.agents/skills/**/Article.md`, `.agents/skills/**/cli.md`, `.agents/skills/**/customization.md`, `.agents/skills/**/mcp.md`, `.agents/skills/**/command/**` | skill-local support docs | `agents/skill-pack/*/references/**` or delete/archive | normalize loose docs under canonical reference anchors |
| `.agents/skills/**/rules/**/*.md` | declarative steering packets | `agents/policy-pack/*` | if a rule survives, it becomes an owned policy packet rather than a stray skill-tree subtree |
| `.agents/skills/**/agents/*.yml`, `.agents/skills/**/agents/*.yaml` | runtime-specific descriptors | `agents/runtime-adapter/<runtime>` | split by runtime name, such as `openai`, and normalize raw legacy-root path references to canonical skill ids, policy selectors, or tooling-owned wrapper entrypoints |
| `.agents/skills/**/evals/**` | eval fixtures or scorecards | `packages/tooling/tool/*/test/fixtures` or delete/archive | keep only when an executable harness owns them |
| `.agents/skills/**/.git/**`, `.agents/skills/**/.gitignore` when retained only as vendored VCS residue | VCS metadata or submodule baggage | delete from the migrated asset pack or govern as an external submodule outside canonical `agents/*` packages | VCS state is not agent content |

## `.aiassistant` Matrix

| Current subtree or file class | Classification | Committed destination | Notes |
|---|---|---|---|
| `.aiassistant/patterns/**/*.md`, `.aiassistant/patterns/README.md`, `.aiassistant/patterns/TEMPLATE.md`, `.aiassistant/rules/**/*.md` | declarative steering packets | `agents/policy-pack/*` | keep instruction text path-light and declarative |
| `.aiassistant/skills/**/SKILL.md` | portable skill content | `agents/skill-pack/*` | same skill-pack law as `.agents` and `.claude` content |
| `.aiassistant/skills/**/references/**`, `.aiassistant/skills/**/command/**`, `.aiassistant/skills/**/Article.md` | skill-local support docs | `agents/skill-pack/*/references/**` or delete/archive | normalize non-canonical support docs under `references/**` |

## `.claude` Matrix

| Current subtree or file class | Classification | Committed destination | Notes |
|---|---|---|---|
| `.claude/skills/**/SKILL.md`, `.claude/skills/**/assets/**`, `.claude/skills/**/references/**` | portable skill content | `agents/skill-pack/*` | keep portable and runtime-agnostic |
| `.claude/skills/CONVENTIONS.md`, `.claude/skills/_shared/**` | shared authoring rules and shared reference packets | `agents/policy-pack/*` | mirror the shared-law handling already committed for `.agents` |
| `.claude/skills/**/README.md`, `.claude/skills/**/TASKS.md`, `.claude/skills/**/Article.md`, `.claude/skills/**/cli.md`, `.claude/skills/**/customization.md`, `.claude/skills/**/mcp.md`, `.claude/skills/**/command/**` | skill-local support docs | `agents/skill-pack/*/references/**` or delete/archive | normalize loose docs under canonical reference anchors |
| `.claude/skills/**/rules/**/*.md` | declarative steering packets | `agents/policy-pack/*` | if a rule survives, it becomes an owned policy packet rather than a stray skill-tree subtree |
| `.claude/skills/**/agents/*.yml`, `.claude/skills/**/agents/*.yaml` | runtime-specific descriptors | `agents/runtime-adapter/<runtime>` | split by runtime name, such as `openai`, and normalize raw legacy-root path references to canonical skill ids, policy selectors, or tooling-owned wrapper entrypoints |
| `.claude/skills/**/evals/**` | eval fixtures or scorecards | `packages/tooling/tool/*/test/fixtures` or delete/archive | keep only when an executable harness owns them |
| `.claude/rules/**/*.md`, `.claude/patterns/**/*.md` | declarative steering packets | `agents/policy-pack/claude-core` | markdown guidance only |
| `.claude/settings.json` | declarative runtime config | `agents/runtime-adapter/claude` | runtime-specific assembly/config only after raw legacy-root path references are rewritten to canonical ids, selectors, or tooling wrapper entrypoints |
| `.claude/hooks/**` | executable runtime hooks | `packages/tooling/tool/claude-runtime` | includes `run.sh`, TypeScript executables, and hook packaging |
| `.claude/internal/**` | executable runtime helpers | `packages/tooling/tool/claude-runtime` | runtime support code is not a runtime-adapter asset |
| `.claude/scripts/**` | executable tooling code | `packages/tooling/tool/claude-runtime` | includes analyzers, CLIs, and support scripts |
| `.claude/test/**`, `.claude/patterns/**/*.test.ts` | executable tests | `packages/tooling/tool/claude-runtime` | tests follow the executable package that owns the behavior |
| `.claude/patterns/schema.ts` | executable/schema support code | `packages/tooling/tool/claude-runtime` | not portable policy content |
| `.claude/package.json`, `.claude/tsconfig.json`, `.claude/vitest.config.ts`, `.claude/README.md` | package shell for executable runtime | `packages/tooling/tool/claude-runtime` | docs split as needed after the move |
| `.claude/.hook-state.json` | stateful runtime artifact | owned by `packages/tooling/tool/claude-runtime` | do not relocate into `agents/*` |
| `.claude/.claude/_test-*` fixtures | test fixture or delete candidate | `packages/tooling/tool/claude-runtime/test/fixtures` or delete | never treat as runtime-adapter content |

## `.codex` Matrix

| Current subtree or file class | Classification | Committed destination | Notes |
|---|---|---|---|
| `.codex/config.toml` | declarative runtime config | `agents/runtime-adapter/codex` | runtime-specific assembly/config only after raw legacy-root path references are rewritten to canonical ids, selectors, or tooling wrapper entrypoints |
| `.codex/agents/*.toml`, `.codex/agents/README.md` | declarative runtime descriptors | `agents/runtime-adapter/codex` | these are Codex-specific runtime descriptors, not portable skill text, and they must normalize legacy filesystem paths during the move |
| `.codex/Domain/Hooks/**` | executable runtime hooks | `packages/tooling/tool/codex-runtime` | hook logic is executable tooling code |
| `.codex/test/**` | executable tests | `packages/tooling/tool/codex-runtime` | tests follow the executable package |
| `.codex/package.json`, `.codex/tsconfig.json`, `.codex/vitest.config.ts`, `.codex/README.md` | package shell for executable runtime | `packages/tooling/tool/codex-runtime` | docs split as needed after the move |
| `.codex/.turbo/**`, `.codex/node_modules/**` | local build/runtime artifacts | owned by `packages/tooling/tool/codex-runtime` or regenerated locally | never migrate local cache state into `agents/*` |

## Cutover Rules

1. no executable `.ts`, shell script, or test file is allowed to remain in
   `agents/runtime-adapter/*`
2. no runtime-specific `.toml`, `.json`, `.yml`, `.yaml`, or instruction
   template file is allowed to remain stranded inside tooling packages once the
   cutover is complete
3. no non-canonical skill support doc may remain loose at a skill-pack root; if
   it survives, normalize it under `references/**` or move it into an owned
   `agents/policy-pack/*`
4. eval fixtures survive only when an owned executable harness consumes them;
   otherwise they delete or archive out of the canonical agent package tree
5. nested `.git` or other VCS state deletes from migrated agent asset packs or
   is handled as explicit external submodule governance outside the canonical
   package tree
6. if a subtree mixes declarative and executable assets, split by file class,
   not by preserving the mixed subtree
7. any temporary root-level wrapper used during the cutover must be entered in
   `../ops/compatibility-ledger.md`
8. any file routed into `agents/runtime-adapter/*` must rewrite raw `.agents`,
   `.aiassistant`, `.claude`, and `.codex` filesystem references to canonical
   skill ids, policy selectors, or tooling-owned wrapper entrypoints before the
   move counts as complete

## Expected Outcome

After cutover:

- `.agents`, `.aiassistant`, `.claude`, and `.codex` no longer survive as
  canonical roots
- the same four roots are removed from the required legacy-root audit set only
  after exact search proof shows they are no longer canonical anywhere in repo
  wiring, allowlists, or runtime descriptors
- `agents/*` contains only portable or declarative assets
- `packages/tooling/tool/*` owns all executable runtime logic, tests, and local
  runtime state
