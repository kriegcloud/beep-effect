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
  verifying that `@beep/V2T` is not a real workspace package and that the
  filtered Turbo lint path is dependency-expanded rather than a targeted
  app-only lint gate

### Q15 - What should the package-local validator enforce beyond broken links?

- Recommendation: validate manifest coherence, exact fileset coverage, required operator headings, and active phase routing in addition to relative links
- Answer: expand the validator into a package-contract check
- Resolution: upgraded `outputs/validate-spec.mjs` and added the supporting manifest metadata so future package drift is caught automatically

### Q16 - Should the validator hardcode workspace package names or read them from the live manifests?

- Recommendation: read package truth from the live workspace manifests and treat the manifest as a mirror that must stay in sync
- Answer: derive package names from `apps/V2T/package.json` and `packages/VT2/package.json`
- Resolution: updated `outputs/validate-spec.mjs` to compare manifest command truth against the live manifests and added `conformance.command_truth_files` to document the governing files

### Q17 - What should be authoritative when README prose and manifest routing or gate data disagree?

- Recommendation: make the manifest machine-authoritative for routing, command gates, and tracked custom-agent inventory, and treat README prose as explanatory guidance that must be repaired when it drifts
- Answer: promote `outputs/manifest.json` ahead of README prose for machine-routable package contract facts
- Resolution: updated the source-of-truth order, aligned the fresh-session entry docs, and extended the validator to enforce manifest parity with the live `.codex` registry

### Q18 - How should readiness treat `bun run docgen` when exported APIs did not change?

- Recommendation: keep `bun run docgen` in the readiness gate, but allow the recorded outcome to be `not applicable` when exported APIs or JSDoc examples did not change
- Answer: preserve a single machine-readable readiness gate and make the human guidance explicit about `not applicable`
- Resolution: aligned the README, quick start, entry prompt, and manifest notes so docgen evidence is always recorded instead of silently omitted

### Q19 - Should the package validator trust only copied command strings, or also verify the live script surfaces behind those commands?

- Recommendation: validate both the documented command matrix and the underlying root/app/sidecar script surfaces so machine truth cannot silently drift behind still-plausible prose
- Answer: treat live script presence and absence as part of command truth
- Resolution: added required and forbidden script-key catalogs to `outputs/manifest.json`, taught `outputs/validate-spec.mjs` to validate the live `scripts` maps, and updated the scoped entry docs to require same-pass repairs when command-surface drift appears

### Q20 - What is the canonical Graphiti memory contract for this package?

- Recommendation: define one package-local Graphiti protocol that standardizes recall queries, exact-error fallback logging, fixed writeback metadata, and session-end summaries instead of scattering memory reminders through multiple docs
- Answer: add a dedicated Graphiti memory protocol doc and treat it as canonical
- Resolution: added `prompts/GRAPHITI_MEMORY_PROTOCOL.md`, wired it into the manifest, validator, entry docs, handoffs, prompt kit, and phase artifacts, and made `fresh_session_read_order` the canonical startup sequence after opening the manifest

### Q21 - What should happen when Graphiti fact search is healthy but still fails to return useful recall?

- Recommendation: standardize a recall ladder of `search_memory_facts`, one shorter fallback query, `get_episodes`, and only then repo-local fallback so healthy-but-fragile Graphiti sessions still get a second memory path before giving up
- Answer: make the Graphiti recall ladder explicit and package-wide
- Resolution: updated `prompts/GRAPHITI_MEMORY_PROTOCOL.md`, the manifest, and the startup surfaces so operators record exact query and error evidence, try `get_episodes` before abandoning Graphiti, and keep `fresh_session_read_order` as the only canonical startup order

### Q22 - Why keep `bun run --cwd apps/V2T lint` as the default targeted app lint gate if `turbo run lint --filter=@beep/v2t` currently succeeds?

- Recommendation: keep the package-local app lint command as the default
  evidence because it scopes directly to the app surface, while the filtered
  Turbo lint run fans out across dependency lint work and therefore answers a
  different question
- Answer: distinguish targeted app-only lint evidence from broader dependency
  lint evidence
- Resolution: refined the operator docs and validator expectations so they no
  longer rely on the stale nonexistent-task explanation and instead point to
  the stronger, more durable reason for the app-local lint gate

### Q23 - How should the spec prevent the fresh-session prompt and delegation kit from drifting away from orchestrator ownership rules?

- Recommendation: make the codex entry prompt defer completely to manifest startup order, give Plan mode an explicit no-edit branch, keep P1 design workers read-only by default, and machine-enforce the common worker packet fields plus repeated command-truth inputs
- Answer: treat startup order, Plan-mode behavior, and delegation packet completeness as validator-enforced package contract rather than guidance only
- Resolution: simplified `outputs/codex-plan-mode-prompt.md`, tightened `prompts/PHASE_DELEGATION_PROMPTS.md`, repeated the root plus workspace manifest and Turbo inputs through the phase docs and handoff prompts, and extended `outputs/validate-spec.mjs` with required-snippet plus stale-pattern checks for those rules

## 2026-04-10 Local Installer Decisions

### Q24 - What machine shape should the V2T installer target first?

- Recommendation: target one local Debian/Ubuntu workstation with an existing `beep-effect` checkout and one sudo-capable desktop user
- Answer: local Debian/Ubuntu workstation
- Resolution: V2T workstation automation now lives in `@beep/infra` instead of a cloud deploy or repo-cloning bootstrap path

### Q25 - Which repo surfaces remain authoritative for the installed app?

- Recommendation: keep `apps/V2T` as the native app and `packages/VT2` as the packaged sidecar seam
- Answer: use `apps/V2T` plus `packages/VT2`
- Resolution: the installer builds the native Tauri app locally and preserves the current SQLite-backed sidecar seam

### Q26 - How should the local Qwen runtime be provisioned?

- Recommendation: run `Qwen/Qwen2-Audio-7B-Instruct` natively as a user-owned Python service on localhost
- Answer: native local Qwen service
- Resolution: the installer provisions Qwen outside Docker and exposes it on `127.0.0.1:8011`

### Q27 - Do we need a Hugging Face token for the Qwen model?

- Recommendation: keep it optional because the public model can be downloaded anonymously
- Answer: optional token
- Resolution: `HUGGING_FACE_HUB_TOKEN` is supported as a Pulumi secret or optional `op run`-injected env var, but it is not mandatory for the default install path

### Q28 - How should Graphiti and FalkorDB be provisioned?

- Recommendation: provision them in-module with Docker and keep the existing proxy scripts and service names compatible
- Answer: provision Graphiti/FalkorDB in-module
- Resolution: the installer owns the local Graphiti compose stack and the existing Graphiti proxy user service

### Q29 - Should `1Password` be required for V2T secrets?

- Recommendation: no, keep Pulumi secret config primary and allow `op run` only as operator convenience
- Answer: `1Password` stays optional
- Resolution: V2T does not require OnePassword Connect or Pulumi ESC in V1

### Q30 - Does Graphiti stay secret-free in the local installer?

- Recommendation: no; record the upstream LLM credential requirement explicitly once verified
- Answer: Graphiti requires a secret when enabled
- Resolution: after verifying the upstream Graphiti MCP docs, the spec now treats the Graphiti LLM API key as a required installer secret whenever Graphiti provisioning stays enabled

### Q31 - What Pulumi backend posture should the local installer use?

- Recommendation: local file backend with a passphrase-backed secrets provider
- Answer: local backend
- Resolution: `@beep/infra` scripts now default to `file://<repoRoot>/.pulumi-local/v2t-workstation`

### Q32 - Once the Pulumi workstation project exists in `infra`, how should the canonical spec treat it?

- Recommendation: treat `@beep/infra` as live repo truth, not as planned future implementation
- Answer: use `infra/Pulumi.yaml`, `infra/src/internal/entry.ts`, `infra/src/V2T.ts`, `infra/scripts/v2t-workstation.sh`, `infra/test/V2T.test.ts`, and `infra/package.json` as the authoritative workstation-install and deployment surfaces
- Resolution: updated the docs, prompts, handoffs, manifest, and validator so `@beep/infra` is now a first-class V2T seam alongside `apps/V2T` and `packages/VT2`

## 2026-04-12 Cap-Informed Product Decisions

### Q33 - Should crash-tolerant capture be a first-slice requirement?

- Recommendation: yes; adopt Cap's failure-aware posture and treat chunk or segment durability plus recover or discard flows as part of the first slice
- Answer: yes, first slice
- Resolution: refreshed the research, design, planning, execution, and verification docs so direct capture resilience is a core requirement rather than later hardening

### Q34 - Should V2T require a typed native desktop bridge?

- Recommendation: yes; model Tauri-only commands and events through one typed bridge instead of scattered ad-hoc calls
- Answer: typed bridge now
- Resolution: the canonical spec now treats sidecar lifecycle, dialogs, capture control, recovery actions, and native status events as a typed desktop boundary

### Q35 - What window topology should the first slice use?

- Recommendation: limited multi-window; keep one main workspace and only a few focused native overlays or windows where capture, recovery, or review truly need them
- Answer: limited multi-window
- Resolution: the spec now rejects a single-window-only assumption while also rejecting Cap-style full window sprawl for the first slice

### Q36 - Should desktop settings and workflow defaults persist in the first slice?

- Recommendation: yes; persist capture, composition, and recovery defaults separately from project artifacts
- Answer: yes, include them
- Resolution: the design and planning docs now require a durable desktop preferences seam rather than treating defaults as transient UI state

### Q37 - Who owns direct-capture durability and recovery state?

- Recommendation: the native shell or sidecar should own it, with React observing typed lifecycle state instead of buffering authoritative capture data
- Answer: native or sidecar owned
- Resolution: the spec now places chunk or segment persistence and recovery below the React UI boundary

### Q38 - How strict should first-slice verification be about desktop resilience?

- Recommendation: require failure-path tests for recovery, backpressure, and lifecycle behavior rather than only happy-path flows
- Answer: require failure-path tests
- Resolution: the verification-facing docs now require explicit evidence for non-happy-path desktop behavior when it is part of the implemented slice

### Q39 - How should recording and import relate in the first slice?

- Recommendation: treat them as equal session sources that converge into one downstream pipeline
- Answer: yes, unify them
- Resolution: the spec now treats recorded and imported conversations as first-class entries into the same session and artifact model

### Q40 - How should Cap's contract discipline map onto our repo seams?

- Recommendation: reuse the current seams instead of adding a new top-level V2T contract package
- Answer: reuse current seams
- Resolution: the spec keeps sidecar contracts in `@beep/VT2`, native app-shell contracts in `apps/V2T`, and shared schema work in existing shared packages

### Q41 - How broadly should the Cap findings be applied in the spec?

- Recommendation: perform a cross-phase refresh so research, design, planning, execution, and verification all agree on the new first-slice posture
- Answer: cross-phase refresh
- Resolution: updated the phase artifacts and operator guidance together instead of leaving the Cap findings trapped in P0 notes
