# P5 Handoff: Validation & Pattern Promotion

> Phase 5 of `agent-infrastructure-rationalization` spec

---

## Context Summary

P4 implemented all infrastructure changes:
- **27 agent files** (28 original - 2 merged + 1 new)
- **27 manifest entries** (24 original + 3 orphans added)
- **5 rule files** (3 original + 2 extracted)
- **IDE configs fixed** (Cursor re-synced, Windsurf symlinked)
- **Cleanup complete** (.codex/, .opencode/, .claude/CLAUDE.md deleted)

P5 validates the changes and promotes patterns to the registry.

---

## P5 Objectives

1. **Validate infrastructure** - Run agents:validate, verify counts
2. **Add CI protection** - Prevent future IDE config drift
3. **Promote patterns** - Add validated patterns to PATTERN_REGISTRY
4. **Final verification** - Comprehensive checklist

---

## Deliverables

### 1. Validation Results

Run verification commands and document results:
```bash
bun run agents:validate
ls -1 .claude/agents/*.md | wc -l  # Expected: 27
ls -1 .claude/rules/*.md | wc -l   # Expected: 5
ls -1 .cursor/rules/*.mdc | wc -l  # Expected: 5
```

### 2. CI Protection (Optional)

Add to pre-commit hook or CI:
- Verify .windsurf/rules is symlink to ../.claude/rules
- Verify .windsurf/skills is symlink to ../.claude/skills
- Verify .cursor/rules/ line counts match .claude/rules/ (±10%)

### 3. Pattern Promotion

Promote high-scoring patterns from REFLECTION_LOG.md to `specs/_guide/PATTERN_REGISTRY.md`:

| Pattern | Score | Phase |
|---------|-------|-------|
| IDE Configuration Drift Detection | 90 | P1 |
| Parallel Inventory Pattern | 85 | P0 |
| Agent Overlap Scoring | 85 | P1 |
| Conservative Agent Consolidation | 85 | P2 |
| Discoverability-First Infrastructure | 85 | P3 |
| Parallel Documentation Creation | 85 | P4 |

### 4. Spec Completion

- Mark spec as COMPLETED in `specs/README.md`
- Archive handoff documents if needed
- Final REFLECTION_LOG update

---

## Files to Reference

| File | Purpose |
|------|---------|
| `specs/agent-infrastructure-rationalization/REFLECTION_LOG.md` | Pattern candidates |
| `specs/_guide/PATTERN_REGISTRY.md` | Target for promotions |
| `.claude/agents-manifest.yaml` | Validation source |
| `.husky/pre-commit` | CI hook location |

---

## Success Criteria

- [ ] `bun run agents:validate` passes
- [ ] Agent count = 27 files
- [ ] Rule count = 5 files (Claude) + 5 files (Cursor)
- [ ] Symlinks verified (.windsurf/rules, .windsurf/skills)
- [ ] 6+ patterns promoted to registry
- [ ] Spec marked COMPLETED

---

## Estimated Effort

- Validation: ~5 min (direct commands)
- CI protection: ~10 min (optional)
- Pattern promotion: ~15 min (doc-writer agent)
- Total: ~30 min

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| agents:validate fails | Low | Fix manifest entries |
| Pattern registry conflicts | Low | Add with unique IDs |
| Scope creep | Medium | Stick to validation only |
