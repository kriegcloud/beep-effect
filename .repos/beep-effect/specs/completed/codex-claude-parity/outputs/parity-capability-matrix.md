# Parity Capability Matrix (P0)

| Capability Domain | Source Artifact(s) | Current Behavior Summary | Required Parity Level | Codex Target Strategy | Risks / Notes |
|-------------------|--------------------|---------------------------|-----------------------|-----------------------|---------------|
| Core instruction guardrails | `.claude/rules/general.md` | Enforces no `any`, schema validation, architecture boundaries, command conventions | required | direct-port | Must preserve repository-specific constraints verbatim where compatible |
| Behavioral analysis posture | `.claude/rules/behavioral.md` | Enforces critical-analysis response behavior and workflow discipline | required | direct-port | Needs careful wording parity to avoid regression in review quality |
| Effect coding conventions | `.claude/rules/effect-patterns.md` | Defines Effect import aliases, schema usage, forbidden native patterns | required | direct-port | Large file; risk of partial port if split badly |
| Skill catalog (structured) | `.claude/skills/**/SKILL.md` | Reusable workflows with trigger semantics and procedural steps | required | adaptation | Codex skill format differs; map intent + trigger coverage first |
| Skill catalog (flat markdown entries) | `.claude/skills/*.md` | Additional guidance not always in `SKILL.md` structure | optional | investigate | Need decision whether to absorb into instruction docs or ignore |
| Command playbooks: spec lifecycle | `.claude/commands/new-spec.md` | Defines complexity scoring, scaffolding flow, handoff standards | required | adaptation | References Claude agents; requires Codex-oriented orchestration mapping |
| Command playbooks: completion lifecycle | `.claude/commands/done-feature.md` | Defines final validation and git/PR workflow template | required | adaptation | Contains Claude-branded PR/commit templates; needs neutralization |
| Command playbooks: review/debug/explore | `.claude/commands/debug.md`, `.claude/commands/explore.md`, `.claude/commands/write-test.md` | Task-specific repeatable flows | required | investigate | Need usage frequency assessment before direct migration |
| Agent delegation registry | `.claude/agents-manifest.yaml`, `.claude/agents/*.md` | Capability-tagged task delegation model and tiering | required | adaptation | Tool taxonomy tied to Claude naming; needs Codex equivalent mapping |
| Hook orchestration wiring | `.claude/settings.json` | Event-driven command hooks for startup, prompt submit, pre/post tool use, telemetry stop | required | adaptation | Codex may not support equivalent hook lifecycle events |
| Pattern detector framework | `.claude/README.md`, `.claude/hooks/pattern-detector/*`, `.claude/patterns/**` | Pattern-based pre/post suggestions, ask/deny logic, and code-smell signaling | required | adaptation | High-complexity area with largest runtime-behavior gap risk |
| Self-healing policy | `.claude/hooks/config.yaml`, `.claude/hooks/self-healing/*` | Auto-safe fixes + suggestion-only fixes controlled by config | optional | investigate | Must avoid behavior-changing auto-fixes without confidence |
| Skill suggestion automation | `.claude/hooks/skill-suggester/*` | Prompt-time skill recommendation | optional | adaptation | Can likely be approximated by instruction-level heuristics |
| Telemetry automation | `.claude/hooks/telemetry/*` | Start/stop telemetry hooks around task/subagent execution | optional | investigate | Depends on runtime hook support and telemetry endpoints |
| Context handoff workflow | `.claude/skills/session-handoff/SKILL.md`, `.claude/handoffs/*` | Standardized create/resume handoff scripts and quality checks | required | adaptation | Script paths are Claude-directory-specific; flow still portable |
| Spec orchestration framework | `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`, `.claude/commands/new-spec.md` | Phase gates, evidence requirements, dual-handoff discipline | required | direct-port | Already tool-agnostic in many sections; low migration risk |
| Safety permissions baseline | `.claude/settings.json` (`permissions.allow` / `permissions.deny`) | Default allowlist/denylist for command safety | required | adaptation | Need Codex-compatible equivalent without losing critical denies |
| Context discoverability docs | `README.md`, `documentation/*`, `.claude/skills/onboarding/*` | Fast discovery of architecture, patterns, and commands | required | direct-port | Ensure link integrity if paths change under `.codex` |

## Notes
- Strategy labels in P0 are intentionally preliminary: `direct-port`, `adaptation`, `investigate`.
- P1 must convert all `required` rows into explicit implementation classifications and mitigations.
