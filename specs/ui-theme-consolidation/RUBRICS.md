# Evaluation Rubrics - UI Theme Consolidation

> Decision matrices and scoring criteria for component style merging.

---

## Phase 2: Component Style Comparison Rubric

### Purpose

When comparing 18 overlapping MUI component styles between ui-core and todox, use this rubric to determine what to merge.

### Decision Matrix

For each style property in a todox component, ask:

| Question | If YES | If NO |
|----------|--------|-------|
| Does this property exist in ui-core? | **SKIP** (ui-core wins) | Continue to next question |
| Is this a net-new feature? | **MERGE** | Continue to next question |
| Does this conflict with ui-core behavior? | **SKIP** (ui-core wins) | **MERGE** |

### Merge Classification

| Classification | Action | Example |
|----------------|--------|---------|
| **Additive** | Merge | New CSS variable, new variant, new size |
| **Override** | Skip | Different value for same property |
| **Conflicting** | Skip | Mutually exclusive behaviors |
| **Complementary** | Merge | Additional mode support (e.g., dark mode enhancement) |

---

## Component Comparison Checklist

Use this checklist for each of the 18 overlapping components:

### Per-Component Evaluation

```markdown
## [ComponentName]

**Files:**
- ui-core: `packages/ui/core/src/theme/core/components/[name].tsx`
- todox: `apps/todox/src/theme/components/[name].ts`

**Line Counts:**
- ui-core: ___ lines
- todox: ___ lines

**Properties Analysis:**

| Property | ui-core | todox | Decision |
|----------|---------|-------|----------|
| [prop1] | [value] | [value] | SKIP/MERGE |
| [prop2] | N/A | [value] | MERGE (additive) |
| ... | ... | ... | ... |

**Net-New Features from todox:**
- [ ] [Feature 1]
- [ ] [Feature 2]

**Conflicts (ui-core wins):**
- [Conflict 1]

**Merge Actions:**
- [ ] Add [feature] to ui-core
```

---

## Scoring Criteria (Quality Assessment)

After Phase 2 completion, score the merge quality:

| Criterion | Weight | Score (1-5) | Evidence |
|-----------|--------|-------------|----------|
| Zero regressions | 30% | | No type errors introduced |
| Feature preservation | 25% | | All todox features migrated |
| Code consistency | 20% | | TSX format, Effect utilities |
| Documentation | 15% | | Barrel exports updated |
| Test coverage | 10% | | Type checking passes |

**Scoring Scale:**
- 5: Excellent - Exceeds all criteria
- 4: Good - Meets all criteria
- 3: Acceptable - Minor gaps
- 2: Needs work - Significant gaps
- 1: Failing - Major issues

**Minimum passing score:** 3.5/5.0

---

## Conflict Resolution Examples

### Example 1: Button Ripple Effect

**ui-core:**
```typescript
MuiButtonBase: {
  styleOverrides: {
    root: { /* standard ripple */ }
  }
}
```

**todox:**
```typescript
MuiButtonBase: {
  styleOverrides: {
    root: {
      '& .MuiTouchRipple-root': {
        color: 'color-mix(in oklch, currentColor, transparent 60%)'
      }
    }
  }
}
```

**Decision:** MERGE - This is additive (enhances ripple with modern CSS).

### Example 2: TextField Size

**ui-core:**
```typescript
size: { large: { /* ui-core definition */ } }
```

**todox:**
```typescript
size: { large: { /* different definition */ } }
```

**Decision:** SKIP - ui-core wins for existing properties.

### Example 3: Dialog Centering

**ui-core:** No centering override

**todox:**
```typescript
'& .MuiDialog-container': {
  alignItems: 'center !important'
}
```

**Decision:** MERGE - Net-new feature (centering fix).

---

## Phase 2 Context Budget Tracker

Track orchestrator resource usage during Phase 2 to avoid context exhaustion:

| Metric | Current | Yellow Zone | Red Zone | Action at Red |
|--------|---------|-------------|----------|---------------|
| Direct tool calls | 0 | 11-15 | 16+ | Delegate to sub-agent |
| Large file reads (>200 lines) | 0 | 3-4 | 5+ | Use codebase-researcher |
| Sub-agent delegations | 0 | 6-8 | 9+ | Create sub-phase |
| Components reviewed | 0/18 | - | - | Continue |
| Estimated token usage | 0 | 2.5K-3.5K | 3.5K+ | Create HANDOFF_P3 |

**Yellow Zone**: Proceed with caution, consider batching
**Red Zone**: Stop, apply action before continuing

---

## Phase 2 Success Criteria

- [ ] All 18 overlapping components reviewed using this rubric
- [ ] Each component has documented Decision column
- [ ] Net-new features identified and merged
- [ ] Conflicts documented (ui-core preserved)
- [ ] Quality score ≥ 3.5/5.0
- [ ] Context budget stayed in acceptable zone
- [ ] `bun run check --filter @beep/ui-core` passes
