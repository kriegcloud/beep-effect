# Gap Analysis

> This document will be populated by the comparison agent.
> See AGENT_PROMPT.md for instructions.

## Status: PENDING

---

## Expected Contents

This document will contain prioritized gaps with complexity estimates:

1. **Executive Summary**
   - High-level findings
   - Key statistics
   - Critical recommendations

2. **P0 Gaps (Critical)**
   - Capabilities essential for core functionality
   - Detailed analysis with file references
   - Impact assessment
   - Implementation complexity rationale

3. **P1 Gaps (Important)**
   - Capabilities important for production use
   - Same detailed format as P0

4. **P2 Gaps (Nice to Have)**
   - Capabilities that improve UX/functionality
   - Abbreviated format

5. **P3 Gaps (Future)**
   - Capabilities for future consideration
   - Brief descriptions

---

## Template

When populated, this document will follow this structure:

```markdown
## Executive Summary

[2-3 paragraphs summarizing findings]

Key Statistics:
- Total gaps identified: ?
- P0 (Critical): ?
- P1 (Important): ?
- P2 (Nice to Have): ?
- P3 (Future): ?

Estimated total implementation effort: ? weeks

## P0 Gaps (Critical)

### [Gap Name]

**Description**: What capability is missing or incomplete

**effect-ontology Reference**:
- `Service/SomeService.ts` - Main implementation
- `Domain/Model/SomeModel.ts` - Data structures

**knowledge-slice Current State**:
- Status: Missing | Partial
- Existing code: (file references if any)

**Impact**:
- Why this matters for the product
- What features are blocked

**Complexity**: L
- Rationale for complexity estimate
- Key challenges

**Dependencies**:
- Must complete X before this
- Soft dependency on Y

**Estimated Effort**: 2 weeks

---

[...additional P0 gaps...]

## P1 Gaps (Important)

[Same format as P0]

## P2 Gaps (Nice to Have)

### [Gap Name]
- Description: Brief description
- Complexity: S/M/L/XL
- Estimated Effort: X days/weeks

## P3 Gaps (Future)

### [Gap Name]
- Description: Brief description
- Rationale for deferral
```

---

## Completion Criteria

This document is complete when:
- [ ] All gaps from COMPARISON_MATRIX.md analyzed
- [ ] Every gap has priority classification
- [ ] Every gap has complexity estimate with rationale
- [ ] Dependencies mapped for L/XL gaps
- [ ] Executive summary accurately reflects findings
