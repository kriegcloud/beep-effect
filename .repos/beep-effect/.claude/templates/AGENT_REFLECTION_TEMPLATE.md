# Agent Reflection: [Task Name]

**Date**: YYYY-MM-DD
**Agent Role**: [Agent name or role, e.g., "sign-out-handler-agent", "schema-writer"]
**Spec**: [Spec name, e.g., "full-iam-client"]
**Phase**: [Phase number and name, e.g., "Phase 1: Handler Implementation"]

---

## Task Summary

- **Handler type**: [e.g., "No-payload factory pattern", "With-payload factory pattern", "Manual handler"]
- **Files created**:
  - `path/to/file1.ts`
  - `path/to/file2.ts`
- **Type check result**: PASS / FAIL
- **Lint result**: PASS / FAIL

---

## What Worked Well

1. [Pattern or guidance that helped - be specific]
   - Example: "Factory pattern reduced handler from ~20 lines to ~8 lines"

2. [Another success - reference spec sections if applicable]
   - Example: "Spec's schema selection table immediately clarified `S.Date` vs `S.DateFromString`"

3. [Additional wins]

---

## Issues Encountered

### Issue 1: [Title] (SEVERITY: CRITICAL / HIGH / MEDIUM / LOW)

- **Problem**: [Detailed description of what went wrong]
- **Resolution**: [How the issue was resolved - steps taken]
- **Spec Fix**: [Suggested improvement to spec to prevent this issue]
  - Before: [Quote from spec if applicable]
  - After: [Proposed improvement]

### Issue 2: [Title] (SEVERITY)

- **Problem**: [Description]
- **Resolution**: [Solution]
- **Spec Fix**: [Recommendation]

[Add more issues as needed]

---

## Spec Improvement Suggestions

### Suggestion 1: [Title]

**Current State**: [Quote from spec or describe gap]

**Proposed Change**: [Specific improvement with example if applicable]

**Rationale**: [Why this would help future agents]

### Suggestion 2: [Title]

[Follow same structure]

---

## Prompt Improvement Suggestions

### Prompt Change 1

**Original instruction**: [Quote exact text from orchestrator prompt or spec]

**Problem**: [What was unclear or misleading]

**Refined instruction**: [Improved version]

**Example**: [If applicable, show before/after code example]

### Prompt Change 2

[Follow same structure]

---

## Time/Effort Assessment

- **Estimated complexity**: Low / Medium / High
- **Actual complexity**: Low / Medium / High
- **Key friction points**:
  1. [Specific task that took longer than expected]
  2. [Another friction point]

- **Time breakdown**:
  - Understanding requirements: [X minutes]
  - Implementation: [X minutes]
  - Debugging/fixing: [X minutes]
  - Documentation: [X minutes]

---

## Additional Notes

[Any other observations, patterns discovered, or context that might be useful for future agents or orchestrators]

---

## Verification Checklist

- [ ] Type check passes (`bun run check`)
- [ ] Lint passes (`bun run lint`)
- [ ] All files follow Effect patterns (namespace imports, no native methods)
- [ ] Handler matches spec examples
- [ ] Error handling follows `IamError` patterns
- [ ] Session mutations notify `$sessionSignal`
