# V2T Canonical Spec - Grill Log

This file is append-only. Record high-signal questions, recommendations, answers, and package-shape decisions here so future sessions do not have to rediscover them.

## Logging Rules

- Append only; do not rewrite earlier decisions unless the repo evidence has changed and the reversal is recorded explicitly.
- Record package-shape defaults, routing rules, validator expectations, and command-truth decisions here.

## 2026-04-10 Bootstrap Decisions

### Q1 - What artifact shape should the V2T canonical spec use?

- Recommendation: use a full canonical spec package consistent with repo precedent
- Answer: use a full canonical spec package
- Resolution: created root docs, handoffs, a manifest, and the five phase artifacts

### Q2 - How should the five phase artifacts be named?

- Recommendation: honor the requested exact filenames
- Answer: use `RESEARCH.md`, `DESIGN_RESEARCH.md`, `PLANNING.md`, `EXECUTION.md`, and `VERIFICATION.md`
- Resolution: the manifest points p0-p4 directly at those root-level files

### Q3 - Where should the canonical spec live?

- Recommendation: canonicalize in-place under `specs/pending/V2T`
- Answer: keep it in-place
- Resolution: preserved the existing PRD inputs and built the package around them

## Default Assumptions Chosen From Repo Reality

- The first execution slice is the local-first workflow, not a claim of finished autonomous media generation quality.
- `apps/V2T` is the canonical app workspace.
- Shared speech-input UI and root Graphiti tooling are prior art to reuse rather than duplicate.

## 2026-04-10 Review Corrections

### Q4 - Does the repo have a root-level canonical spec registry that V2T still needs to wire into?

- Recommendation: no, treat the repair as package-local because repo precedent is convention-based rather than centrally registered
- Answer: no root-level registry was found in `package.json`, `turbo.json`, or nearby tooling
- Resolution: repaired the package-local handoff router, manifest, and entry prompt instead of inventing root config changes

### Q5 - Which sidecar seam should the canonical spec treat as authoritative?

- Recommendation: use the existing `@beep/VT2` sidecar package and scripts as the current control-plane seam
- Answer: `packages/VT2` is the current sidecar seam
- Resolution: updated the research, design, planning, handoffs, and prompts to point at `packages/VT2/src/protocol.ts`, `packages/VT2/src/Server/index.ts`, and the app-side sidecar scripts

### Q6 - Should the bootstrap repair change root markdown lint policy for specs?

- Recommendation: no, keep the repo-wide ignore in place for this pass and record the limitation explicitly
- Answer: leave root markdown lint policy unchanged
- Resolution: the repair stayed inside `specs/pending/V2T` and documented that `.markdownlint-cli2.jsonc` still ignores `specs/**`

### Q7 - How should this package enforce conformance without inventing nonexistent workspace tasks?

- Recommendation: split the gates into spec-package validation, targeted workspace commands, repo-law commands, and a final readiness gate
- Answer: use a layered command matrix instead of pretending `@beep/VT2` has package-local `lint` or `docgen`
- Resolution: updated `README.md`, `PLANNING.md`, `EXECUTION.md`, `VERIFICATION.md`, the handoffs, and `outputs/manifest.json` with the real gate structure

### Q8 - What should validate the spec package itself while markdownlint ignores `specs/**`?

- Recommendation: add a package-local validator for manifest references and markdown links, paired with `git diff --check`
- Answer: add a dedicated spec validator
- Resolution: added `outputs/validate-spec.mjs` and made it part of the package-level gate

### Q9 - Which standards must be explicitly referenced by every serious V2T phase?

- Recommendation: require `AGENTS.md`, `effect-first-development`, `schema-first-development`, `.patterns/jsdoc-documentation.md`, `standards/effect-first-development.md`, `standards/schema-first.inventory.jsonc`, and `tooling/configs/src/eslint/SchemaFirstRule.ts`
- Answer: make those inputs explicit package-wide
- Resolution: updated the root docs, phase docs, prompts, and handoffs so future sessions do not skip the repo-law context

### Q10 - What is the role of the agent operating the active phase?

- Recommendation: make that session the explicit phase orchestrator rather than treating orchestration as implied behavior
- Answer: the active phase session is always the phase orchestrator
- Resolution: updated the README, quick start, handoffs, phase prompts, and phase artifacts to make orchestration ownership explicit

### Q11 - How should V2T orchestrators delegate work?

- Recommendation: add a durable delegation kit with an operating model, worker output contract, and ready-to-paste phase-specific worker prompts
- Answer: create a dedicated delegation kit under `specs/pending/V2T/prompts/`
- Resolution: added `prompts/README.md`, `prompts/ORCHESTRATOR_OPERATING_MODEL.md`, `prompts/SUBAGENT_OUTPUT_CONTRACT.md`, and `prompts/PHASE_DELEGATION_PROMPTS.md`

### Q12 - Which reusable sub-agents should be preconfigured for Effect v4 work?

- Recommendation: preconfigure repo-local custom agents for repo mapping, schema work, service wiring, typed errors, HTTP or AI boundaries, state or concurrency semantics, and adversarial quality review
- Answer: add those agents in project-scoped `.codex` config
- Resolution: added `.codex/config.toml` plus `.codex/agents/*.toml` so future V2T sessions can selectively delegate to Effect v4 specialists without inventing roles on the fly

## 2026-04-10 Package Hardening Decisions

### Q13 - Should active phase routing require operators to infer the current handoff, prompt, output, and trackers from separate manifest fields?

- Recommendation: no, add a single `active_phase_assets` object that duplicates the active phase routing targets and let the validator enforce coherence
- Answer: make active phase routing explicit
- Resolution: added `active_phase_assets` to `outputs/manifest.json` and updated the scoped operator docs to trust it

### Q14 - What is the command-truth package name and targeted lint gate for the app workspace?

- Recommendation: use the live package name `@beep/v2t` and keep the targeted
  lint gate aligned on `bun run --cwd apps/V2T lint`
- Answer: treat lowercase `@beep/v2t` plus the package-local app lint gate as
  authoritative
- Resolution: corrected the scoped docs and manifest command matrix after
  verifying that `@beep/V2T` is not a real workspace package and that
  `turbo run lint --filter=@beep/v2t` still expands into the nonexistent
  `@beep/VT2#lint` task

### Q15 - What should the package-local validator enforce beyond broken links?

- Recommendation: validate manifest coherence, exact fileset coverage, required operator headings, and active phase routing in addition to relative links
- Answer: expand the validator into a package-contract check
- Resolution: upgraded `outputs/validate-spec.mjs` and added the supporting manifest metadata so future package drift is caught automatically
