# Token Breakdown Analysis

> Per-prompt token cost analysis for the beep-effect monorepo hooks system.

---

## Summary

| Metric | Value |
|--------|-------|
| **Estimated Baseline per Prompt** | ~8,000-10,000 tokens |
| **Conditional Overhead (Skills)** | ~55,000 tokens (if loaded) |
| **Target** | ≤4,000 tokens |
| **Current vs Target** | 2-2.5x over budget |

---

## Component Breakdown

| Component | Source Files | Estimated Tokens | Load Condition |
|-----------|--------------|------------------|----------------|
| **Rules (5 files)** | `.claude/rules/*.md` | ~7,900 | Always (via CLAUDE.md) |
| **Agent Manifest** | `agents-manifest.yaml` | ~5,500 | Per-prompt for suggestions |
| **Session Context** | Commands (tree, git, gh) | ~5,000-8,000 | SessionStart |
| **Skills Directory** | `.claude/skills/*/SKILL.md` | ~55,000 | UserPromptSubmit (crawled) |
| **Pattern Detector** | `.claude/patterns/*.md` | ~13,100 | PostToolUse |
| **Subagent Context** | Minimal commands | ~2,500-4,500 | SubAgentStart only |
| **Skill Hints** | Matched skills | ~500-2,000 | UserPromptSubmit (conditional) |

---

## Rules File Breakdown

| Rule File | Bytes | Est. Tokens | Purpose |
|-----------|-------|-------------|---------|
| effect-patterns.md | 20,301 | ~5,075 | Effect conventions, testing, EntityIds |
| general.md | 5,501 | ~1,375 | Code quality, boundaries, commands |
| code-standards.md | 1,970 | ~493 | Style, patterns, documentation |
| behavioral.md | 1,826 | ~457 | Critical thinking, workflow |
| meta-thinking.md | 1,757 | ~456 | Effect algebra, uncertainty |
| **Total** | **31,355** | **~7,900** | |

**Finding**: `effect-patterns.md` alone is 64% of rules overhead.

---

## Session Context Components

| Component | Est. Tokens | Notes |
|-----------|-------------|-------|
| File tree (via `tree`) | ~1,500-3,000 | Project structure |
| Git status | ~300 | Current changes |
| Git log (5 commits) | ~1,400 | Recent history |
| Branch context | ~400 | Current + 4 recent |
| GitHub issues (5) | ~500-1,000 | Open issues |
| GitHub PRs (5) | ~500-1,000 | Open PRs |
| Module discovery | ~1,000-2,000 | ai-context crawl |
| Package scripts | ~500-1,000 | Available commands |
| Collaborators | ~300-500 | Team context |
| **Total** | **~7,000-10,000** | |

---

## Top 5 Token Consumers

| Rank | Component | Tokens | % of Total | Optimization |
|------|-----------|--------|------------|--------------|
| 1 | Skills Directory | 55,000 | 64% | Lazy-load on explicit request |
| 2 | Pattern Detector | 13,100 | 15% | Load only matching patterns |
| 3 | Rules Files | 7,900 | 9% | Split into micro-rules |
| 4 | Agent Manifest | 5,500 | 6% | Index-only, load on demand |
| 5 | Session Context | 5,000 | 6% | Cache tree output |

---

## Load Conditions

### Always Loaded (~7,900 tokens)
- All 5 rules files
- Core behavioral guidance
- Critical thinking framework

### SessionStart Only (~7,000-10,000 tokens)
- Project structure
- Git history
- GitHub context
- Agent instructions

### SubAgentStart Only (~2,500-4,500 tokens)
- Minimal git context
- Module summary
- Subagent instructions
- No GitHub context

### UserPromptSubmit (Conditional)
- Skills matching: ~500-2,000 tokens
- Full skills crawl: ~55,000 tokens (if triggered)

### PostToolUse (Conditional)
- Pattern matching: ~100-500 tokens

---

## Optimization Recommendations

### Priority 1: High Impact

**1. Skills Lazy-Loading**
- Current: Full 55,000 token crawl on UserPromptSubmit
- Recommended: Load ~500 token index, full skills on-demand
- Savings: 99% reduction in conditional overhead

**2. Rules Micro-Splitting**
- Current: 7,900 tokens always loaded
- Recommended: Core rules (~3,000) always, Effect patterns on-demand
- Savings: 40% reduction in baseline

**3. Agent Manifest Indexing**
- Current: 5,500 token full manifest
- Recommended: 1,000 token index, full agents on-demand
- Savings: 80% reduction

### Priority 2: Medium Impact

**4. Session Context Caching**
- Cache tree output (10-minute TTL)
- Cache git log per session
- Limit GitHub API calls
- Savings: 30-40% on SessionStart

**5. Pattern Detector Granularity**
- Load only matching pattern categories
- Savings: 60-70% on PostToolUse

---

## Projected Savings

| Optimization | Current | After | Reduction |
|--------------|---------|-------|-----------|
| Lazy skills | 55,000 | 500 | 99% |
| Rules splitting | 7,900 | 3,000 | 62% |
| Manifest indexing | 5,500 | 1,000 | 82% |
| Context caching | 5,000 | 1,500 | 70% |
| Pattern granularity | 13,100 | 2,000 | 85% |

**Net Result**: Reduce typical prompt from ~15,000 to ~5,000 tokens baseline.

---

## Key Findings

1. **Skills crawl is the largest cost** - 55,000 tokens loaded on every UserPromptSubmit
2. **Rules are always loaded** - No conditional loading based on task type
3. **effect-patterns.md dominates rules** - 64% of rules overhead from one file
4. **Agent manifest is comprehensive** - Full 30-agent definitions always present
5. **Session context is fresh each time** - No caching of stable data

---

*Generated by Explore agent during P0 baseline measurement*
