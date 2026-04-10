# Codex Phase Entry Prompt

Use this as the pasteable entry prompt for a fresh Codex session working inside the V2T canonical spec package.

The filename is a compatibility carry-over from the bootstrap pass. The prompt is valid in either Default mode or Plan mode.

```markdown
Use the canonical phased spec package at `specs/pending/V2T/`.

Read these files first:
- `specs/pending/V2T/outputs/manifest.json`
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
- `specs/pending/V2T/prompts/GRAPHITI_MEMORY_PROTOCOL.md`
- `specs/pending/V2T/prompts/PHASE_DELEGATION_PROMPTS.md`
- `specs/pending/V2T/outputs/grill-log.md`
- `specs/pending/V2T/handoffs/HANDOFF_P0-P4.md`
- `specs/pending/V2T/handoffs/P0-P4_ORCHESTRATOR_PROMPT.md`

Then:
- run `bun run codex:hook:session-start`
- if `graphiti-memory` is available, run the Graphiti preflight and fallback exactly as documented in `specs/pending/V2T/prompts/GRAPHITI_MEMORY_PROTOCOL.md`
- determine the active phase from `outputs/manifest.json`
- trust `active_phase_assets` instead of inferring the active handoff, prompt, output, or trackers from prose
- treat the active phase session as the phase orchestrator
- read only the matching phase handoff and matching phase orchestrator prompt
- do not infer the active phase from markdown status headings inside the package
- if command or task claims matter, read the root plus workspace `package.json` and `turbo.json` files before trusting the spec prose
- execute only that phase
- write or refine the named phase artifact
- update `outputs/manifest.json` when the phase state changes
- update `REFLECTION_LOG.md` when package-local routing, operator workflow, or validator behavior changes
- update `outputs/grill-log.md` when the active phase is `p0`
- run at least one read-only review wave before phase closeout and rerun it if substantive findings remain
- stop at the phase exit gate and wait for explicit instruction before moving to the next phase

Prefer `rg` / `rg --files` and parallel exploration.

Rules that apply in every phase:
- use the `effect-first-development` and `schema-first-development` skills when they are available in-session
- if you delegate, use the repo-local custom agents from `.codex/config.toml` and the prompt kit under `specs/pending/V2T/prompts/`
- if you delegate, give every worker one concrete question to answer, a bounded scope, explicit stop conditions, and require the `SUBAGENT_OUTPUT_CONTRACT.md` response shape
- keep all sub-agent scopes bounded; the active phase session remains the orchestrator
- require every delegated worker to return the `specs/pending/V2T/prompts/SUBAGENT_OUTPUT_CONTRACT.md` format
- preserve the raw PRD and legacy notes under `outputs/`
- treat `apps/V2T` and `packages/VT2` as the current shell-and-sidecar pair unless a phase artifact explicitly documents a migration
- do not invent an app-local server path if the existing `@beep/VT2` control plane can carry the slice
- keep provider logic behind explicit adapters
- summarize verification and residual risk in the active phase artifact
- do not claim a quality gate passed unless the concrete command result is recorded in the active phase artifact
- write Graphiti memory back before ending the session using `specs/pending/V2T/prompts/GRAPHITI_MEMORY_PROTOCOL.md` when the phase produced durable repo truth, architecture decisions, reusable failure knowledge, or meaningful in-progress state

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
  - `bun run --cwd apps/V2T lint`
  - `bun run lint:effect-laws`
  - `bun run lint:jsdoc`
  - `bun run check:effect-laws-allowlist`
  - `bun run lint:schema-first`
- run `bun run docgen` when exported APIs or JSDoc examples changed
- record `bun run docgen` as `not applicable` in readiness evidence when exported APIs or JSDoc examples did not change
- remember that the live app workspace package name is `@beep/v2t`, not `@beep/V2T`
- remember that `@beep/VT2` has no package-local `lint` or `docgen` task
- use `bun run --cwd apps/V2T lint` for the default targeted app lint gate
- do not replace that default with `turbo run lint --filter=@beep/v2t`
  when the phase needs targeted app-only lint evidence, because the filtered
  Turbo run is dependency-expanded and therefore not equivalent to the
  package-local app lint gate
- distinguish shipped behavior from deferred provider ambition explicitly
```

## Operator Notes

- Use `outputs/manifest.json` as the package authority for `active_phase`, `active_phase_assets`, and command gates.
- Treat `outputs/manifest.json` `fresh_session_read_order` as the canonical ordered startup list after the manifest is open.
- If README prose and manifest routing or gate data disagree, repair the prose and keep the manifest authoritative.
- Update `REFLECTION_LOG.md` whenever package-local routing, operator guidance, or validator behavior changes.
- Append `outputs/grill-log.md` only when locking a new package-shape default or decision.

## Phase Router

- Combined router: `handoffs/P0-P4_ORCHESTRATOR_PROMPT.md`
- Delegation kit: `prompts/README.md`
- P0: `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- P1: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- P2: `handoffs/P2_ORCHESTRATOR_PROMPT.md`
- P3: `handoffs/P3_ORCHESTRATOR_PROMPT.md`
- P4: `handoffs/P4_ORCHESTRATOR_PROMPT.md`
