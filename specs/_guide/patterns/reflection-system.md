# Reflection System

> Structured reflection schema, quality scoring rubric, and skill promotion workflow for extracting reusable patterns from spec execution.

---

## Overview

The reflection system implements "Reflexion" - verbal reinforcement learning via episodic memory. It enables:
1. **Machine-readable analysis**: Pattern extraction and skill promotion workflows
2. **Cross-spec learning**: Patterns discovered in one spec benefit future specs
3. **Quality scoring**: Objective assessment of pattern maturity

---

## Reflection Schema

### Entry Schema

Each reflection entry should follow this JSON-compatible structure:

```json
{
  "id": "refl-YYYY-MM-DD-NNN",
  "phase": "Phase N",
  "outcome": "success | partial | failure",
  "task": "Task description",
  "duration_minutes": 45,
  "reflection": {
    "what_worked": [
      "Specific technique that succeeded",
      "Another successful approach"
    ],
    "what_failed": [
      "Technique that failed and why"
    ],
    "key_insight": "Single most important learning from this phase",
    "pattern_candidate": {
      "name": "kebab-case-pattern-name",
      "description": "What the pattern does",
      "applicability": "When to use this pattern",
      "confidence": "high | medium | low"
    }
  },
  "skill_extraction": {
    "ready_for_promotion": true,
    "quality_score": 82,
    "suggested_skill_name": "skill-name"
  }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier: `refl-YYYY-MM-DD-NNN` |
| `phase` | string | Phase identifier: `Phase 0`, `Phase 1`, etc. |
| `outcome` | enum | `success`, `partial`, or `failure` |
| `task` | string | Description of the task performed |
| `reflection.what_worked` | array | List of successful techniques |
| `reflection.what_failed` | array | List of failed techniques with reasons |
| `reflection.key_insight` | string | Most important learning |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `duration_minutes` | number | Time spent on the phase |
| `reflection.pattern_candidate` | object | Pattern ready for extraction |
| `skill_extraction` | object | Skill promotion assessment |

### Pattern Candidate Fields

When a technique is mature enough to become a reusable pattern:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | kebab-case identifier |
| `description` | string | What the pattern achieves |
| `applicability` | string | Conditions for using pattern |
| `confidence` | enum | `high` (3+ uses), `medium` (2 uses), `low` (1 use) |

### Skill Extraction Fields

For patterns ready to become standalone skills:

| Field | Type | Description |
|-------|------|-------------|
| `ready_for_promotion` | boolean | Meets quality threshold |
| `quality_score` | number | Score from 102-point rubric |
| `suggested_skill_name` | string | Name for SKILL.md file |

### Example Entry (Markdown Format)

In REFLECTION_LOG.md, format as markdown tables for readability:

```markdown
### Phase 0: Research Validation

**ID**: `refl-2026-01-21-001`
**Outcome**: success
**Duration**: ~90 minutes

#### What Worked
- Parallel web searches reduced research time by ~60%
- Year-filtered queries (2025/2026) improved source relevance to 80%+
- Cross-referencing 3+ sources increased finding confidence to HIGH

#### What Failed
- Initial queries too broad ("AI memory" vs "AI agent memory patterns 2025")
- Direct URL fetch failed for some sites; search-based discovery more reliable

#### Key Insight
Year-filtered queries are essential for AI/ML research—without them, sources skew 2+ years old.

#### Pattern Candidate

| Field | Value |
|-------|-------|
| Name | `year-filtered-search` |
| Description | Always include year filter in research queries |
| Applicability | Research phases requiring recent sources |
| Confidence | high (validated across 6+ topics) |

#### Skill Extraction

| Field | Value |
|-------|-------|
| Ready | Yes |
| Quality Score | 85/102 |
| Suggested Name | `research-query-refinement` |
```

---

## Quality Scoring Rubric

### Purpose

The quality scoring rubric provides objective assessment of reflection entries and pattern candidates. Scores determine promotion eligibility to the pattern registry or skill library.

### 8-Category Rubric (102 Points Maximum)

| Category | Max Points | Criteria |
|----------|------------|----------|
| **Completeness** | 15 | All required schema fields present and populated |
| **Actionability** | 20 | Specific, executable recommendations; no vague guidance |
| **Reproducibility** | 15 | Steps can be followed by another agent without interpretation |
| **Generalizability** | 15 | Applies beyond current spec; useful across domains |
| **Evidence** | 15 | Backed by concrete outcomes, metrics, or test results |
| **Format** | 10 | Follows schema exactly; consistent structure |
| **Integration** | 12 | Links to related patterns; fits existing pattern ecosystem |
| **Total** | **102** | |

### Scoring Guidelines Per Category

#### Completeness (15 points)
| Score | Criteria |
|-------|----------|
| 15 | All required + all optional fields populated |
| 12 | All required fields + pattern_candidate |
| 9 | All required fields populated |
| 5 | Missing 1-2 required fields |
| 0 | Missing 3+ required fields |

#### Actionability (20 points)
| Score | Criteria |
|-------|----------|
| 20 | Step-by-step instructions; concrete examples; copy-paste ready |
| 15 | Clear instructions; 1-2 examples |
| 10 | General guidance; needs interpretation |
| 5 | Vague recommendations |
| 0 | No actionable content |

#### Reproducibility (15 points)
| Score | Criteria |
|-------|----------|
| 15 | Tested by 2+ different agents/sessions; documented variations |
| 12 | Tested by 1 agent in 2+ different contexts |
| 9 | Used successfully in original context |
| 5 | Theoretical; not yet tested |
| 0 | Known to fail in reproduction attempts |

#### Generalizability (15 points)
| Score | Criteria |
|-------|----------|
| 15 | Applies to 3+ different spec domains |
| 12 | Applies to 2 different spec domains |
| 9 | Applies to multiple phases within one domain |
| 5 | Specific to one phase/task type |
| 0 | Only applicable to original context |

#### Evidence (15 points)
| Score | Criteria |
|-------|----------|
| 15 | Quantitative metrics (e.g., "60% time reduction") |
| 12 | Qualitative evidence with specifics |
| 9 | Outcome description without metrics |
| 5 | Claimed success without details |
| 0 | No evidence provided |

#### Format (10 points)
| Score | Criteria |
|-------|----------|
| 10 | Perfect schema compliance; consistent naming |
| 7 | Minor formatting deviations |
| 4 | Significant structure issues |
| 0 | Does not follow schema |

#### Integration (12 points)
| Score | Criteria |
|-------|----------|
| 12 | Links to 2+ related patterns; extends existing ecosystem |
| 9 | Links to 1 related pattern |
| 6 | Standalone but compatible with ecosystem |
| 3 | Potential conflicts with existing patterns |
| 0 | Incompatible with pattern ecosystem |

### Promotion Thresholds

| Score Range | Status | Destination |
|-------------|--------|-------------|
| **90-102** | Production-ready | Create SKILL.md file in `.claude/skills/` |
| **75-89** | Validated | Add to `specs/PATTERN_REGISTRY.md` |
| **50-74** | Promising | Keep in spec-local REFLECTION_LOG |
| **0-49** | Needs work | Do not promote; iterate in spec |

---

## Skill Promotion Workflow

### Purpose

The skill promotion workflow extracts mature patterns from specification execution into reusable skills. This implements the "Reflexion" pattern: verbal reinforcement learning via episodic memory.

### Workflow Steps

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SKILL PROMOTION WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. EXTRACTION: Phase completion prompts pattern identification             │
│         ↓                                                                   │
│  2. SCORING: Apply 8-category rubric (102 points max)                       │
│         ↓                                                                   │
│  3. THRESHOLD CHECK: Score >= 75? Eligible for promotion                    │
│         ↓                                                                   │
│  4. PROMOTION: Add to registry (75-89) or create skill (90+)               │
│         ↓                                                                   │
│  5. VALIDATION: Cross-spec testing confirms generalizability               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 1: Extraction

At the end of EVERY phase, ask:

> "What patterns from this phase should become skills?"

Trigger questions to identify candidates:
- What technique saved the most time?
- What approach would benefit other specs?
- What failure revealed a reusable lesson?
- What workaround became a standard practice?

### Step 2: Scoring

Apply the 8-category rubric to each candidate:

```markdown
## Pattern Scoring: {{PATTERN_NAME}}

| Category | Score | Rationale |
|----------|-------|-----------|
| Completeness | /15 | |
| Actionability | /20 | |
| Reproducibility | /15 | |
| Generalizability | /15 | |
| Evidence | /15 | |
| Format | /10 | |
| Integration | /12 | |
| **Total** | **/102** | |
```

### Step 3: Threshold Check

Based on score, determine promotion destination:

```
if (score >= 90) {
  // Production-ready: Create SKILL.md
  destination = ".claude/skills/"
} else if (score >= 75) {
  // Validated: Add to pattern registry
  destination = "specs/PATTERN_REGISTRY.md"
} else {
  // Keep in spec-local reflection log
  destination = "specs/{SPEC_NAME}/REFLECTION_LOG.md"
}
```

### Step 4: Promotion

**For Pattern Registry (75-89 points)**:

Add entry to `specs/PATTERN_REGISTRY.md`:

```markdown
### {{pattern-name}}

| Field | Value |
|-------|-------|
| **ID** | `pattern-YYYY-NNN` |
| **Source** | {{spec-name}}, Phase {{N}} |
| **Quality Score** | {{score}}/102 |
| **Status** | Validated |

**Description**: {{description}}

**Applicable When**:
- {{use-case-1}}
- {{use-case-2}}

**Example**:
{{code-or-markdown-example}}

**Validation**:
- {{validation-evidence}}
```

**For Skill File (90+ points)**:

Create file at `.claude/skills/{{skill-name}}.md` using `specs/templates/SKILL.template.md`.

### Step 5: Validation

After promotion, validate cross-spec applicability:

1. **First validation**: Original spec continues using pattern successfully
2. **Second validation**: Different spec uses pattern successfully
3. **Status update**: Change from "Validated" to "Established" in registry

### Phase Completion Checklist

At the end of each phase, complete this checklist:

- [ ] REFLECTION_LOG.md updated with phase entry
- [ ] Pattern candidates identified
- [ ] Quality scores calculated for candidates
- [ ] Patterns scoring 75+ added to registry
- [ ] Patterns scoring 90+ have SKILL.md created
- [ ] Handoff documents created (HANDOFF_P[N+1].md + orchestrator prompt)

### Example Promotion Flow

**Scenario**: `year-filtered-search` pattern discovered in Phase 0

```
Phase 0 Complete
  ↓
Reflection: "Year-filtered queries improved relevance by 80%"
  ↓
Pattern candidate identified: year-filtered-search
  ↓
Scoring:
  - Completeness: 12/15 (all required fields)
  - Actionability: 18/20 (clear steps, examples)
  - Reproducibility: 15/15 (tested across 6 topics)
  - Generalizability: 12/15 (applies to all research phases)
  - Evidence: 15/15 ("80% relevance improvement")
  - Format: 7/10 (minor naming inconsistency)
  - Integration: 6/12 (standalone, compatible)
  Total: 85/102
  ↓
Threshold check: 85 >= 75 → Eligible for registry
  ↓
Added to specs/PATTERN_REGISTRY.md
  ↓
Validation: Used successfully in 3+ subsequent specs
  ↓
Status: "Established"
```

---

## Related Documentation

- [Spec Guide](../README.md) - Main spec workflow
- [PATTERN_REGISTRY](../PATTERN_REGISTRY.md) - Validated patterns
- [HANDOFF_STANDARDS](../HANDOFF_STANDARDS.md) - Context transfer standards
