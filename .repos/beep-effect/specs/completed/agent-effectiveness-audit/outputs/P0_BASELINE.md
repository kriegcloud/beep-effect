# P0 Baseline Metrics

> Comprehensive baseline measurements for the agent effectiveness audit.

---

## Executive Summary

Phase 0 established baseline metrics using 3 parallel Explore agents. Key findings:

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Per-prompt tokens** | ~8,000-10,000 | ≤4,000 | 2-2.5x over |
| **Agents** | 29 | N/A | 3 high-risk confusion clusters |
| **Skills** | 45 | N/A | 7 missing frontmatter, 3 redundant |
| **Confusion clusters** | 6 | 0 | Disambiguation needed |

---

## Token Audit Summary

### Baseline Cost: ~8,000-10,000 tokens

| Component | Tokens | % of Baseline |
|-----------|--------|---------------|
| Rules (5 files) | 7,900 | 80-99% |
| Session context | 5,000-8,000 | Variable |
| Agent manifest | 5,500 | Always loaded |

### Conditional Overhead: Up to ~55,000 tokens

| Component | Tokens | Trigger |
|-----------|--------|---------|
| Skills directory | 55,000 | UserPromptSubmit crawl |
| Pattern detector | 13,100 | PostToolUse |

### Top Optimization Opportunities

1. **Lazy-load skills** → 99% reduction (55,000 → 500)
2. **Split rules** → 62% reduction (7,900 → 3,000)
3. **Index manifest** → 82% reduction (5,500 → 1,000)

**Projected savings**: 15,000 → 5,000 tokens (67% reduction)

---

## Agent Trigger Matrix Summary

### Agent Count: 29

| Tier | Count | Purpose |
|------|-------|---------|
| Foundation | 3 | Exploration, reflection |
| Research | 9 | Documentation, patterns |
| Quality | 5 | Review, validation |
| Writer | 8 | Docs, tests, code |
| Utility | 1 | Domain expertise |

### Confusion Clusters Identified: 6

| Cluster | Risk | Agents | Issue |
|---------|------|--------|-------|
| Explorers | HIGH | codebase-researcher, codebase-explorer | Overlapping "explore" triggers |
| Documentation | HIGH | doc-writer, doc-maintainer, jsdoc-fixer | 80% trigger overlap |
| Effect Research | MEDIUM | mcp-researcher, effect-researcher | Circular distinction |
| Architecture | MEDIUM | code-reviewer, architecture-pattern-enforcer | Scope unclear |
| Error Fixing | MEDIUM | package-error-fixer | Too generic trigger |
| Effect Expert | MEDIUM | effect-expert, mcp-researcher | "layer composition" shared |

### Manifest Drift: NONE

All 29 agents in manifest have corresponding `.md` files.

---

## Skill Inventory Summary

### Skill Count: 45

| Metric | Count |
|--------|-------|
| Total skills | 45 |
| With SKILL.md | 45 (100%) |
| With frontmatter | 38 (84%) |
| With triggers | 41 (91%) |
| Symlinked | 9 (20%) |

### Categories

| Category | Count |
|----------|-------|
| Effect Core | 8 |
| Effect AI | 5 |
| Platform | 5 |
| React/Frontend | 4 |
| Authentication | 3 (redundant) |
| Workflow | 6 |
| Other | 14 |

### Issues Identified

| Issue | Count | Impact |
|-------|-------|--------|
| Naming inconsistencies | 2 | Breaks programmatic filtering |
| Missing frontmatter | 7 | Blocks discovery |
| Redundant auth skills | 3 | User confusion |
| Unclear symlink strategy | 9 | Maintenance ambiguity |

---

## Context File Status

| Directory | Purpose | Status |
|-----------|---------|--------|
| `context/effect/` | Effect module patterns | Created in agent-context-optimization |
| `context/platform/` | Platform patterns | Created in agent-context-optimization |
| `context/internal/` | Repo-specific context | Created in agent-context-optimization |
| `context/INDEX.md` | Navigation index | Present |

**Freshness**: Not yet validated (P4 deliverable)

---

## Patterns Applied

From `agent-infrastructure-rationalization` REFLECTION_LOG:

| Pattern | Score | Application |
|---------|-------|-------------|
| Parallel Inventory Pattern | 85 | 3 parallel Explore agents |
| Manifest Drift Detection | 80 | Cross-referenced filesystem |
| Discoverability-First Infrastructure | 85 | Measured before optimizing |

---

## Success Criteria Status

| Criteria | Status | Notes |
|----------|--------|-------|
| Token count measured | ✅ | ~8,000-10,000 baseline |
| All agents cataloged | ✅ | 29 agents with triggers |
| All skills inventoried | ✅ | 45 skills with metadata |
| Context file inventory | ✅ | 3 directories + index |
| Baseline metrics documented | ✅ | This document |

---

## Key Findings for P1+

### P1: Skill Quality Assessment
- 45 skills to score
- 7 need frontmatter first
- 3 auth skills need consolidation decision

### P2: Hook Optimization
- Target: 4,000 tokens (currently 8,000-10,000)
- Primary opportunity: Lazy-load skills (99% reduction)
- Secondary: Split rules, index manifest

### P3: Telemetry
- No usage tracking currently exists
- Hook infrastructure ready for extension

### P4: Context Freshness
- `context/` directories created
- No freshness validation in place

---

## Verification

```bash
# Confirmed counts
ls .claude/agents/*.md | wc -l  # 29
ls -d .claude/skills/*/ | wc -l  # 45
ls .claude/rules/*.md | wc -l   # 5
```

---

*Generated: 2026-02-03*
*Phase: P0 Baseline Measurement*
*Agents deployed: 3 parallel Explore*
