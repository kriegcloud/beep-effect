# P0 Baseline - codex-claude-parity

## Measurement Timestamp
- Measured at: `2026-02-07 08:11:27 UTC`
- Repository: `/home/elpresidank/YeeBois/projects/beep-effect3`

## Component Inventory (Evidence-Based)

| Component | Count | Measurement Basis | Evidence |
|-----------|-------|-------------------|----------|
| `.claude/agents` | 29 files | recursive files | `.claude/agents/**` |
| `.claude/skills` | 60 entries | top-level entries | `.claude/skills/*` |
| `.claude/skills` (structured skills) | 37 files | `SKILL.md` files only | `.claude/skills/**/SKILL.md` |
| `.claude/commands` | 13 files | recursive files | `.claude/commands/**` |
| `.claude/rules` | 5 files | top-level files | `.claude/rules/*.md` |
| `.claude/hooks` | 10 entries | top-level entries | `.claude/hooks/*` |
| `.claude/hooks` (implementation files) | 34 files | recursive files | `.claude/hooks/**` |
| `.claude/patterns` | 91 files | recursive files | `.claude/patterns/**` |
| `.claude/handoffs` | 2 files | recursive files | `.claude/handoffs/**` |
| `.codex` | absent | directory presence check | `.codex/` |

### Count Clarifications
- README baseline values (`agents: 29`, `commands: 13`) match **recursive** file counting, not top-level-only counting.
- `.claude/hooks` baseline uses top-level entry count (`10`), while executable logic volume is materially larger (`34` files).

## Current Strengths in `.claude`

1. Layered guidance stack is explicit and rich.
- Rules: `.claude/rules/general.md`, `.claude/rules/behavioral.md`, `.claude/rules/effect-patterns.md`
- Task workflows: `.claude/commands/new-spec.md`, `.claude/commands/done-feature.md`
- Skill protocols: `.claude/skills/**/SKILL.md`

2. Operational automation exists via hooks.
- Hook wiring in `.claude/settings.json`
- Hook policy in `.claude/hooks/config.yaml`
- Hook implementations in `.claude/hooks/{pattern-detector,skill-suggester,telemetry,self-healing,...}`

3. Agent capability routing is formalized.
- Capability registry in `.claude/agents-manifest.yaml`
- Specialized agent files in `.claude/agents/*.md`

4. Pattern-level enforcement already codified.
- Pattern framework documented in `.claude/README.md`
- Pattern corpus in `.claude/patterns/**`

5. Handoff continuity model exists.
- Skill: `.claude/skills/session-handoff/SKILL.md`
- Supporting handoff directory: `.claude/handoffs/`

## High-Impact Capability Set for Parity (Required)

Required for operational parity in this spec:
1. Instruction parity for code quality, architecture boundaries, and behavior rules.
2. Skill discovery and skill invocation guidance.
3. Command/workflow playbooks for spec lifecycle and delivery lifecycle.
4. Context/handoff workflow (create + resume semantics).
5. Safety guardrails for destructive commands and permission posture.
6. Agent/delegation guidance for specialized task routing.
7. Pattern-based guidance equivalent (or documented adaptation) for pre/post edit safeguards.
8. Verification workflow parity (`check`, `lint`, `test`, `build`) and evidence discipline.

Optional for initial parity acceptance:
1. Full Claude hook runtime replication.
2. Claude plugin-specific features (e.g., TS LSP plugin toggles in `.claude/settings.json`).

## Coupling Points to Track in P1

1. Hook-coupled behavior in `.claude/settings.json` is tightly bound to Claude event names (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `SubagentStop`).
2. Some workflow docs are tool-brand-specific (`.claude/commands/done-feature.md` includes Claude-branded commit/PR boilerplate).
3. Skills are heterogenous: top-level markdown plus folderized `SKILL.md`; direct one-to-one migration is non-trivial.
4. `agents-manifest.yaml` assumes Claude tool taxonomy (`Glob`, `Grep`, `Read`, etc.) and phase metadata conventions.
5. Hooks docs include potentially stale references (e.g., `.claude/hooks/README.md` describes a file-lock enforcer path not present in current `.claude/hooks` top-level inventory), increasing migration ambiguity risk.

## Risks and Unknowns

| Risk | Severity | Impact | Mitigation | Owner | Status |
|------|----------|--------|------------|-------|--------|
| Claude hook event model has no direct Codex equivalent | Critical | Loss of automated pre/post tool guardrails if not adapted | In P1, classify each hook as `adaptation` or `defer` with fallback behavior in docs | P1 Orchestrator | Open |
| Mixed skill formats (dirs + `.md`) complicate parity scoring | High | Inflated/incorrect parity claims | Define canonical skill counting and migration rules in P1 | P1 Orchestrator | Open |
| Stale/legacy docs in hooks package | High | Porting wrong behavior into `.codex` | Validate referenced files exist before mapping decisions | P1 Orchestrator | Open |
| Workflow commands embed Claude-specific language | Medium | Behavioral drift if copied verbatim | Normalize to tool-neutral wording during P2 | P2 Implementer | Open |
| Safety policy split across rules/settings/hooks | Medium | Missed guardrail during migration | Build single source parity checklist in P1 decision log | P1 Orchestrator | Open |

## Open Questions for P1

1. Which hook behaviors are mandatory for parity versus acceptable as documented manual workflows?
2. Should parity be measured against all 60 skill entries or only the 37 structured `SKILL.md` skills?
3. Is `agents-manifest.yaml` a direct-port artifact or an adaptation into Codex-native delegation guidance?
4. What is the acceptance threshold for hook/runtime parity given Codex toolchain differences?
5. Which symlink candidates are safe for shared docs versus risky due to tool-specific syntax/semantics?

## P0 Exit Check
- [x] Both P0 outputs created and complete
- [x] Required capability set explicitly defined
- [x] Open questions for P1 documented
- [x] New P1 handoff pair created/updated
