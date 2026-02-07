# P5 Orchestrator Prompt: Validation & Pattern Promotion

You are executing Phase 5 (final) of the `agent-infrastructure-rationalization` spec.

---

## Context

P4 completed all infrastructure changes:
- 27 agent files (doc-maintainer merged from 2)
- 27 manifest entries (orphans added)
- 5 rule files + 5 Cursor rules synced
- IDE symlinks fixed
- Cleanup complete

P5 validates and finalizes.

---

## Your Mission

1. **Run validation** - Verify all counts match expectations
2. **Promote patterns** - Add 6+ patterns to PATTERN_REGISTRY
3. **Mark spec complete** - Update specs/README.md

---

## Task 1: Validation

Run these commands and verify results:

```bash
# Agent validation
bun run agents:validate

# File counts
ls -1 .claude/agents/*.md | wc -l     # Expected: 27
ls -1 .claude/rules/*.md | wc -l      # Expected: 5
ls -1 .cursor/rules/*.mdc | wc -l     # Expected: 5

# Symlink verification
readlink .windsurf/rules              # Expected: ../.claude/rules
readlink .windsurf/skills             # Expected: ../.claude/skills

# Manifest-file alignment
diff <(ls -1 .claude/agents/*.md | sed 's|.*/||;s|\.md||' | sort) \
     <(grep -E "^  [a-z][a-z0-9-]*:$" .claude/agents-manifest.yaml | sed 's/://;s/^  //' | grep -v "read-only\|write-files\|write-reports" | sort)
```

If validation fails, fix issues before proceeding.

---

## Task 2: Pattern Promotion

Add these patterns to `specs/_guide/PATTERN_REGISTRY.md`:

### High Priority (Score ≥85)

1. **IDE Configuration Drift Detection** (90, P1)
   - Compare line counts between source and synced artifacts
   - Alert if delta > 10%

2. **Parallel Inventory Pattern** (85, P0)
   - Deploy 3+ parallel Explore agents for disjoint inventory tasks
   - Completes 3x faster with no conflicts

3. **Agent Overlap Scoring** (85, P1)
   - Weight: Purpose 40%, Tools 30%, Triggers 20%, Skills 10%
   - Thresholds: >80% MERGE, 50-80% EVALUATE, <50% KEEP

4. **Conservative Agent Consolidation** (85, P2)
   - Only merge with >80% similarity AND >70% purpose overlap
   - Tool overlap alone insufficient

5. **Discoverability-First Infrastructure** (85, P3)
   - Create navigation tools before implementing changes
   - Reduces context switching during execution

6. **Parallel Documentation Creation** (85, P4)
   - Single agent invocation with multiple file specs
   - Faster than sequential spawns

### Medium Priority (Score 80)

7. **Single Source of Truth per Topic** (80, P1)
8. **Token Budget Enforcement** (80, P3)
9. **Manifest-First Agent Management** (80, P4)
10. **IDE Symlink Standardization** (80, P4)

---

## Task 3: Mark Spec Complete

Update `specs/README.md` to mark `agent-infrastructure-rationalization` as COMPLETED.

Update `specs/agent-infrastructure-rationalization/REFLECTION_LOG.md` P5 entry.

---

## Agent Usage

| Agent | Task |
|-------|------|
| Bash (direct) | Run validation commands |
| doc-writer | Add patterns to PATTERN_REGISTRY |
| doc-writer | Update specs/README.md |

---

## Success Criteria

- [ ] All validation commands pass
- [ ] 6+ patterns added to PATTERN_REGISTRY
- [ ] Spec marked COMPLETED in specs/README.md
- [ ] P5 entry added to REFLECTION_LOG.md

---

## Deliverables

1. Validation output (in response)
2. Updated `specs/_guide/PATTERN_REGISTRY.md`
3. Updated `specs/README.md`
4. Final `REFLECTION_LOG.md` entry
