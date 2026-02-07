# P0 Baseline Metrics

> Agent Infrastructure Rationalization - Phase 0 Complete
> Generated: 2026-02-03

---

## Executive Summary

| Metric | Current Value | Target | Gap |
|--------|---------------|--------|-----|
| **Total Agents** | 31 (18 synced, 11 orphaned, 2 missing) | 15-18 | -13 to -16 |
| **Total Skills** | 53 unique across 6 directories | Single source | 5 duplicated locations |
| **Hook Systems** | 4 active | Optimized | Token cost TBD |
| **Startup Tokens** | ~8,700-11,700 | ≤10,000 | Borderline |
| **Per-Prompt Overhead** | ~5,000-6,500 | ≤3,000 | -40% needed |

---

## Agent Infrastructure

### Agent Count by Status

| Status | Count | Percentage |
|--------|-------|------------|
| Synced (manifest + file) | 18 | 58% |
| Orphaned (file only) | 11 | 35% |
| Missing (manifest only) | 2 | 6% |
| **Total** | **31** | 100% |

### Agent Count by Tier

| Tier | Count | Description |
|------|-------|-------------|
| Tier 1 (Foundation) | 3 | codebase-researcher, reflector, prompt-refiner |
| Tier 2 (Research) | 6 | mcp-researcher, web-researcher, effect-researcher, effect-schema-expert*, effect-predicate-master, ai-trends-researcher |
| Tier 3 (Quality) | 4 | code-reviewer, architecture-pattern-enforcer, spec-reviewer, tsconfig-auditor |
| Tier 4 (Writers) | 8 | doc-writer, test-writer, code-observability-writer*, jsdoc-fixer, package-error-fixer, agents-md-updater, readme-updater, prompt-refiner |
| Unmanifested | 11 | domain experts, specialized agents |

*Missing implementation file

### Agent Count by Capability

| Capability | Count |
|------------|-------|
| read-only | 6 |
| write-reports | 5 |
| write-files | 12 |
| unmanifested | 8 |

### Critical Issues

1. **Missing Files** (2): `code-observability-writer`, `effect-schema-expert`
2. **Orphaned Agents** (11): Not in manifest but active on disk
3. **Manifest Drift**: 36% of agents lack orchestration metadata

---

## Skill Infrastructure

### Skill Count by Location

| Location | Count | Type |
|----------|-------|------|
| `.claude/skills/` | 61 | 9 symlinks + 52 originals |
| `.agents/skills/` | 9 | Authoritative directories |
| `.cursor/skills/` | 11 | 9 symlinks + 2 local copies |
| `.windsurf/skills/` | 11 | 9 symlinks + 2 local copies |
| `.codex/skills/` | 10 | 9 symlinks + 1 broken |
| `.opencode/skills/` | 9 | Symlinks only |

### Unique Skills: 53

### Duplication Analysis

| Category | Count | Details |
|----------|-------|---------|
| Fully synced (symlinks) | 9 | agentation, better-auth-best-practices, humanizer, reflect, session-handoff, skill-creator, skill-judge, subagent-driven-development, turborepo |
| Local duplicates | 2 | "Better Auth Best Practices", "Create Auth Skill" (content diverged) |
| Claude-only | 52 | Unique to `.claude/skills/` |
| Broken symlinks | 1 | `.codex/skills/shadcn-ui` |

### Critical Issues

1. **Naming inconsistency**: "Better Auth Best Practices" vs "better-auth-best-practices"
2. **Content divergence**: 16KB vs 6KB for same-named skill
3. **Broken link**: `.codex/skills/shadcn-ui` → missing target
4. **No single source**: 52 skills only in `.claude/`

---

## Hook System

### Active Hooks

| Hook | Trigger | Token Cost |
|------|---------|------------|
| SessionStart | Session begins | 8,700-11,700 |
| UserPromptSubmit | Every prompt | 5,000-6,500 |
| PreToolUse (Task) | Agent spawn | 4,400-7,090 |
| PreToolUse (Bash) | Before commands | 1,500-2,000 |
| PostToolUse (Edit/Write) | After edits | 1,500-3,000 |

### Typical Session Token Budget

| Component | Tokens | % of Session |
|-----------|--------|--------------|
| SessionStart (1x) | ~10,000 | 10% |
| Prompts (5x) | ~30,000 | 30% |
| Tasks (2x) | ~11,000 | 11% |
| Bash (10x) | ~17,500 | 17% |
| Edit/Write (8x) | ~20,000 | 20% |
| **Overhead Total** | **~88,500** | — |

### Critical Issues

1. **Per-prompt overhead**: 5,000-6,500 tokens per prompt is high
2. **GitHub queries**: Add 2,000-3,000 tokens to SessionStart
3. **Skill reloading**: Skills reload every prompt (not cached)
4. **No lightweight mode**: All hooks always run full logic

---

## Summary Metrics

### Before Optimization (P0 Baseline)

```
Agents:           31 total (18 managed, 11 orphaned, 2 missing)
Skills:           53 unique (scattered across 6 directories)
Hooks:            4 active (high token overhead)
Startup tokens:   ~10,000 (borderline acceptable)
Per-prompt:       ~5,500 (40% above target)
```

### Target (Post-Optimization)

```
Agents:           15-18 (zero orphans, zero missing)
Skills:           53 unique (single source + symlinks)
Hooks:            4 active (optimized token budget)
Startup tokens:   ≤10,000 (within budget)
Per-prompt:       ≤3,000 (40% reduction)
```

---

## Phase Completion Checklist

- [x] Agent catalog complete (31 agents documented)
- [x] Skill duplication matrix complete (6 locations mapped)
- [x] Hook flow documented (4 hook systems analyzed)
- [x] Token cost estimates for each component
- [x] Baseline metrics recorded

---

## Next Phase: P1 (Redundancy Analysis)

P1 will analyze:
1. Agent capability overlaps (which agents do same tasks)
2. Skill duplication patterns (authoritative source identification)
3. Configuration conflicts (.claude vs .cursor vs .windsurf)
4. Consolidation opportunities

Agents: reflector, code-reviewer, Explore
