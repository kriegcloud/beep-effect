# V2T Canonical Spec - Reflection Log

## Logging Rules

- Record package-local corrections, operator guidance changes, and validator behavior changes here.
- Do not use this file for normal phase execution progress that belongs in the phase artifacts.

## 2026-04-10 Bootstrap

- Canonicalized the package in-place under `specs/pending/V2T` to preserve the existing PRD inputs.
- Locked the exact root-level phase filenames requested by the user instead of normalizing them into `outputs/pN-...`.
- Confirmed the repo already has meaningful V2T implementation anchors: `apps/V2T`, a sidecar proxy seam in `apps/V2T/vite.config.ts`, Graphiti operational tooling at the root, and a reusable speech/transcript primitive in `packages/common/ui/src/components/speech-input.tsx`.
- Defaulted the first execution slice to a repo-grounded vertical slice rather than full autonomous media production: capture or ingest audio, produce transcript/session artifacts, enrich with memory through explicit adapters, configure composition runs, and track export artifacts.
- Preserved the source PRD and earlier V2T notes as durable inputs instead of rewriting them into the package history.

## 2026-04-10 Review Corrections

- Confirmed there is no root-level canonical spec registry to wire this package into, so the required fixes were package-local rather than `package.json` or `turbo.json` changes.
- Added the combined phase router artifacts and a pasteable fresh-session prompt so the package now matches stronger canonical spec patterns in this repo.
- Corrected the spec to name the real sidecar seam at `packages/VT2` and the existing app-side sidecar scripts, rather than pointing future implementers at hypothetical app-local server files.
- Fixed the broken relative image link in the preserved legacy notes file so the canonical package is internally navigable.
- Left root markdown lint policy unchanged because `.markdownlint-cli2.jsonc` is already dirty and still intentionally ignores `specs/**`.

## 2026-04-10 Conformance Review

- Added explicit references to `effect-first-development`, `schema-first-development`, and `.patterns/jsdoc-documentation.md` throughout the canonical package so phase work is grounded in repo law rather than implied preference.
- Replaced the misleading `turbo lint` guidance for `packages/VT2` with a real command matrix: targeted `check` / `test` / `build`, app-local `lint`, and the repo-level effect-law, schema-first, and JSDoc gates.
- Added `outputs/validate-spec.mjs` so the spec package has an enforceable integrity gate even though root markdownlint ignores `specs/**`.
- Clarified that the `codex-plan-mode-prompt.md` filename is legacy compatibility language and that the prompt applies in either Default mode or Plan mode.

## 2026-04-10 Orchestration Review

- Made the active phase session explicitly the phase orchestrator across the README, quick start, handoffs, phase prompts, and phase artifacts.
- Added a delegation kit under `specs/pending/V2T/prompts/` so orchestrators have a durable operating model, output contract, and ready-to-paste phase-specific worker prompts.
- Added project-scoped Codex custom-agent config under `.codex/config.toml` plus specialist Effect v4 agent definitions under `.codex/agents/`.
- Chose a no-nested-subagent posture for this repo-local config by setting `agents.max_depth = 1`, so phase ownership stays with the orchestrator.

## 2026-04-10 Package Hardening

- Re-verified the live task graph against the root plus workspace `package.json` and `turbo.json` files instead of trusting the package prose.
- Confirmed the app workspace package name is `@beep/v2t`, not the stale
  uppercase app filter, and corrected the scoped docs plus manifest command
  matrix accordingly.
- Kept the targeted lint guidance aligned on `bun run --cwd apps/V2T lint`
  while preserving the stricter
  warning that `@beep/VT2` has no direct package-local lint task.
- Added explicit `active_phase_assets`, `fresh_session_read_order`, `output_files`, and required heading validation to the manifest so operators and tooling can resolve package structure without inference.
- Expanded `outputs/validate-spec.mjs` from a broken-link checker into a package-contract validator that now checks manifest coherence, fileset coverage, active-phase routing, command truth anchors, and required sections in the scoped operator docs.

## 2026-04-10 Command-Truth Validator Pass

- Tightened the validator so it derives the live app and sidecar package names from the workspace manifests instead of trusting hardcoded identifiers inside the validator itself.
- Added an explicit `conformance.command_truth_files` catalog to the manifest so package operators and the validator can agree on which live manifests govern package-name and task-surface truth.
- Added stale-command checks for the legacy uppercase app filter and the old path-based Turbo filters so copied command drift now fails fast during package validation.

## 2026-04-10 Authority And Registry Alignment Pass

- Resolved the split authority model by making `outputs/manifest.json` the explicit machine authority for routing, gates, and tracked custom-agent inventory, while keeping `README.md` as explanatory operator guidance.
- Aligned the fresh-session entry surfaces so `README.md`, `QUICK_START.md`, `AGENT_PROMPTS.md`, and `outputs/codex-plan-mode-prompt.md` now all require the same Graphiti preflight and fallback language.
- Extended the validator to enforce parity between the manifest's custom-agent inventory and the live `.codex/config.toml` registry so agent-catalog drift fails fast.

## 2026-04-10 Final Consistency Pass

- Moved Graphiti preflight ahead of active-phase execution in `AGENT_PROMPTS.md` so the startup sequence matches the orchestrator operating model.
- Aligned the human-facing readiness guidance with the machine-readable readiness gate by requiring a recorded `bun run docgen` outcome, using `not applicable` when exported APIs or JSDoc examples did not change.

## 2026-04-10 Script-Surface Enforcement Pass

- Extended `outputs/manifest.json` with explicit required and forbidden script keys so the package records not just command strings, but the live script surfaces those commands depend on.
- Extended `outputs/validate-spec.mjs` to validate the root, app, and sidecar `scripts` maps directly, which closes the remaining gap where copied command guidance could stay syntactically correct while drifting away from actual workspace scripts.
- Tightened the scoped operator docs to state that script-surface drift is a same-pass repair event for both manifest metadata and human guidance.

## 2026-04-10 Graphiti Protocol Pass

- Replaced the lingering README authority contradiction by treating `README.md` as the operator guide and `outputs/manifest.json` as the machine authority, with `fresh_session_read_order` called out as the canonical ordered startup list after the manifest is open.
- Added `prompts/GRAPHITI_MEMORY_PROTOCOL.md` so Graphiti recall, exact-error fallback logging, durable writeback metadata, and session-end summaries now have one canonical contract instead of scattered reminders.
- Extended the manifest and validator to track the Graphiti protocol explicitly, require the memory protocol prompt asset, and fail if the README reintroduces the stale “normative source of truth” wording.
- Propagated the Graphiti protocol through the README, quick start, prompts, handoffs, the phase entry prompt, and the five phase artifacts so memory usage is explicit, auditable, and phase-local evidence can record recall plus writeback behavior consistently.
- Removed a duplicate `outputs/manifest.json` entry from `fresh_session_read_order` and taught the validator to fail on duplicate startup-order entries so the canonical read sequence stays strictly linear.

## 2026-04-10 Startup Authority And Graphiti Fallback Pass

- Removed the last competing human startup-order lists by making the README, quick start, agent prompts, combined handoff, and combined orchestrator prompt explicitly defer to `outputs/manifest.json` `fresh_session_read_order` instead of restating their own ordered sequences.
- Extended the Graphiti protocol from a single fact-search attempt into a documented recall ladder: initial `search_memory_facts`, one shorter fallback query, `get_episodes`, then repo-local fallback.
- Mirrored that Graphiti recall ladder into the manifest so package tooling and human operators now share the same memory-recall contract.
- Extended the validator to enforce the ordered Graphiti recall ladder and to reject the old `## Required Read Order` heading so competing startup-order prose cannot quietly return.
- Aligned `.codex/agents/README.md` with the rest of the package by treating `codex -p v2t_orchestrator` as the preferred startup profile rather than an implied hard requirement.
- Corrected the Graphiti protocol preflight numbering after the recall-ladder expansion so the operator checklist remains linear and copy-safe.

## 2026-04-10 Targeted Lint Gate Truth Pass

- Rechecked the live Turbo behavior and confirmed that `bunx turbo run lint --filter=@beep/v2t` currently succeeds, so the older explanation that it still hits a nonexistent `@beep/VT2#lint` task was stale.
- Kept `bun run --cwd apps/V2T lint` as the default targeted app lint gate, but updated the package guidance to use the truer rationale: the filtered Turbo lint path is dependency-expanded and therefore not equivalent to app-only lint evidence.
- Tightened the validator to reject the stale nonexistent-task explanation so future package edits keep the lint-gate guidance aligned with live repo behavior.
- Fixed a validator bug in the same pass: `graphiti.recall_order` is now checked as an ordered string array instead of by object identity, so the package gate no longer emits false failures when manifest and expected recall order already match.

## 2026-04-10 Graphiti Evidence Sync Pass

- Brought the human-facing evidence rules back into sync with the already-recorded Graphiti recall ladder by requiring every phase and worker memory note to record the `get_episodes` fallback result, not just the initial fact-search query and error text.
- Tightened the quick-start wording so operators are told up front that the Graphiti preflight includes the episode fallback when fact search is empty or wrapper-fragile.

## 2026-04-10 Delegation And Prompt Contract Pass

- Simplified `outputs/codex-plan-mode-prompt.md` so it no longer restates a second ordered startup file list and instead defers explicitly to `outputs/manifest.json` `fresh_session_read_order`.
- Added an explicit Plan-mode branch to the fresh-session prompt so planning sessions do not claim spec edits or grill-log updates before they are allowed to mutate artifacts.
- Tightened the delegation kit by making P1 design workers read-only by default and by requiring every worker packet to carry `Assigned question`, `Graphiti assignment`, and `Stop condition`.
- Standardized the root plus workspace `package.json` and `turbo.json` inputs across the phase docs and phase handoff prompts so command-truth requirements stay visible outside the README.
- Extended the validator with required-snippet checks and stale-pattern guards for the old codex prompt startup list, the old unconditional P0 grill-log rule, and the old P1 write-capable design-worker wording.

## 2026-04-10 Infra Reality Pass

- Corrected the package to treat `@beep/infra` as live repo truth rather than future implementation work.
- Grounded the spec against the current Pulumi workstation surfaces in `infra/Pulumi.yaml`, `infra/src/internal/entry.ts`, `infra/src/V2T.ts`, `infra/scripts/v2t-workstation.sh`, and `infra/test/V2T.test.ts`.
- Extended the command-truth contract so installer and deployment claims must cite `infra/package.json` in addition to the root, app, and sidecar manifests.
- Tightened the human-facing gates so infra check, test, and lint evidence now stay aligned with the live targeted implementation floor.
- Extended the validator to reject stale “add Pulumi later” prose and to require infra-aware snippets across the README, quick start, phase docs, prompts, and handoffs.
