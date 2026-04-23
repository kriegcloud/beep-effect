# Agent Runtime Decomposition Matrix

## Purpose

Split `.claude` and `.codex` by artifact type instead of by root folder.

The governing rule is simple:

- portable content goes to `agents/*`
- declarative runtime assembly goes to `agents/runtime-adapter/*`
- executable code goes to `packages/tooling/tool/*`

## `.claude` Matrix

| Current subtree or file class | Classification | Committed destination | Notes |
|---|---|---|---|
| `.claude/skills/**/SKILL.md`, `.claude/skills/**/assets/**`, `.claude/skills/**/references/**`, `.claude/skills/_shared/**` | portable skill content | `agents/skill-pack/*` | keep portable and runtime-agnostic |
| `.claude/rules/**/*.md`, `.claude/patterns/**/*.md` | declarative steering packets | `agents/policy-pack/claude-core` | markdown guidance only |
| `.claude/settings.json` | declarative runtime config | `agents/runtime-adapter/claude` | runtime-specific assembly/config only |
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
| `.codex/config.toml` | declarative runtime config | `agents/runtime-adapter/codex` | runtime-specific assembly/config only |
| `.codex/agents/*.toml` | declarative runtime descriptors | `agents/runtime-adapter/codex` | these are Codex-specific runtime descriptors, not portable skill text |
| `.codex/Domain/Hooks/**` | executable runtime hooks | `packages/tooling/tool/codex-runtime` | hook logic is executable tooling code |
| `.codex/test/**` | executable tests | `packages/tooling/tool/codex-runtime` | tests follow the executable package |
| `.codex/package.json`, `.codex/tsconfig.json`, `.codex/vitest.config.ts`, `.codex/README.md` | package shell for executable runtime | `packages/tooling/tool/codex-runtime` | docs split as needed after the move |

## Cutover Rules

1. no executable `.ts`, shell script, or test file is allowed to remain in
   `agents/runtime-adapter/*`
2. no runtime-specific `.toml`, `.json`, or template file is allowed to remain
   stranded inside tooling packages once the cutover is complete
3. if a subtree mixes declarative and executable assets, split by file class,
   not by preserving the mixed subtree
4. any temporary root-level wrapper used during the cutover must be entered in
   the compatibility ledger

## Expected Outcome

After cutover:

- `.claude` and `.codex` no longer survive as canonical workspace roots
- `agents/*` contains only portable or declarative assets
- `packages/tooling/tool/*` owns all executable runtime logic and tests
