# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] Phase 0 research outputs exist in `outputs/`
- [ ] All 6 research files have ≥5 sources each
- [ ] REFLECTION_LOG.md has Phase 0 learnings

---

## Prompt

You are executing Phase 1 (Foundation Implementation) of the Spec Creation Improvements spec.

### Context

Phase 0 validated research on 6 improvement areas. Phase 1 implements the low-effort, high-visibility foundations.

### Your Mission

Create foundational files and update SPEC_CREATION_GUIDE.md with visual/calculator improvements.

### Deliverables

1. `specs/llms.txt` - AI-readable spec index
2. Updated `SPEC_CREATION_GUIDE.md` with state machine visualization
3. Updated `SPEC_CREATION_GUIDE.md` with complexity calculator
4. `specs/PATTERN_REGISTRY.md` - Cross-spec pattern tracking

### Implementation Tasks

**Task 1.1: Create llms.txt**

Read `outputs/llms-txt-research.md` for structure guidance.

Create `specs/llms.txt` following the llmstxt.org specification:
- Markdown format
- Links to key spec files
- Brief descriptions
- Organized by category

**Task 1.2: Add State Machine Visualization**

Read `outputs/orchestration-patterns-research.md` for patterns.

Add to `SPEC_CREATION_GUIDE.md` after "Phase Overview":
- ASCII diagram showing phase transitions
- Conditional transition table
- Legend explaining transition types

**Task 1.3: Add Complexity Calculator**

Read `outputs/additional-patterns-research.md` for metrics.

Add to `SPEC_CREATION_GUIDE.md` in "Creating a New Spec":
- Factor/weight table
- Score calculation formula
- Threshold definitions (Simple/Medium/Complex)
- Example calculation

**Task 1.4: Create Pattern Registry**

Create `specs/PATTERN_REGISTRY.md` with:
- Table structure for patterns
- Initial entries from existing specs (full-iam-client, etc.)
- Guidelines for adding new patterns

### Reference Files

- Research: `outputs/llms-txt-research.md`
- Research: `outputs/orchestration-patterns-research.md`
- Research: `outputs/additional-patterns-research.md`
- Target: `specs/SPEC_CREATION_GUIDE.md`
- Example: `specs/full-iam-client/` (pattern source)

### Verification

```bash
# Verify llms.txt
cat specs/llms.txt

# Verify SPEC_CREATION_GUIDE updates
grep "State Machine" specs/SPEC_CREATION_GUIDE.md
grep "Complexity" specs/SPEC_CREATION_GUIDE.md

# Verify pattern registry
cat specs/PATTERN_REGISTRY.md
```

### Success Criteria

- [ ] `specs/llms.txt` created and follows spec
- [ ] State machine visualization in SPEC_CREATION_GUIDE.md
- [ ] Complexity calculator in SPEC_CREATION_GUIDE.md
- [ ] `specs/PATTERN_REGISTRY.md` created with entries
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P2.md created
- [ ] P2_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/spec-creation-improvements/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P2.md`
3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`
