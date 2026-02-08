# Parity Decision Log (P1)

## Metadata
- Timestamp: `2026-02-07 UTC`
- Phase: `P1 - Gap Analysis`
- Audit scope: All `required` capabilities from `outputs/parity-capability-matrix.md`

| Capability | Classification | Decision | Rationale | Risk | Follow-up |
|------------|----------------|----------|-----------|------|-----------|
| Core instruction guardrails | direct-port | Port `.claude/rules/general.md` into `AGENTS.md` + `.codex/rules/general.md` | Rules are tool-agnostic and already partially mirrored in root `AGENTS.md` | Dual-source drift | Define canonical source and record checksum comparison in P2 report |
| Behavioral analysis posture | direct-port | Port `.claude/rules/behavioral.md` semantics to `AGENTS.md` + `.codex/rules/behavioral.md` | Behavioral model is textual policy, not runtime hook logic | Tone drift can degrade review quality | Preserve examples and validate in P3 review scenario |
| Effect coding conventions | direct-port | Full-file port to `.codex/rules/effect-patterns.md` | Effect conventions are repository standards, independent of Claude runtime | Partial extraction risk due file size | Require complete-file parity check in P2 |
| Skill catalog (structured) | adaptation | Use 37 `SKILL.md` files as canonical parity set; map to `.codex/skills/` index and selective ports | Mixed formats (`60` entries vs `37` structured skills) require normalization | Misstated parity coverage | Publish denominator rule in P2 report and P3 scorecard |
| Command playbooks: spec lifecycle | adaptation | Rewrite `.claude/commands/new-spec.md` into `.codex/workflows/new-spec.md` | Workflow is reusable but agent naming and slash-command semantics are Claude-specific | Unusable copied instructions | Replace tool-specific invocation with Codex workflow steps |
| Command playbooks: completion lifecycle | adaptation | Rewrite `.claude/commands/done-feature.md` into `.codex/workflows/done-feature.md` | Validation commands are portable; Claude-branded commit text is not | Contaminated commit/PR templates | Remove tool branding and retain verification checklist |
| Command playbooks: review/debug/explore | adaptation | Convert `debug/explore/write-test` into Codex workflow contracts in `.codex/workflows/` | Existing docs assume Claude multi-agent orchestration syntax | False assumptions about orchestration primitives | Express required outcomes/evidence, not runtime-specific spawn commands |
| Agent delegation registry | adaptation | Transform `.claude/agents-manifest.yaml` + `.claude/agents/*.md` into docs at `.codex/agents/` | YAML schema is Claude-tool-taxonomy-coupled | Non-executable manifest copied as-is | Convert tools to capability verbs and phase suitability matrix |
| Hook orchestration wiring | defer | Do not port `.claude/settings.json` hook wiring yet; create `.codex/runtime/hook-parity.md` fallback contract | No verified Codex lifecycle hook equivalent in repo evidence | Loss of automated safeguards | P2 feasibility probe + manual checklist fallback; owner: P2 Implementer + Spec Maintainer |
| Pattern detector framework | adaptation | Reuse pattern corpus under `.codex/patterns/`; enforce behavior via workflow checks and safety docs | Pattern content is portable; runtime invocation model is not guaranteed | Ask/deny enforcement may weaken | Encode deny rules in safety policy and pre-execution checklist |
| Context handoff workflow | adaptation | Translate `.claude/skills/session-handoff/SKILL.md` to `.codex/workflows/session-handoff.md` with repo-native paths | Process is portable but script paths are `.claude`-bound | Broken resume/start instructions | Replace scripts with path-neutral checklist and required handoff-pair rule |
| Spec orchestration framework | direct-port | Preserve `MASTER_ORCHESTRATION.md` as canonical and reference from `.codex/workflows/spec-orchestration.md` | Existing framework is already tool-neutral and phase-gated | Duplicate-doc inconsistency | Use pointer-style `.codex` doc to reduce duplication |
| Safety permissions baseline | adaptation | Translate `.claude/settings.json` allow/deny intent into `AGENTS.md` + `.codex/safety/permissions.md` | Permission DSL is Claude-specific | Safety regression if deny intent is dropped | Add explicit prohibited commands and P3 evidence checks |
| Context discoverability docs | direct-port | Mirror/discoverability index in `.codex/README.md` + `.codex/context-index.md` and retain `AGENTS.md` links | Navigation docs are mostly runtime-agnostic | Link rot | Add link audit checklist during P2 and validate in P3 |

## Symlink Portability Decisions

| Artifact Class | Default | Allowed as Symlink? | Condition |
|----------------|---------|---------------------|-----------|
| Tool-agnostic static docs (`rules`, orchestration docs) | symlink-first | Yes | No token/path rewrites required and link resolution verified |
| Workflow docs requiring wording/tool rewrites | copy-first | No | Any Claude-specific syntax or path requires content adaptation |
| Runtime/hook policy docs | copy-first | No | Defer/adaptation area; needs explicit Codex-specific text |
| Skill files | copy-first | Conditional | Only if skill has zero Claude-path or tool-taxonomy coupling |

## Defer/Unsupported Ownership

| Capability | Status | Owner | Fallback Behavior | Closure Condition |
|------------|--------|-------|-------------------|------------------|
| Hook orchestration wiring | defer | P2 Implementer + Spec Maintainer | Manual pre/post execution checklist documented in `.codex/runtime/hook-parity.md` | Feasibility verdict recorded before P2 exit |

