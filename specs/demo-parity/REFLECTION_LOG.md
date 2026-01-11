# Demo Parity: Reflection Log

> Accumulated learnings from each phase execution

## Reflection Protocol

After each phase, record:
1. **What Worked** - Techniques that succeeded
2. **What Didn't Work** - Approaches that failed
3. **Methodology Improvements** - How to do it better next time
4. **Prompt Refinements** - Improved sub-agent prompts
5. **Codebase-Specific Insights** - Patterns specific to this codebase

### When to Add Entries

- After completing each phase (P0, P1, P2, etc.)
- After any significant debugging session (> 30 minutes)
- When discovering a pattern that contradicts existing assumptions
- Before creating a HANDOFF document (mandatory)

### Entry Template

```markdown
### YYYY-MM-DD - P[N] [Phase Name] Reflection

#### What Worked
- [Technique or approach that succeeded]

#### What Didn't Work
- [Approach that failed or was suboptimal]

#### Methodology Improvements
- [How to do it better next time]

#### Prompt Refinements
- [Specific prompt text improvements]

#### Codebase-Specific Insights
- [Patterns unique to this codebase]
```

---

## Reflection Entries

> Format: `YYYY-MM-DD - P[N] [Phase Name] Reflection` (e.g., P0, P1, P2)

### Template Entry (Delete after first real entry)

#### What Worked
- [To be filled after first phase]

#### What Didn't Work
- [To be filled after first phase]

#### Methodology Improvements
- [To be filled after first phase]

#### Prompt Refinements
- [To be filled after first phase]

#### Codebase-Specific Insights
- [To be filled after first phase]

---

## Accumulated Improvements

> Apply these updates to the respective files. Check off items as completed.

### ORCHESTRATION_PROMPT.md Updates

- [ ] [To be filled based on learnings]

### AGENT_PROMPTS.md Updates

- [ ] [To be filled based on learnings]

### CONTEXT.md Updates

- [ ] [To be filled based on learnings]

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques

1. [To be determined]
2. [To be determined]
3. [To be determined]

### Top 3 Wasted Efforts

1. [To be determined]
2. [To be determined]
3. [To be determined]

### Recommended Changes for Next Session

1. [To be determined]
2. [To be determined]
3. [To be determined]

---

## Pre-Existing Knowledge (From Related Specs)

### From docking-system Spec

Learnings that may apply to demo parity:

1. **Sub-agent delegation effective** - effect-code-writer handles focused implementation tasks well
2. **Exploration agents before implementation** - Gather comprehensive context first
3. **Run verification after EACH task** - Don't batch verifications
4. **Legacy line-number references in prompts** - Sub-agents navigate directly to relevant code
5. **Compress results immediately** - Preserve orchestrator context

### From flex-layout-port Spec

Relevant patterns:

1. **Schema class runtime methods** - Instance methods added directly to class body
2. **Option types extensively used** - Prefer `O.getOrElse` over `O.getOrUndefined`
3. **Type guards exist** - `isTabSetNode`, `isTabNode`, etc. in model/model.ts
4. **Border hit testing** - Uses orientation-aware logic (VERT/HORZ)
5. **Cross-window coordination** - Static `dragState` pattern, no postMessage needed

---

## Verification Checklist

Before creating a HANDOFF document, verify:

- [ ] New reflection entry added with today's date
- [ ] All 5 categories filled out (What Worked, What Didn't, Methodology, Prompts, Codebase)
- [ ] Accumulated Improvements updated with new items
- [ ] Lessons Learned Summary reviewed and updated if needed
- [ ] File links in Accumulated Improvements section are valid
