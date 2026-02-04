# Handoff: Phase 2 - Hook Optimization

> Context for reducing per-prompt token count from ~8,000-10,000 to ≤4,000.

---

## Context

P0 and P1 established baselines:

| Metric | P0 Value | Target | Gap |
|--------|----------|--------|-----|
| **Per-prompt tokens** | 8,000-10,000 | ≤4,000 | 2-2.5x over |
| **Skills overhead** | 55,000 (eager) | 500 (lazy) | 99% reduction potential |
| **Rules overhead** | 7,900 | 3,000 | 62% reduction potential |
| **Manifest overhead** | 5,500 | 1,000 | 82% reduction potential |

**P1 Findings Relevant to P2**:
- 45 skills inventoried, 39 after consolidation
- 7 skills missing frontmatter (affects lazy loading)
- agentation skill marked for removal

---

## Mission

Reduce per-prompt token injection from ~8,000-10,000 to ≤4,000 through hook optimization.

---

## Optimization Strategies (from P0)

| Strategy | Token Savings | Implementation |
|----------|---------------|----------------|
| **Lazy-load skills** | ~54,500 | Load only on trigger match |
| **Split rules** | ~4,900 | Core always, Effect patterns on-demand |
| **Index manifest** | ~4,500 | Summary only, full definition on request |

**Total potential**: 63,900 tokens saved (15,000 → 5,000)

---

## Key Hook Files

| File | Purpose | Current Tokens |
|------|---------|----------------|
| `.claude/hooks/startup.ts` | Main startup hook | Unknown |
| `.claude/hooks/session-context.ts` | Session context generator | 5,000-8,000 |
| `.claude/hooks/user-prompt-submit.ts` | Per-prompt hook | 55,000 (skills crawl) |

---

## Agent Assignments

| Agent | Task | Output |
|-------|------|--------|
| codebase-researcher | Analyze hook flow, identify optimization points | Hook analysis |
| effect-code-writer | Implement lazy loading for skills | Modified hooks |
| Explore | Validate token count post-optimization | Validation report |

---

## Implementation Approach

### Phase 2.1: Analyze Current Hook Flow

1. Map all hooks and their invocation points
2. Measure token injection at each stage
3. Identify eager-loading bottlenecks
4. Document optimization opportunities

### Phase 2.2: Implement Lazy Loading

1. Create skills index (name → path mapping)
2. Replace crawl with index lookup
3. Load full SKILL.md only when triggered
4. Update UserPromptSubmit hook

### Phase 2.3: Split Rules

1. Identify core rules (always needed)
2. Create on-demand loading for Effect patterns
3. Test incremental loading

### Phase 2.4: Validate

1. Measure post-optimization token count
2. Verify all skills still discoverable
3. Run agent workflows to ensure functionality

---

## Success Criteria

- [ ] Hook flow documented
- [ ] Token injection reduced to ≤4,000
- [ ] Skills still discoverable and functional
- [ ] No breaking changes to agent workflows
- [ ] `outputs/P2_HOOK_OPTIMIZATION.md` created

---

## Deliverables

1. `outputs/P2_HOOK_OPTIMIZATION.md` - Analysis and changes
2. `outputs/hook-flow-diagram.md` - Visual flow with token costs
3. Modified `.claude/hooks/` files (with backup)
4. Token validation report

---

## Constraints

1. **No Breaking Changes**: All agent workflows must continue functioning
2. **Performance**: Optimizations must not increase startup time
3. **Reversibility**: All changes reversible via git
4. **Parallel Safe**: Changes should not conflict with ongoing P1 cleanup

---

## Token Budget

This handoff: ~800 tokens (20% of 4K budget)

---

## Reference

- P0 findings: `outputs/P0_BASELINE.md`
- P1 findings: `outputs/P1_QUALITY_ASSESSMENT.md`
- Token breakdown: `outputs/token-breakdown.md`
- Spec README: `specs/agent-effectiveness-audit/README.md`
