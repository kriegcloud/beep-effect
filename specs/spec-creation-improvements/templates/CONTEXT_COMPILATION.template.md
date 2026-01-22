# Context Compilation Template

> Template for compiling phase handoff context following the tiered memory model.

---

## Usage

Copy this template when creating `HANDOFF_P[N].md` files. Replace placeholders with actual content.

**Key Principles:**

1. **Select**: Include only phase-relevant information
2. **Compress**: Rolling summary updated each phase (extractive compression)
3. **Position**: Critical context at document start/end (avoid "lost in middle")
4. **Budget**: Enforce token limits per memory type

---

## Rolling Summary (REQUIRED - Update Each Phase)

> This section persists across all phases. Update after each phase completion.
> Keep compressed: max 10 bullet points total.

**Spec Name**: {{SPEC_NAME}}
**Current Phase**: {{CURRENT_PHASE}} of {{TOTAL_PHASES}}
**Status**: {{STATUS}}

### Key Decisions Made

<!-- Extractive summary: preserve original phrasing, remove redundancy -->

- Phase 1: {{DECISION_1}}
- Phase 2: {{DECISION_2}}
- ...

### Active Constraints

<!-- Constraints that affect remaining phases -->

- {{CONSTRAINT_1}}
- {{CONSTRAINT_2}}

### Accumulated Patterns

<!-- Patterns discovered during execution -->

- {{PATTERN_1}}: {{BRIEF_DESCRIPTION}}

---

## Working Context (≤2,000 tokens)

> Include directly in next session's prompt. Most critical for immediate task success.
> Position: FIRST 25% of document.

### Current Phase Mission

{{MISSION_STATEMENT}}

### Tasks for Phase {{NEXT_PHASE}}

| # | Task | Complexity | Agent |
|---|------|------------|-------|
| 1 | {{TASK_1}} | {{S/M/L}} | {{AGENT}} |
| 2 | {{TASK_2}} | {{S/M/L}} | {{AGENT}} |

### Success Criteria

- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}

### Blocking Issues

<!-- Empty if none -->

- {{BLOCKER_1}}: {{RESOLUTION_PATH}}

### Critical Files

| File | Relevance |
|------|-----------|
| `{{FILE_PATH_1}}` | {{WHY_RELEVANT}} |
| `{{FILE_PATH_2}}` | {{WHY_RELEVANT}} |

---

## Episodic Context (≤1,000 tokens)

> Reference when historical context matters. Not needed for every task.
> Position: MIDDLE 50% of document.

### Phase {{PREV_PHASE}} Summary

**Completed**: {{COMPLETION_SUMMARY}}

**Duration**: {{DURATION}}

**Key Outcomes**:

- {{OUTCOME_1}}
- {{OUTCOME_2}}

### Decisions Requiring Context

<!-- Decisions that might need explanation for next phase -->

| Decision | Rationale | Phase |
|----------|-----------|-------|
| {{DECISION}} | {{WHY}} | {{N}} |

### Patterns Discovered

<!-- Patterns that might apply to remaining phases -->

| Pattern | Evidence | Applicability |
|---------|----------|---------------|
| {{PATTERN}} | {{WHERE_OBSERVED}} | {{WHEN_TO_USE}} |

---

## Semantic Context (≤500 tokens)

> Persistent project knowledge. Rarely changes between phases.
> Only include if non-obvious or project-specific.

### Tech Stack

<!-- Only if unusual or non-default -->

- Runtime: {{RUNTIME}}
- Core: {{CORE_TECH}}
- Relevant packages: {{PACKAGES}}

### Architectural Constraints

<!-- Only constraints affecting this spec -->

- {{CONSTRAINT_1}}
- {{CONSTRAINT_2}}

### Naming Conventions

<!-- Only if non-standard for this domain -->

- Files: {{FILE_NAMING}}
- Schemas: {{SCHEMA_NAMING}}

---

## Procedural Context (Links Only)

> Point to documentation, NEVER inline. Links don't count toward token budget.
> Position: LAST 25% of document.

### Required Reading

| Topic | Documentation | Priority |
|-------|---------------|----------|
| Effect Patterns | `.claude/rules/effect-patterns.md` | HIGH |
| Testing | `.claude/commands/patterns/effect-testing-patterns.md` | HIGH |
| {{DOMAIN_TOPIC}} | `{{PATH}}` | {{PRIORITY}} |

### Reference Implementations

| Pattern | Example File | Relevant Lines |
|---------|--------------|----------------|
| {{PATTERN}} | `{{FILE_PATH}}` | {{LINE_RANGE}} |

---

## Verification Commands

```bash
# Run after completing phase tasks
{{VERIFY_COMMAND_1}}
{{VERIFY_COMMAND_2}}
```

---

## Token Budget Verification

Before finalizing this handoff, verify token counts:

| Section | Budget | Actual | Status |
|---------|--------|--------|--------|
| Rolling Summary | ~300 | {{ACTUAL}} | [ ] |
| Working Context | ≤2,000 | {{ACTUAL}} | [ ] |
| Episodic Context | ≤1,000 | {{ACTUAL}} | [ ] |
| Semantic Context | ≤500 | {{ACTUAL}} | [ ] |
| **Total** | **≤4,000** | {{TOTAL}} | [ ] |

### Verification Checklist

- [ ] Rolling summary is up-to-date
- [ ] Working context has clear tasks and criteria
- [ ] Episodic context compressed (no verbatim history)
- [ ] Semantic context minimal (only unusual items)
- [ ] Procedural context uses links only
- [ ] Critical information at document start (Working) and end (Verification)
- [ ] Total ≤4,000 tokens

---

## Next Phase Preview (Optional)

> Brief preview to help with planning. Not counted in token budget.

**Phase {{NEXT_PHASE + 1}}**: {{BRIEF_DESCRIPTION}}

---

## Template Usage Notes

### When to Use This Template

- Multi-session specs (2+ phases)
- Specs with 3+ agents involved
- Specs requiring knowledge transfer between sessions

### When NOT to Use

- Single-session specs (use simple README + task list)
- Pure research/exploration tasks

### Compression Strategies

1. **Extractive** (safest): Keep original phrasing, remove redundancy
2. **Summarization**: Condense to key points (use for episodic history)
3. **Linking**: Replace inline content with documentation links

### Common Mistakes

- Including full code in Working Context (use file references)
- Repeating stable semantic context in every phase
- Inline procedural content instead of links
- Not updating Rolling Summary after each phase
