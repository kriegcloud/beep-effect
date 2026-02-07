# P3 Handoff: Discoverability Enhancement

> Session handoff document for P3 execution
> Created: 2026-02-03

---

## Context Summary

### What Was Accomplished (P0-P2)

**P0 (Inventory)**:
- 31 agents cataloged: 18 synced, 11 orphaned, 2 missing files
- 53 unique skills across 6 directories
- 82K tokens per session (51% above target)

**P1 (Redundancy Analysis)**:
- 1 high-priority merge: `agents-md-updater` + `readme-updater` (82% similarity)
- 7 medium-priority evaluations (50-80% similarity) - all kept separate
- **CRITICAL**: Cursor rules have 38-53% content loss
- **MISSING**: `.windsurf/rules/` symlink needs verification
- ~30% CLAUDE.md redundancy across 3 files

**P2 (Architecture Design)**:
- Target: 31 → 28 agents (merge 2→1, remove 2 missing, add 10 orphaned)
- Skill strategy: `.claude/skills/` authoritative, delete `.codex/` and `.opencode/`
- IDE sync: Cursor auto-generated MDC, Windsurf symlinked
- CLAUDE.md: Migrate unique content to rules, delete `.claude/CLAUDE.md`

### P2 Deliverables Created

| File | Purpose |
|------|---------|
| `outputs/P2_ARCHITECTURE.md` | Target state design |
| `outputs/agent-consolidation-plan.md` | 31 agents with decisions |
| `outputs/migration-checklist.md` | Step-by-step implementation |

---

## P3 Objective

Create navigation tools for agents to find relevant context efficiently:
1. Agent capability matrix (which agent for which task)
2. Discovery Kit skill (Glob/Grep patterns)
3. Token budget enforcement
4. Optimized CLAUDE.md files

---

## Entry Criteria (All Met)

- [x] P2 architecture document in `outputs/P2_ARCHITECTURE.md`
- [x] Agent consolidation plan in `outputs/agent-consolidation-plan.md`
- [x] Migration checklist in `outputs/migration-checklist.md`

---

## Exit Criteria

- [ ] Agent capability matrix created (`specs/_guide/AGENT_CAPABILITIES.md`)
- [ ] Discovery Kit skill implemented (`.claude/skills/discovery-kit/`)
- [ ] Token budget validator created (`specs/_guide/scripts/validate-handoff.sh`)
- [ ] CLAUDE.md optimization plan documented
- [ ] **P4 handoff documents created** (HANDOFF_P4.md, P4_ORCHESTRATOR_PROMPT.md)

---

## Recommended Agent Usage

| Agent | Task | Output |
|-------|------|--------|
| codebase-researcher | Audit current agent usage patterns | Usage analysis |
| doc-writer | Create capability matrix | `AGENT_CAPABILITIES.md` |
| doc-writer | Create Discovery Kit skill | `.claude/skills/discovery-kit/` |
| Explore | Identify CLAUDE.md optimization targets | Optimization report |

---

## Key Design Decisions from P2

### Agent Capability Matrix Structure

```markdown
## Agent Capability Matrix

### By Task Type

| Task | Primary Agent | Fallback | Prerequisites | Tier |
|------|---------------|----------|---------------|------|
| Code exploration | Explore | codebase-researcher | None | 1 |
| Effect docs lookup | mcp-researcher | effect-researcher | MCP config | 2 |
| Code review | code-reviewer | architecture-pattern-enforcer | Guidelines | 3 |
| Test generation | test-writer | None | @beep/testkit | 4 |
| Documentation | doc-writer | None | Effect patterns | 4 |

### By Capability

| Capability | Agents | Output Type |
|------------|--------|-------------|
| read-only | codebase-researcher, mcp-researcher, web-researcher | none |
| write-reports | reflector, code-reviewer, architecture-pattern-enforcer | outputs/*.md |
| write-files | doc-writer, test-writer, package-error-fixer | source files |
```

### Discovery Kit Skill Structure

```
.claude/skills/discovery-kit/
├── SKILL.md           # Main skill definition
├── patterns/
│   ├── file-discovery.md    # Glob patterns
│   ├── content-search.md    # Grep patterns
│   └── verification.md      # Common verification sequences
└── anti-patterns.md   # What NOT to do (avoid Bash for discovery)
```

### Token Budget Validator

```bash
#!/bin/bash
# validate-handoff.sh - Enforce ≤4K token limit

FILE="$1"
WORD_COUNT=$(wc -w < "$FILE")
TOKEN_ESTIMATE=$((WORD_COUNT * 4 / 3))  # ~1.33 tokens per word

if [ "$TOKEN_ESTIMATE" -gt 4000 ]; then
    echo "ERROR: Handoff exceeds 4K token budget ($TOKEN_ESTIMATE tokens)"
    echo "Reduce content or split into multiple documents"
    exit 1
fi

echo "OK: $TOKEN_ESTIMATE tokens (budget: 4000)"
```

---

## Deliverables Expected

1. `specs/_guide/AGENT_CAPABILITIES.md` - Capability matrix
2. `.claude/skills/discovery-kit/SKILL.md` - Discovery patterns skill
3. `specs/_guide/scripts/validate-handoff.sh` - Token validator
4. `outputs/P3_DISCOVERABILITY.md` - Implementation summary
5. **`handoffs/HANDOFF_P4.md`** - Next phase handoff (REQUIRED)
6. **`handoffs/P4_ORCHESTRATOR_PROMPT.md`** - Next phase prompt (REQUIRED)

---

## File References

| File | Purpose |
|------|---------|
| `outputs/P2_ARCHITECTURE.md` | Target state design |
| `outputs/agent-consolidation-plan.md` | Agent decisions |
| `.claude/agents-manifest.yaml` | Current manifest |
| `specs/_guide/README.md` | Spec creation guide |

---

## Constraints

- **Token budget**: Handoffs ≤4K tokens
- **Backward compatibility**: Existing workflows must work
- **Single session target**: Complete P3 in one session

---

## Phase Completion Requirement

**CRITICAL**: A phase is NOT complete until:
1. All exit criteria deliverables exist
2. Next phase handoff document created (`handoffs/HANDOFF_P[N+1].md`)
3. Next phase orchestrator prompt created (`handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`)
4. REFLECTION_LOG.md updated with phase entry

This ensures subsequent orchestrators have full context to continue work.

---

## Quick Start

```bash
# Read P2 outputs
cat specs/agent-infrastructure-rationalization/outputs/P2_ARCHITECTURE.md
cat specs/agent-infrastructure-rationalization/outputs/agent-consolidation-plan.md

# Start P3
# 1. Create capability matrix
# 2. Create discovery kit skill
# 3. Create token validator
# 4. Create P4 handoff documents
```
