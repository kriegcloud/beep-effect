# P0 Baseline: cursor-claude-parity

Evidence-backed baseline for `.cursor` capability parity planning.

---

## Measurement Timestamp

- **Date**: 2026-02-07
- **Phase**: P0 Discovery Baseline
- **Source**: Direct filesystem inventory of `.claude`, `.codex`, `.cursor`

---

## Component Inventory

### .claude

| Component | Count | Notes |
|-----------|-------|--------|
| **rules/** | 5 files | `behavioral.md`, `code-standards.md`, `effect-patterns.md`, `general.md`, `meta-thinking.md` |
| **skills/** | 37 structured (SKILL.md in dir) + 14+ flat .md | Structured: e.g. `ai-context-writer/`, `domain-modeling/`, `effect-ai-*`, `layer-design/`, `onboarding/`, `spec-driven-development/`, etc. Flat: `effect-atom.md`, `forbidden-patterns.md`, etc. |
| **commands/** | 13 items | 12 top-level .md (`add-context`, `debug`, `done-feature`, `explore`, `module-search`, `module`, `modules`, `new-feature`, `new-spec`, `port`, `refine-prompt`, `write-test`) + `patterns/effect-testing-patterns.md` |
| **agents/** | 29 .md files | Root agents (e.g. `code-reviewer`, `doc-writer`, `effect-expert`, `reflector`) + `shared/mcp-enablement.md`, `templates/agents-md-template.md`; `agents-manifest.yaml` at repo root |
| **hooks/** | 6 hook subsystems + config | `agent-init/`, `pattern-detector/`, `self-healing/`, `skill-suggester/`, `subagent-init/`, `telemetry/`; `config.yaml`, `README.md`, `QUICKSTART.md` |
| **onboarding/** | 5 files | `README.md`, `common-tasks.md`, `effect-primer.md`, `first-contribution.md`, `verification-checklist.md` |
| **patterns/** | 9+ items | Code-smells and dangerous-commands (with .md + .test.ts); `schema.ts`, etc. |
| **Other** | standards, prompts, scripts, templates, test | Single files or small sets |

**Total .claude files (from glob):** 255+ under `.claude/`.

---

### .codex

| Component | Count | Notes |
|-----------|-------|--------|
| **rules/** | 3 files | `behavioral.md`, `effect-patterns.md`, `general.md` (symlinked/copied from .claude) |
| **workflows/** | 8 files | `debug.md`, `done-feature.md`, `explore.md`, `new-spec.md`, `pattern-check.md`, `session-handoff.md`, `spec-orchestration.md`, `write-test.md` |
| **skills/** | 3 ported skills + index | `skills/`: `domain-modeling/SKILL.md`, `layer-design/SKILL.md`, `schema-composition/SKILL.md`; `skill-index.md`, `README.md` |
| **patterns/** | 2 dirs + README/schema | `code-smells/` (27 .md), `dangerous-commands/` (14 .md), `README.md`, `TEMPLATE.md`, `schema.ts` |
| **agents/** | 1 manifest + 5 profiles | `manifest.md`; `profiles/`: discovery, evaluation, implementation, validation, README |
| **safety/** | 1 file | `permissions.md` |
| **runtime/** | 1 file | `hook-parity.md` |
| **Root** | README, context-index | `context-index.md`, `README.md` |

**Total .codex files:** 74 (from glob).

---

### .cursor

| Component | Count | Notes |
|-----------|-------|--------|
| **rules/** | 5 files | `behavioral.mdc`, `code-standards.mdc`, `effect-patterns.mdc`, `general.mdc`, `meta-thinking.mdc` — synced from .claude via `bun run repo-cli sync-cursor-rules` |
| **skills/** | 2 | `Better Auth Best Practices/SKILL.md`, `Create Auth Skill/SKILL.md` only |

**Total .cursor files:** 7.

---

## Current Strengths and Coupling Points

### .cursor strengths

- **Rules parity:** All 5 core rule domains are present in `.cursor/rules/` as `.mdc`; content is synced from `.claude/rules/` via `sync-cursor-rules`. Instruction guardrails (general, behavioral, effect-patterns, code-standards, meta-thinking) are available in Cursor.
- **Format alignment:** Cursor’s `.mdc` rule format is supported; sync tooling exists in `tooling/cli/src/commands/sync-cursor-rules.ts`.
- **Minimal surface:** Only 7 files under `.cursor/`, reducing risk of drift if we extend in a controlled way.

### Coupling points

- **Rules:** `.cursor/rules/` is fully dependent on `.claude/rules/` and `sync-cursor-rules`. Any new rule or rename in .claude must be reflected in sync logic and re-run.
- **Skills:** The 2 Cursor skills are auth-focused and not derived from .claude; the bulk of .claude/.codex skills (37+ structured in .claude, 3 ports in .codex) have no Cursor equivalent yet.
- **Commands/workflows:** No Cursor-specific mapping of `.claude/commands/` or `.codex/workflows/`; agents and hooks are .claude/.codex-only.
- **Discoverability:** AGENTS.md and CLAUDE.md reference Cursor (e.g. `sync-cursor-rules`); no `.cursor/`-specific index or context doc.

---

## Risks and Unknowns

| Risk | Severity | Impact | Mitigation | Owner | Status |
|------|----------|--------|------------|-------|--------|
| Skill port volume (37 → Cursor) | High | Incomplete parity if only subset ported; prioritization needed | P1: define required vs optional skills; use .codex ports as reference | P1 | Open |
| Cursor workflow/command mechanism unclear | Medium | Commands/workflows may need to be rules, skills, or docs | P1: document Cursor’s command/workflow surface and map each required flow | P1 | Open |
| Hook/telemetry parity not in scope | Medium | .claude hooks (self-healing, skill-suggester, telemetry) may have no Cursor equivalent | Treat as optional or “investigate”; avoid blocking instruction/skill parity | P1 | Open |
| Agent delegation model | Medium | .claude agents-manifest + 29 agents have no .cursor counterpart | Map to “adaptation” or “defer”; document Cursor-native delegation if any | P1 | Open |
| Pattern detector / self-healing | Medium | Runtime behavior depends on Claude/Codex hook lifecycle | Classify as adaptation or investigate; do not assume same hooks in Cursor | P1 | Open |

### Open questions for P1

1. Which of the 37 .claude skills are **required** for Cursor parity vs optional? (Reference: RUBRICS.md capability coverage, README scope.)
2. How should `sync-cursor-rules` be extended (if at all)? (e.g. new rules, different paths, validation.)
3. What Cursor mechanisms exist for command/workflow parity (rules, skills, or documented procedures)?
4. Is a `.cursor/`-specific context index or pointer doc needed for discoverability parity?

---

## Summary

- **.claude:** Rich instruction (5 rules), large skill set (37 structured + flat), 13 commands, 29 agents, hooks and patterns. Source of truth.
- **.codex:** Subset at parity with .claude: 3 rules, 8 workflows, 3 ported skills, patterns and agents profiles. Secondary reference.
- **.cursor:** Instruction parity via 5 synced rules; only 2 skills. No workflows, no agent mapping, no hooks. Gap is primarily in **skills**, **commands/workflows**, and **context/discoverability**.

P0 deliverables complete. Proceed to P1 with `outputs/parity-capability-matrix.md` and this baseline.
