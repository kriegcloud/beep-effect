# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] Phase 1 deliverables exist (`specs/llms.txt`, `specs/PATTERN_REGISTRY.md`)
- [ ] State machine and complexity calculator in SPEC_CREATION_GUIDE.md
- [ ] REFLECTION_LOG.md has Phase 1 learnings

---

## Prompt

You are executing Phase 2 (Context Engineering Integration) of the Spec Creation Improvements spec.

### Context

Phase 1 implemented foundation files (llms.txt, state machine, complexity calculator, pattern registry). Phase 2 implements tiered context architecture based on research findings.

### Your Mission

Implement tiered memory model and context compilation protocol for multi-session spec handoffs.

### Deliverables

1. Updated `specs/HANDOFF_STANDARDS.md` with tiered memory model
2. New `templates/CONTEXT_COMPILATION.template.md`
3. Updated `specs/SPEC_CREATION_GUIDE.md` with context budget guidelines
4. Updated `specs/SPEC_CREATION_GUIDE.md` with context hoarding anti-pattern

### Implementation Tasks

**Task 2.1: Add Tiered Memory Model to HANDOFF_STANDARDS.md**

Read `outputs/context-engineering-research.md` for the four memory types.

Add new "Context Architecture" section with:
- Memory type definitions (Working, Episodic, Semantic, Procedural)
- Template sections for each type
- Token budget guidelines

**Task 2.2: Create Context Compilation Template**

Create `templates/CONTEXT_COMPILATION.template.md` with:
- Rolling summary section (updated each phase)
- Working/Episodic/Semantic/Procedural sections
- Token budget verification checklist
- Placement guidelines (critical info at start/end)

**Task 2.3: Add Context Budget Guidelines**

Add to `specs/SPEC_CREATION_GUIDE.md`:
- Token budget table (Working ≤2K, Episodic ≤1K, Semantic ≤500)
- Placement guidelines for "lost in middle" mitigation
- Total handoff budget (≤4K tokens)

**Task 2.4: Add Context Hoarding Anti-Pattern**

Add to `specs/SPEC_CREATION_GUIDE.md` Anti-Patterns section:
- "Context Hoarding" anti-pattern
- Wrong pattern: Full history in every handoff
- Right pattern: Compressed rolling summary + phase-specific

### Critical Patterns

**Memory Type Mapping**:
```markdown
| Memory Type | Definition | Spec Equivalent |
|-------------|------------|-----------------|
| Working | Current context window | Phase tasks, criteria |
| Episodic | Interaction history | Previous phase outcomes |
| Semantic | Accumulated knowledge | Project constants |
| Procedural | Action patterns | Links to docs/patterns |
```

**Token Budget**:
```markdown
| Type | Budget |
|------|--------|
| Working | ≤2,000 |
| Episodic | ≤1,000 |
| Semantic | ≤500 |
| Procedural | Links only |
| Total | ≤4,000 |
```

### Reference Files

- Research: `outputs/context-engineering-research.md`
- Target: `specs/HANDOFF_STANDARDS.md`
- Target: `specs/SPEC_CREATION_GUIDE.md`
- Template: `templates/CONTEXT_COMPILATION.template.md` (create)

### Verification

```bash
# Verify HANDOFF_STANDARDS.md updated
grep -A 30 "Context Architecture" specs/HANDOFF_STANDARDS.md

# Verify template created
cat specs/spec-creation-improvements/templates/CONTEXT_COMPILATION.template.md

# Verify SPEC_CREATION_GUIDE.md updated
grep "Context Budget" specs/SPEC_CREATION_GUIDE.md
grep "Context Hoarding" specs/SPEC_CREATION_GUIDE.md
```

### Success Criteria

- [ ] HANDOFF_STANDARDS.md has tiered memory model
- [ ] `templates/CONTEXT_COMPILATION.template.md` created
- [ ] SPEC_CREATION_GUIDE.md has context budget guidelines
- [ ] SPEC_CREATION_GUIDE.md has context hoarding anti-pattern
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P3.md created
- [ ] P3_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/spec-creation-improvements/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P3.md`
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`
