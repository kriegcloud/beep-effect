# P1 Gap Analysis - codex-claude-parity

## Metadata
- Timestamp: `2026-02-07 UTC`
- Phase: `P1 - Gap Analysis`
- Scope: Required capabilities from `specs/codex-claude-parity/outputs/parity-capability-matrix.md`
- Implementation constraint: No `.codex/` changes in P1

## Evidence Baseline Used
1. Hook runtime is Claude-event coupled in `.claude/settings.json` with `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, and `SubagentStop`.
2. Hook package is non-trivial (`34` recursive files) and has stale docs: `.claude/hooks/README.md` references `file-lock-enforcer.*` files that are absent.
3. Skill denominator ambiguity is real: `.claude/skills` has `60` top-level entries, but only `37` structured `SKILL.md` artifacts.
4. Agent manifest is Claude tool-taxonomy coupled (`Glob`, `Grep`, `Read`, `Write`, `Edit`, `Bash`) in `.claude/agents-manifest.yaml`.
5. Completion workflow contains Claude-branded commit trailer text in `.claude/commands/done-feature.md`.

## Required Capability Decisions

| Capability | Source Artifact(s) | Codex Target Implementation Path | Classification | Rationale | Primary Risk | Mitigation | Symlink vs Copy |
|------------|--------------------|----------------------------------|----------------|-----------|--------------|------------|-----------------|
| Core instruction guardrails | `.claude/rules/general.md` | `AGENTS.md` + `.codex/rules/general.md` | direct-port | Rules are mostly tool-agnostic and already partially mirrored in current `AGENTS.md`. | Drift between root and `.codex` copies | Define `AGENTS.md` as canonical execution surface; keep `.codex/rules/general.md` as synced reference with checksum note in P2 report. | Symlink acceptable on POSIX; copy fallback required for non-symlink environments. |
| Behavioral analysis posture | `.claude/rules/behavioral.md` | `AGENTS.md` + `.codex/rules/behavioral.md` | direct-port | Behavioral policy is instruction text, not runtime-coupled. | Subtle wording regression reducing review quality | Preserve examples and prohibition semantics; validate with P3 review scenario S3. | Symlink acceptable; copy fallback acceptable. |
| Effect coding conventions | `.claude/rules/effect-patterns.md` | `.codex/rules/effect-patterns.md` + link from `AGENTS.md` | direct-port | Content is repo-specific coding doctrine, not Claude-event dependent. | Partial port due file size | Port as full file, not excerpt; diff-check source/target hash in P2. | Symlink preferred if readable by Codex context loader; copy fallback acceptable. |
| Skill catalog (structured) | `.claude/skills/**/SKILL.md` | `.codex/skills/` mapping index + selected portable skill ports | adaptation | Codex and Claude skill-loading mechanics differ; one-to-one runtime parity is not proven. | False parity claims from denominator mismatch | Set canonical denominator to `37` structured `SKILL.md` files; treat other `14` flat markdown files as auxiliary docs. | Copy preferred; symlink only for clearly tool-agnostic skills after path-token audit. |
| Command playbooks: spec lifecycle | `.claude/commands/new-spec.md` | `.codex/workflows/new-spec.md` | adaptation | Playbook content is reusable, but references Claude agent names and slash-command assumptions. | Invalid agent references in Codex runs | Replace agent names with Codex-equivalent role labels and explicit manual routing rules. | Copy preferred due token rewrites; symlink not acceptable. |
| Command playbooks: completion lifecycle | `.claude/commands/done-feature.md` | `.codex/workflows/done-feature.md` | adaptation | Validation sequence is portable; commit/PR template includes Claude branding that must be removed. | Inappropriate metadata in commits/PR notes | Strip tool branding; keep command-level validation checklist unchanged. | Copy required; symlink not acceptable. |
| Command playbooks: review/debug/explore | `.claude/commands/debug.md`, `.claude/commands/explore.md`, `.claude/commands/write-test.md` | `.codex/workflows/debug.md`, `.codex/workflows/explore.md`, `.codex/workflows/write-test.md` | adaptation | Intent is reusable; multi-agent orchestration syntax is Claude-specific and needs translation to Codex process steps. | Over-promising parallel agent behavior | Convert to workflow contracts (inputs, outputs, evidence) without assuming unavailable orchestration primitives. | Copy required; symlink not acceptable. |
| Agent delegation registry | `.claude/agents-manifest.yaml`, `.claude/agents/*.md` | `.codex/agents/manifest.md` + `.codex/agents/profiles/` | adaptation | Existing manifest schema is tied to Claude tool names and phase metadata conventions. | Ported manifest looks valid but is non-executable in Codex | Convert to capability matrix with tool-agnostic verbs (`read`, `edit`, `execute`, `research`). | Copy required; symlink not acceptable. |
| Hook orchestration wiring | `.claude/settings.json` | `.codex/runtime/hook-parity.md` | defer | No evidence in-repo that Codex supports equivalent user-defined lifecycle hooks. Direct port would be speculative. | Missing automated pre/post tool guardrails | Document manual fallback procedures for each required hook outcome; owner assigned for runtime feasibility check before P3. | Symlink not applicable; documentation copy only. |
| Pattern detector framework | `.claude/README.md`, `.claude/hooks/pattern-detector/*`, `.claude/patterns/**` | `.codex/patterns/` (rule corpus) + `.codex/workflows/pattern-check.md` | adaptation | Pattern corpus is reusable, but runtime hook invocation is not guaranteed. | Silent loss of ask/deny protections | Recast ask/deny patterns into pre-execution checklist + explicit forbidden command rules in `AGENTS.md`. | Patterns may be symlinked only if frontmatter schema remains identical; otherwise copy with schema normalization. |
| Context handoff workflow | `.claude/skills/session-handoff/SKILL.md`, `.claude/handoffs/*` | `.codex/workflows/session-handoff.md` + `specs/*/handoffs/*` references | adaptation | Handoff protocol is portable, but script paths point to `.claude` tree and must be remapped. | Broken resume flow due stale script paths | Replace script references with repo-relative, tool-neutral steps and required handoff pair checklist. | Copy required for workflow doc; existing `specs/.../handoffs` remain source-of-truth. |
| Spec orchestration framework | `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`, `.claude/commands/new-spec.md` | `.codex/workflows/spec-orchestration.md` (primarily from master orchestration) | direct-port | Master orchestration is already tool-neutral with explicit phase gates. | Duplicate truth across docs | Mark `MASTER_ORCHESTRATION.md` canonical; `.codex` file is thin pointer + condensed checklist. | Symlink acceptable for canonical spec docs; copy fallback acceptable. |
| Safety permissions baseline | `.claude/settings.json` permissions | `AGENTS.md` + `.codex/safety/permissions.md` | adaptation | Claude allow/deny DSL cannot be assumed in Codex runtime. Safety intent is portable as policy text. | Safety regressions if deny rules are dropped | Translate denies into explicit prohibited-command policy and review checklist evidence in P3 S2/S3. | Copy required; symlink not useful for DSL translation. |
| Context discoverability docs | `README.md`, `documentation/*`, `.claude/skills/onboarding/*` | `AGENTS.md` + `.codex/README.md` + `.codex/context-index.md` | direct-port | These are navigation docs and links; largely runtime-agnostic. | Link rot after path remap | Add link-check section in P2 report and P3 scenario evidence. | Symlink acceptable for stable docs; copy fallback acceptable where paths differ. |

## Resolutions for P0 Hotspots

1. Hook parity uncertainty
- Resolution: `Hook orchestration wiring` is classified `defer`; `Pattern detector framework` is classified `adaptation` with manual fallback.
- Reason: Event wiring is runtime-specific; pattern content itself is still reusable.

2. Skill denominator ambiguity (`60` vs `37`)
- Resolution: Use `37` structured `SKILL.md` files as parity denominator for required capability scoring.
- Handling of remaining `14` top-level markdown items: treat as auxiliary guidance to map under context/workflow docs, not as first-class skills.

3. Agent manifest portability
- Resolution: classify as `adaptation` and convert from YAML runtime manifest to tool-agnostic delegation matrix docs.

## P2 Prerequisites (Explicit Gate)

1. Canonical structure decisions
- Confirm `.codex/` target tree before first file write:
  - `.codex/rules/`
  - `.codex/workflows/`
  - `.codex/skills/`
  - `.codex/agents/`
  - `.codex/safety/`
  - `.codex/patterns/`
  - `.codex/runtime/`

2. Symlink portability criteria (must all pass before symlink use)
- Environment can create and commit symlinks (`ln -s` works and `git status` preserves link mode).
- Consumer tooling resolves symlinked markdown content correctly in both CLI and IDE context loading.
- File does not require token/path rewrites (`.claude`, Claude event names, or Claude-specific metadata).
- Windows/non-POSIX fallback behavior is documented in `outputs/P2_IMPLEMENTATION_REPORT.md`.

3. Copy fallback policy
- If any criterion fails, use copy and record:
  - source path
  - target path
  - reason symlink was rejected
  - drift-control method (checksum note or review cadence)

4. Deferred capability owner + fallback
- Capability: Hook orchestration wiring
- Owner: P2 Implementer (feasibility probe) and Spec Maintainer (acceptance decision)
- Fallback behavior: Manual pre/post execution checklist documented in `.codex/runtime/hook-parity.md`
- Deadline: Before closing P2 and before any P3 parity claim

## Residual Risks

| Risk | Severity | Impact | Mitigation | Owner | Status |
|------|----------|--------|------------|-------|--------|
| Hook runtime has no Codex lifecycle equivalent | Critical | Cannot claim automated hook parity | Keep `defer`, enforce manual fallback validation in P3 S5 | P2 Implementer + Spec Maintainer | Open |
| Skill parity over-count due mixed formats | High | Inflated parity score | Fix denominator at 37 structured skills in scorecard | P3 Validator | Open |
| Stale hook docs propagated | High | Incorrect implementation assumptions | Treat `.claude/hooks/README.md` as non-authoritative unless file existence verified | P2 Implementer | Open |
| Command docs keep Claude-specific branding | Medium | Workflow confusion | Mandatory normalization pass for `.codex/workflows/*` in P2 | P2 Implementer | Open |

## P1 Exit Check
- [x] Every `required` capability classified
- [x] All non-direct mappings include rationale and mitigation
- [x] P2 prerequisites explicit, including symlink portability criteria
- [x] `outputs/parity-decision-log.md` prepared for audit
- [x] P2 handoff pair updated
