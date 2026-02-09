# Spec Review Rubric / Scoring Guidance (Repository Sources)

## What I found (explicit 5/5 rubric)

### Agent Definition Quality rubric (wealth-management-domain-expert)
This is the only explicit 5/5 scoring rubric under the requested directories. It defines four weighted dimensions totaling 100%, with explicit 5/5 criteria, a verification checklist, and minimum acceptance thresholds.

**Dimensions and 5/5 criteria**
- **Frontmatter Correctness (25%)**: 5/5 requires valid YAML including `name`, `description`, `model`, `tools`. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L9-L17)
- **Description Clarity (25%)**: 5/5 requires clear “when to use” criteria, specific use cases, and good formatting. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L19-L27)
- **Domain Knowledge Coverage (30%)**: 5/5 requires all core entities, relationships, account types, trust types, and compliance awareness. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L29-L37)
- **Response Guidelines (20%)**: 5/5 requires clear guidelines appropriate to the domain expert role and compliance awareness. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L39-L47)

**Verification checklist**
Use this as a gating checklist; it includes file existence, frontmatter parsing, name/description/tool/model checks, and domain prompt coverage. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L51-L63)

**Minimum acceptance**
- Overall score ≥ 70%
- No dimension below 50%
- All checklist items satisfied
(specs/agents/wealth-management-domain-expert/RUBRICS.md#L67-L71)

## Broader scoring guidance (spec-related)

### Reflection system quality rubric (102-point)
This is a general scoring rubric used for reflection entries and pattern candidates, not a “spec review” per se, but it is the repo’s only detailed multi-category scoring framework related to spec execution quality.

**8-category rubric (102 points max)**
- Completeness (15)
- Actionability (20)
- Reproducibility (15)
- Generalizability (15)
- Evidence (15)
- Format (10)
- Integration (12)
(specs/_guide/patterns/reflection-system.md#L137-L154)

**Promotion thresholds** (used to decide whether to promote patterns or keep them local)
- 90–102: production-ready → create skill
- 75–89: validated → add to pattern registry
- 50–74: promising → keep in spec
- 0–49: needs work
(specs/_guide/README.md#L709-L725)

**Scoring guidance by category**
The reflection system provides explicit scoring criteria per category (e.g., actionability requires step-by-step instructions and examples for full points). (specs/_guide/patterns/reflection-system.md#L156-L218)

## How to apply the rubric in a spec review

### If the review is for an agent definition (matches the 5/5 rubric)
1. Score each of the 4 dimensions (Frontmatter, Description, Domain Knowledge, Response Guidelines) on a 1–5 scale using the 5/5 criteria as the anchor. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L9-L47)
2. Apply weights (25/25/30/20) and compute overall %. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L7-L47)
3. Verify every checklist item; if any fail, the review is not passing. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L51-L63)
4. Enforce minimum acceptance: overall ≥ 70%, no dimension < 50%, checklist all satisfied. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L67-L71)

### If the review is about spec execution quality / reflection artifacts
1. Score the reflection entry using the 8-category, 102-point rubric. (specs/_guide/patterns/reflection-system.md#L137-L218)
2. Use the thresholds to determine promotion destination for patterns. (specs/_guide/README.md#L709-L725)
3. Record the score and ensure findings are scored as part of evaluation, consistent with phase gate expectations. (specs/_guide/README.md#L709-L733)

## Practical guidance and limitations

- The 5/5 rubric is scoped to a specific agent definition output and may not generalize to full spec reviews. If you need a dedicated spec-reviewer rubric, it is not present in the scanned directories; consider formalizing one or reusing the reflection rubric as a stand-in for scoring spec review artifacts. (specs/agents/wealth-management-domain-expert/RUBRICS.md#L1-L71, specs/_guide/patterns/reflection-system.md#L137-L218)
