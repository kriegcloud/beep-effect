# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 execution.

---

## Prompt

You are executing Phase 5 (Final Integration) of the Spec Creation Improvements spec.

### Context

Phases 1-4 implemented all major improvements. Phase 5 completes remaining work and verifies full integration.

### Your Mission

Complete dry run automation, populate pattern registry, and verify all improvements are integrated.

### Deliverables

1. Dry run automation protocol in `SPEC_CREATION_GUIDE.md`
2. Populated `specs/PATTERN_REGISTRY.md` with ≥5 patterns
3. Updated `specs/README.md`
4. Final verification of all improvements

### Implementation Tasks

**Task 5.1: Dry Run Protocol**

Add to SPEC_CREATION_GUIDE.md:
- Parse phase handoff for work items
- Select representative sample (2-3 items)
- Spawn validation agents
- Synthesize findings
- Rollback/proceed decision (>30% fail = revise)

**Task 5.2: Pattern Registry**

Populate `specs/PATTERN_REGISTRY.md` from existing specs:
- Factory Handler (full-iam-client)
- Source Verification (full-iam-client)
- Tiered Memory (this spec)
- Structured Reflection (this spec)
- Agent Signatures (this spec)

**Task 5.3: Final Verification**

Run verification checklist:
```bash
grep "State Machine" specs/SPEC_CREATION_GUIDE.md
grep "Complexity" specs/SPEC_CREATION_GUIDE.md
grep "Context Architecture" specs/HANDOFF_STANDARDS.md
grep "Dry Run" specs/SPEC_CREATION_GUIDE.md
cat specs/llms.txt
cat specs/PATTERN_REGISTRY.md
```

### Reference Files

- Research: `outputs/additional-patterns-research.md`
- Target: `specs/SPEC_CREATION_GUIDE.md`
- Target: `specs/PATTERN_REGISTRY.md`
- Target: `specs/README.md`

### Success Criteria

- [ ] Dry run protocol in guide
- [ ] Pattern registry with ≥5 patterns
- [ ] README.md updated
- [ ] All verification commands pass
- [ ] REFLECTION_LOG.md updated with final learnings
- [ ] Spec marked as "Complete" in README

### Handoff Document

Read full context in: `specs/spec-creation-improvements/handoffs/HANDOFF_P5.md`

### Post-Completion

After Phase 5:
1. Mark spec as "Complete" in `specs/README.md`
2. Consider `/new-spec` skill creation
3. Archive or link research outputs
