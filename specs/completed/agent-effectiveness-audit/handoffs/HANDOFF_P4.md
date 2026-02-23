# Handoff: Phase 4 - Context Freshness Automation

> Context for implementing automated detection and refresh of stale context files.

---

## Context

P3 achieved:
- Agent usage telemetry implemented (PreToolUse + SubagentStop hooks)
- JSONL logging to `.claude/.telemetry/usage.jsonl`
- CLI report command: `bun run repo-cli agents-usage-report`
- 43 tests passing for schema validation and privacy compliance

P4 focus: Automate detection and refresh of stale context files.

---

## Mission

Implement context freshness automation that:
1. Scans `context/` directory for staleness
2. Checks `.repos/effect/` subtree currency
3. Validates skill definitions for outdated content
4. Provides CLI command for freshness reports
5. Optional: CI integration for staleness warnings

---

## P3 Outcomes Available

| Deliverable | Location |
|-------------|----------|
| Telemetry hooks | `.claude/hooks/telemetry/` |
| CLI command | `tooling/cli/src/commands/agents-usage-report/` |
| Test suite | `.claude/hooks/telemetry/index.test.ts` |
| Design document | `outputs/telemetry-design.md` |
| Implementation report | `outputs/P3_TELEMETRY.md` |
| Reflection entry | `REFLECTION_LOG.md` P3 section |

---

## Freshness Sources

| Context Type | Freshness Signal | Refresh Method |
|--------------|------------------|----------------|
| `.repos/effect/` | Git subtree date | `git subtree pull` |
| `context/effect/` | Source file dates | Regeneration script |
| `context/internal/` | Last commit date | Manual review |
| Skills (`.claude/skills/`) | SKILL.md mtime | Quality audit |

---

## Staleness Thresholds

| Source | Warning | Critical | Action |
|--------|---------|----------|--------|
| `.repos/effect/` | 30 days | 60 days | Subtree pull |
| `context/` files | 30 days | 45 days | Regenerate/review |
| Skills | 60 days | 90 days | Quality audit |

---

## Implementation Approach

### 1. Freshness Check Script

Create `scripts/check-context-freshness.ts`:
- Scan all target directories
- Calculate age from mtime
- Categorize as fresh/warning/critical
- Output report (table or JSON)

### 2. CLI Integration

Add `bun run repo-cli context-freshness`:
- `--format table|json`
- `--threshold-warning N` (days)
- `--threshold-critical N` (days)
- Exit code 1 if any critical

### 3. Refresh Commands (Optional)

- `bun run repo-cli context-refresh effect` - Pull effect subtree
- `bun run repo-cli context-refresh internal` - Regenerate internal context

---

## Agent Assignments

| Agent | Task | Output |
|-------|------|--------|
| codebase-researcher | Audit current context freshness | Staleness report |
| effect-code-writer | Implement freshness check script | Script |
| test-writer | Create freshness tests | Test file |
| doc-writer | Document freshness workflow | Documentation |

---

## Success Criteria

- [ ] Freshness check script implemented
- [ ] CLI command functional
- [ ] Threshold configuration working
- [ ] Current context files audited
- [ ] `outputs/P4_FRESHNESS.md` created
- [ ] REFLECTION_LOG.md updated with P4 entry
- [ ] Handoff for P5 created

---

## Key Files

| File | Purpose |
|------|---------|
| `context/` | Context files to audit |
| `.repos/effect/` | Effect source subtree |
| `.claude/skills/` | Skill definitions |
| `tooling/cli/` | CLI commands |
| `scripts/` | Utility scripts |

---

## Token Budget

This handoff: ~500 tokens (12% of 4K budget)

---

## References

- README: `specs/agent-effectiveness-audit/README.md` (P4 section)
- P3 report: `outputs/P3_TELEMETRY.md`
- Subtree docs: `documentation/subtree-workflow.md`
