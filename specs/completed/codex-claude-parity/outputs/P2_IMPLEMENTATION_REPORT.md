# P2 Implementation Report - codex-claude-parity

## Metadata
- Timestamp: `2026-02-07 UTC`
- Phase: `P2 - Codex Config Implementation`
- Inputs:
  - `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`
  - `specs/codex-claude-parity/outputs/parity-decision-log.md`
  - `specs/codex-claude-parity/handoffs/HANDOFF_P2.md`
  - `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`

## Deliverables Produced

1. `.codex/**` implementation
2. `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`
3. P3 handoff pair refresh:
   - `specs/codex-claude-parity/handoffs/HANDOFF_P3.md`
   - `specs/codex-claude-parity/handoffs/P3_ORCHESTRATOR_PROMPT.md`

## Implemented Structure

Created directories:
- `.codex/rules/`
- `.codex/workflows/`
- `.codex/skills/`
- `.codex/agents/`
- `.codex/safety/`
- `.codex/patterns/`
- `.codex/runtime/`

Structure evidence:
- `find .codex -type d | wc -l` => `12`
- `find .codex -type f | wc -l` => `74`
- `find .codex -type l | wc -l` => `0`

## Capability Implementation Ledger

| Capability | P1 Classification | Target | Implementation | Evidence |
|------------|-------------------|--------|----------------|----------|
| Core instruction guardrails | direct-port | `AGENTS.md` + `.codex/rules/general.md` | Implemented. Added Codex parity links in `AGENTS.md`; direct copied rules file. | `AGENTS.md`; `.codex/rules/general.md` |
| Behavioral analysis posture | direct-port | `AGENTS.md` + `.codex/rules/behavioral.md` | Implemented. Root behavioral reminder already present; direct copied rule file. | `AGENTS.md`; `.codex/rules/behavioral.md` |
| Effect coding conventions | direct-port | `.codex/rules/effect-patterns.md` | Implemented as full-file copy with checksum parity. | `.codex/rules/effect-patterns.md` |
| Skill catalog (structured) | adaptation | `.codex/skills/` | Implemented denominator policy (`37`), full index, and selected portable ports (`3` skills). | `.codex/skills/README.md`; `.codex/skills/skill-index.md`; `.codex/skills/ports/*.md` |
| Command playbook: spec lifecycle | adaptation | `.codex/workflows/new-spec.md` | Implemented with Codex workflow contract and evidence requirements; removed Claude command assumptions. | `.codex/workflows/new-spec.md` |
| Command playbook: completion lifecycle | adaptation | `.codex/workflows/done-feature.md` | Implemented with branding-neutral completion workflow and verification sequence. | `.codex/workflows/done-feature.md` |
| Command playbooks: review/debug/explore | adaptation | `.codex/workflows/{debug,explore,write-test}.md` | Implemented as outcome-driven workflow contracts without runtime spawn assumptions. | `.codex/workflows/debug.md`; `.codex/workflows/explore.md`; `.codex/workflows/write-test.md` |
| Agent delegation registry | adaptation | `.codex/agents/manifest.md` + profiles | Implemented as tool-agnostic verb matrix + phase profiles. | `.codex/agents/manifest.md`; `.codex/agents/profiles/*.md` |
| Hook orchestration wiring | defer | `.codex/runtime/hook-parity.md` | Deferred preserved. Added explicit owner/status and manual fallback procedures. | `.codex/runtime/hook-parity.md` |
| Pattern detector framework | adaptation | `.codex/patterns/` + `.codex/workflows/pattern-check.md` | Implemented pattern corpus copy (`30` code-smells, `15` dangerous-commands) and manual check workflow. | `.codex/patterns/**`; `.codex/workflows/pattern-check.md` |
| Context handoff workflow | adaptation | `.codex/workflows/session-handoff.md` | Implemented `.claude`-script-neutral handoff procedure with required handoff-pair rule. | `.codex/workflows/session-handoff.md` |
| Spec orchestration framework | direct-port | `.codex/workflows/spec-orchestration.md` | Implemented as thin pointer to canonical orchestration doc + condensed checklist. | `.codex/workflows/spec-orchestration.md` |
| Safety permissions baseline | adaptation | `.codex/safety/permissions.md` (+ AGENTS cross-link) | Implemented policy translation from Claude permission DSL to explicit Codex safety policy. | `.codex/safety/permissions.md`; `AGENTS.md` |
| Context discoverability docs | direct-port | `.codex/README.md` + `.codex/context-index.md` | Implemented discoverability surfaces and canonical reference paths. | `.codex/README.md`; `.codex/context-index.md` |

## Non-Direct Implementations (Drift + Mitigation)

| Artifact | Type | Drift Introduced | Mitigation |
|----------|------|------------------|------------|
| `.codex/workflows/new-spec.md` | adaptation | Replaced Claude slash-command and agent references with Codex-neutral steps. | Explicit input/output/evidence contract. |
| `.codex/workflows/done-feature.md` | adaptation | Removed Claude commit trailer branding and rigid PR text. | Kept verification sequence and evidence requirement. |
| `.codex/workflows/debug.md` | adaptation | Removed hard dependency on parallel agent spawn primitive. | Preserved parallel-track diagnostic contract and consensus reporting. |
| `.codex/workflows/explore.md` | adaptation | Removed Claude XML pseudo-runtime semantics. | Preserved track decomposition + synthesis protocol. |
| `.codex/workflows/write-test.md` | adaptation | Converted agent identity doc into workflow contract. | Kept repo-required testing patterns. |
| `.codex/agents/manifest.md` | adaptation | Converted YAML/tool taxonomy to capability verbs. | Added phase matrix and role usage rules. |
| `.codex/safety/permissions.md` | adaptation | Replaced Claude permission DSL with policy prose. | Added explicit deny list and manual enforcement checklist. |
| `.codex/runtime/hook-parity.md` | defer | No automated runtime hook parity claim. | Explicit owner/status, manual fallback, closure condition. |
| `.codex/workflows/session-handoff.md` | adaptation | Removed `.claude` script coupling. | Required pair checklist and path-neutral steps. |

## Symlink Policy Application

### Portability Criteria Outcome

| Criterion | Result | Evidence | Decision |
|----------|--------|----------|----------|
| Symlink creation works | PASS | `ln -s` succeeded in initial implementation (later replaced). | Not sufficient alone |
| Git mode preservation verifiable in-session | FAIL | `git add ...` for symlink proof was blocked by policy in this environment. | Reject symlink |
| Consumer tooling resolves links | PASS | Both shell and IDE tooling resolved initial link targets. | Not sufficient due failed criterion above |
| No token/path rewrites needed | PASS (rules files) | direct-port candidates were rewrite-free | Eligible only if all criteria pass |

### Final Decision

Symlink usage rejected for this phase because the full portability criteria set did not pass in-session. Implemented copy fallback for all direct-port rule files.

Copy fallback records:

| Source | Target | Reason Symlink Rejected | Drift-Control Method |
|--------|--------|--------------------------|----------------------|
| `.claude/rules/general.md` | `.codex/rules/general.md` | Could not verify git link-mode preservation due command policy block | SHA256 parity + `cmp` equality |
| `.claude/rules/behavioral.md` | `.codex/rules/behavioral.md` | Same as above | SHA256 parity + `cmp` equality |
| `.claude/rules/effect-patterns.md` | `.codex/rules/effect-patterns.md` | Same as above | SHA256 parity + `cmp` equality |

Checksum evidence:
- `general.md`: `b8beb42ad2e725443f3dc2203d5c9bed1f309bdaae3f2d6c918856f3d72c1af2` (source=target)
- `behavioral.md`: `e4245f8eb244a6ab0bc9613b8a0ccf77f12d41ab5c2ee32a47bf2ad18a452118` (source=target)
- `effect-patterns.md`: `9fdf88d0802bf7a06ef5c8e124135eb3c7f5c627f603c70c28fedb41056962ae` (source=target)

## Skill Denominator Evidence

Command evidence:
- `find .claude/skills -mindepth 1 -maxdepth 1 | wc -l` => `60`
- `rg --files .claude/skills | rg 'SKILL\.md$' | wc -l` => `37`

Implemented policy:
- `.codex/skills/README.md` enforces denominator = `37` structured skills.

## Hook Defer Evidence

Deferred item remains open and explicit:
- `.codex/runtime/hook-parity.md` includes status `defer`
- Owner: P2 Implementer + Spec Maintainer acceptance gate
- Manual fallback steps documented for pre/post execution and session boundaries

## Consistency Checks

- Adapted docs retain source provenance markers (`Adapted from ...`) and remove runtime-specific execution assumptions.
- No `.claude/` source assets were modified.

## P2 Exit Checklist

- [x] `.codex` structure and required files created/updated
- [x] Required capabilities implemented per approved P1 decisions
- [x] Deferred hook capability has explicit fallback docs and owner/status
- [x] Symlink/copy decisions include portability rationale
- [x] `outputs/P2_IMPLEMENTATION_REPORT.md` complete and auditable
- [x] P3 handoff pair created/updated

## Open Risks for P3

| Risk | Severity | Owner | Status |
|------|----------|-------|--------|
| Automated hook parity remains unproven in Codex runtime | Critical | Spec Maintainer | Open |
| Copy-based direct ports may drift if source `.claude/rules/*` change | Medium | P3 Validator | Open |
