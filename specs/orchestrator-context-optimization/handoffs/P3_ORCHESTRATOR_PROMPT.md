# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 (Validation) implementation.

---

## Prompt

You are implementing Phase 3 (Validation) of the Orchestrator Context Optimization spec.

### Context

Phase 2 integrated orchestrator delegation rules into the project's specification documentation:

- **SPEC_CREATION_GUIDE.md**: Added "Orchestrator Delegation Rules" section, "Phase Sizing Constraints" section, and anti-patterns 11-13
- **HANDOFF_STANDARDS.md**: Added "Context Budget Protocol" section, "Context Budget Checklist", and "Intra-Phase Checkpoints" section

### Your Mission

Validate that the Phase 2 integration is:
1. **Complete**: All specified sections exist at correct locations
2. **Coherent**: New sections don't contradict existing content
3. **Consistent**: Style matches existing document formatting
4. **Actionable**: Rules can be followed by future orchestrators

### Work Items (Max 5)

| # | Task | Approach | Output |
|---|------|----------|--------|
| 1 | Documentation review | Delegate to `spec-reviewer` | `outputs/documentation-review.md` |
| 2 | Cross-reference check | Manual verification | Report |
| 3 | Simulated orchestration test | Execute mini-task following new rules | `outputs/orchestration-test.md` |
| 4 | Final reflection | Update REFLECTION_LOG.md | Updated file |
| 5 | Spec completion assessment | Determine if more phases needed | Decision |

### Critical Verification Commands

```bash
# Verify all sections exist
grep -n "## Orchestrator Delegation Rules" specs/SPEC_CREATION_GUIDE.md
grep -n "## Phase Sizing Constraints" specs/SPEC_CREATION_GUIDE.md
grep -n "### 11\. Orchestrator Doing Research" specs/SPEC_CREATION_GUIDE.md
grep -n "## Context Budget Protocol" specs/HANDOFF_STANDARDS.md
grep -n "## Intra-Phase Checkpoints" specs/HANDOFF_STANDARDS.md
```

### Delegation Matrix

| Task | Delegate To | Rationale |
|------|-------------|-----------|
| Documentation review | `spec-reviewer` | Validates spec structure and quality |
| Simulated test design | Manual | Small scope, 2-3 tool calls |
| Cross-reference | Manual | Requires reading both files |

### Success Criteria

Phase 3 is complete when:
- [ ] `spec-reviewer` confirms documentation quality
- [ ] No contradictions found between new and existing content
- [ ] Mini-orchestration test validates rules work in practice
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] Spec marked COMPLETE or Phase 4 handoffs created

### Handoff Document

Read full context in: `specs/orchestrator-context-optimization/handoffs/HANDOFF_P3.md`

### After Phase 3

If spec is COMPLETE:
1. Update README.md with completion status
2. Final REFLECTION_LOG.md entry
3. Consider applying rules to existing specs

If additional phases needed:
1. Create HANDOFF_P4.md
2. Create P4_ORCHESTRATOR_PROMPT.md
