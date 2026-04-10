# Codex Phase Entry Prompt

Use this as the pasteable entry prompt for a fresh Codex session working inside the V2T canonical spec package.

The filename is a compatibility carry-over from the bootstrap pass. The prompt is valid in either Default mode or Plan mode.

```markdown
Use the canonical phased spec package at `specs/pending/V2T/`.

Read these files first:
- `AGENTS.md`
- `.patterns/jsdoc-documentation.md`
- `standards/effect-first-development.md`
- `standards/schema-first.inventory.jsonc`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `.codex/config.toml`
- `.codex/agents/README.md`
- `specs/pending/V2T/README.md`
- `specs/pending/V2T/QUICK_START.md`
- `specs/pending/V2T/AGENT_PROMPTS.md`
- `specs/pending/V2T/prompts/README.md`
- `specs/pending/V2T/prompts/ORCHESTRATOR_OPERATING_MODEL.md`
- `specs/pending/V2T/prompts/PHASE_DELEGATION_PROMPTS.md`
- `specs/pending/V2T/outputs/manifest.json`
- `specs/pending/V2T/outputs/grill-log.md`
- `specs/pending/V2T/handoffs/HANDOFF_P0-P4.md`
- `specs/pending/V2T/handoffs/P0-P4_ORCHESTRATOR_PROMPT.md`

Then:
- determine the active phase from `outputs/manifest.json`
- treat the active phase session as the phase orchestrator
- read only the matching phase handoff and matching phase orchestrator prompt
- execute only that phase
- write or refine the named phase artifact
- update `outputs/manifest.json` when the phase state changes
- update `outputs/grill-log.md` when the active phase is `p0`
- stop at the phase exit gate and wait for explicit instruction before moving to the next phase

Start by gathering repo context with:
- `bun run codex:hook:session-start`
- Graphiti memory preflight when available: `get_status`, then
  `search_memory_facts` using `["beep-dev"]` or the JSON string
  `"[\"beep-dev\"]"` when the wrapper only accepts strings

Prefer `rg` / `rg --files` and parallel exploration.

Rules that apply in every phase:
- use the `effect-first-development` and `schema-first-development` skills when they are available in-session
- if you delegate, use the repo-local custom agents from `.codex/config.toml` and the prompt kit under `specs/pending/V2T/prompts/`
- keep all sub-agent scopes bounded; the active phase session remains the orchestrator
- assume sub-agents share the same worktree unless explicit isolation exists,
  so do not assign overlapping write scopes
- preserve the raw PRD and legacy notes under `outputs/`
- treat `apps/V2T` and `packages/VT2` as the current shell-and-sidecar pair unless a phase artifact explicitly documents a migration
- verify workspace package names from `apps/V2T/package.json` and
  `packages/VT2/package.json` before editing Turbo filter commands; the current
  names are `@beep/v2t` and `@beep/VT2`
- do not invent an app-local server path if the existing `@beep/VT2` control plane can carry the slice
- keep provider logic behind explicit adapters
- summarize verification and residual risk in the active phase artifact
- do not claim a quality gate passed unless the concrete command result is recorded in the active phase artifact
- run a read-only review wave before phase closeout; if it finds substantive
  issues, integrate them and rerun the review

If the active phase is `p0`:
- use the `grill-me` skill when meaningful product or architecture ambiguity remains
- log every new locked decision in `outputs/grill-log.md`

If the active phase edits the canonical spec package itself:
- run `git diff --check -- specs/pending/V2T`
- run `node specs/pending/V2T/outputs/validate-spec.mjs`
- do not rely on `bun run lint:markdown` because root markdownlint ignores `specs/**`

If the active phase is `p3` or `p4`:
- run:
  - `bunx turbo run check --filter=@beep/v2t --filter=@beep/VT2`
  - `bunx turbo run test --filter=@beep/v2t --filter=@beep/VT2`
  - `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
  - `bunx turbo run lint --filter=@beep/v2t`
  - `bun run lint:effect-laws`
  - `bun run lint:jsdoc`
  - `bun run check:effect-laws-allowlist`
  - `bun run lint:schema-first`
- run `bun run docgen` when exported APIs or JSDoc examples changed
- remember that `@beep/VT2` has no package-local `lint` or `docgen` task
- if Graphiti fact search fails because of the current RediSearch syntax issue,
  continue with repo-local docs and record the fallback instead of blocking the
  phase
- distinguish shipped behavior from deferred provider ambition explicitly
```

## Phase Router

- Combined router: `handoffs/P0-P4_ORCHESTRATOR_PROMPT.md`
- Delegation kit: `prompts/README.md`
- P0: `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- P1: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- P2: `handoffs/P2_ORCHESTRATOR_PROMPT.md`
- P3: `handoffs/P3_ORCHESTRATOR_PROMPT.md`
- P4: `handoffs/P4_ORCHESTRATOR_PROMPT.md`
