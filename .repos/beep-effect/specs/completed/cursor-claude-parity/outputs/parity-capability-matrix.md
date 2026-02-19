# Parity Capability Matrix (P0)

Cursor vs .claude/.codex capability baseline. Strategy labels are preliminary; P1 will assign final classifications and rationale.

---

| Capability Domain | Source Artifact(s) | Current Behavior Summary | Cursor Current State | Required Parity Level | Cursor Target Strategy | Risks / Notes |
|-------------------|--------------------|--------------------------|----------------------|------------------------|------------------------|---------------|
| **Instruction: core guardrails** | `.claude/rules/general.md` | No `any`, schema validation, architecture boundaries, command reference | `.cursor/rules/general.mdc` — synced | required | direct-port | Already synced; maintain via sync-cursor-rules |
| **Instruction: behavioral** | `.claude/rules/behavioral.md` | Critical-analysis posture, workflow discipline, no reflexive agreement | `.cursor/rules/behavioral.mdc` — synced | required | direct-port | Wording parity important for review quality |
| **Instruction: Effect conventions** | `.claude/rules/effect-patterns.md` | Import aliases, schema usage, forbidden native patterns | `.cursor/rules/effect-patterns.mdc` — synced | required | direct-port | Large file; ensure full sync and no truncation |
| **Instruction: code standards** | `.claude/rules/code-standards.md` | Style, Effect preferences, UI/docs philosophy | `.cursor/rules/code-standards.mdc` — synced | required | direct-port | Already synced |
| **Instruction: meta-thinking** | `.claude/rules/meta-thinking.md` | Effect algebra, uncertainty handling, quality gates, commands | `.cursor/rules/meta-thinking.mdc` — synced | required | direct-port | Already synced |
| **Skill catalog (structured)** | `.claude/skills/**/SKILL.md` (37 dirs) | Reusable workflows, trigger semantics, procedural steps | 2 skills only (auth); no port of .claude skill set | required | adaptation | Cursor uses SKILL.md in dirs; map intent + high-value skills; prioritize from RUBRICS |
| **Skill catalog (flat .md)** | `.claude/skills/*.md` (e.g. effect-atom.md, forbidden-patterns.md) | Additional guidance not in SKILL.md structure | None | optional | investigate | Decide: absorb into rules/docs or skip |
| **Command: spec lifecycle** | `.claude/commands/new-spec.md`, `.codex/workflows/new-spec.md` | Complexity scoring, scaffolding, handoff standards | Not mapped | required | adaptation | References agents; needs Cursor-oriented flow (rules/skill/doc) |
| **Command: completion lifecycle** | `.claude/commands/done-feature.md`, `.codex/workflows/done-feature.md` | Final validation, git/PR workflow | Not mapped | required | adaptation | May need neutralized templates |
| **Command: debug/explore/write-test** | `.claude/commands/debug.md`, `explore.md`, `write-test.md`; `.codex/workflows/` equivalents | Task-specific repeatable flows | Not mapped | required | investigate | Confirm Cursor mechanism (rule vs skill vs doc) and usage |
| **Command: modules/context** | `.claude/commands/module.md`, `modules.md`, `add-context.md`, etc. | Context discovery and module search | Not mapped | optional | investigate | Lower priority unless used in critical path |
| **Agent delegation registry** | `.claude/agents-manifest.yaml`, `.claude/agents/*.md` (29); `.codex/agents/` | Capability-tagged delegation, tiering | None | required | adaptation | Cursor may not have 1:1 agent model; map to rules/skills or doc |
| **Workflow: session handoff** | `.claude/skills/` handoff patterns, `.codex/workflows/session-handoff.md` | Create/resume handoff, quality checks | None | required | adaptation | Flow portable; paths and triggers need Cursor mapping |
| **Workflow: spec orchestration** | `MASTER_ORCHESTRATION.md`, `.claude/commands/new-spec.md` | Phase gates, evidence, dual handoff | Spec exists; Cursor execution not codified | required | direct-port | Largely tool-agnostic; document entry in .cursor or AGENTS.md |
| **Context discoverability** | `README.md`, `AGENTS.md`, `documentation/*`, `.claude/onboarding/`, `.codex/context-index.md` | Fast discovery of architecture, patterns, commands | AGENTS.md references Cursor; no .cursor index | required | direct-port | Ensure links and paths valid; consider .cursor README or index |
| **Pattern library (code-smells / dangerous)** | `.claude/patterns/**`, `.codex/patterns/**` | Code-smells and dangerous-commands patterns | None in .cursor | optional | investigate | May be embedded in rules/skills or separate doc |
| **Hook orchestration** | `.claude/settings.json`, `.claude/hooks/*` | Event-driven hooks (startup, prompt, telemetry) | Not applicable / unknown | optional | investigate | Cursor hook lifecycle unknown; do not block parity |
| **Self-healing / skill-suggester** | `.claude/hooks/self-healing/*`, `skill-suggester/*` | Auto-fixes and prompt-time skill suggestions | None | optional | investigate | High behavior risk; optional unless Cursor supports equivalent |
| **Safety permissions** | `.claude/settings.json` (permissions), `.codex/safety/permissions.md` | Allow/deny defaults for command safety | Cursor-specific mechanism TBD | required | adaptation | Need Cursor-equivalent without losing critical denies |
| **Verification (scenario suite)** | `RUBRICS.md`, P3 scenario template in MASTER_ORCHESTRATION | Repeatable scenario-based parity checks | Not yet run for Cursor | required | direct-port | Define and run in P3; evidence in P3_VALIDATION_REPORT |

---

## Notes

- **Strategy legend:** `direct-port` = reuse as-is or via existing sync; `adaptation` = same intent, Cursor-specific form; `investigate` = confirm mechanism and priority in P1.
- P1 must convert every **required** row into an explicit implementation classification (`direct-port` | `adaptation` | `unsupported` | `defer`) and record rationale in `outputs/parity-decision-log.md`.
- **Required capability set:** All rows with “required” must have a decided strategy and no unresolved critical blockers before P2 implementation.
