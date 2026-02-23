# Rubrics — Agent Context Optimization

> Evaluation criteria for spec phases and outputs.

---

## Phase Completion Rubrics

### Phase 1: Git Subtree Setup

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Subtree exists at `.repos/effect/` | 30% | Directory contains Effect source | Directory missing or empty |
| Source is searchable | 20% | `grep` finds patterns in source | Source not accessible |
| Tooling doesn't break | 25% | `bun run check` passes | Build/lint failures |
| Documentation created | 15% | `subtree-workflow.md` exists | No documentation |
| Reflection updated | 10% | REFLECTION_LOG.md has Phase 1 entry | No entry |

**Pass Threshold**: 70% (all required criteria)

### Phase 2: Module Context Generation

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Tier 1 modules documented | 30% | 4 context files exist | Missing Tier 1 files |
| Tier 2 modules documented | 20% | 5 context files exist | Missing Tier 2 files |
| Context follows template | 20% | All files have required sections | Inconsistent structure |
| Index created | 15% | `context/INDEX.md` links all files | Missing or incomplete index |
| Reflection updated | 15% | REFLECTION_LOG.md has Phase 2 entry | No entry |

**Pass Threshold**: 75% (Tier 1 + index required)

### Phase 3: Index Enhancement

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Context Navigation added | 35% | Section exists in AGENTS.md | Section missing |
| Context files linked | 25% | All `context/*.md` linked | Broken or missing links |
| Skills linked | 20% | Skills organized by category | No skill links |
| Specs linked | 10% | Active specs listed | No spec links |
| Reflection updated | 10% | REFLECTION_LOG.md has Phase 3 entry | No entry |

**Pass Threshold**: 70% (navigation section required)

### Phase 4: Validation & Refinement

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| All subtrees accessible | 20% | Files readable and searchable | Access issues |
| All context accurate | 25% | Patterns match codebase usage | Outdated or incorrect |
| Index complete | 20% | No broken links | Broken links found |
| Build passes | 15% | `bun run check` clean | Build errors |
| Maintenance documented | 20% | Workflow doc complete | Missing documentation |

**Pass Threshold**: 80% (higher bar for final phase)

---

## Context File Quality Rubric

Each context file is scored on these dimensions:

| Dimension | Points | Criteria |
|-----------|--------|----------|
| **Completeness** | 0-25 | All template sections present |
| **Accuracy** | 0-30 | Patterns match Effect source and codebase usage |
| **Examples** | 0-20 | Concrete, runnable examples from codebase |
| **Anti-patterns** | 0-15 | Clear guidance on what NOT to do |
| **Linking** | 0-10 | Links to source and related context |

**Score Interpretation**:
- 90-100: Production ready
- 75-89: Acceptable, minor improvements needed
- 50-74: Needs revision
- 0-49: Major rewrite required

---

## Index Quality Rubric

| Dimension | Points | Criteria |
|-----------|--------|----------|
| **Coverage** | 0-30 | All resources (context, skills, specs) linked |
| **Organization** | 0-25 | Logical grouping and hierarchy |
| **Navigation** | 0-20 | Easy to find resources |
| **Accuracy** | 0-15 | All links work |
| **Maintenance** | 0-10 | Clear update instructions |

---

## Handoff Quality Rubric

Each handoff pair (HANDOFF + ORCHESTRATOR_PROMPT) is scored:

| Dimension | Points | Criteria |
|-----------|--------|----------|
| **Context** | 0-25 | Previous phase summary complete |
| **Mission** | 0-25 | Clear objectives and scope |
| **Tasks** | 0-20 | Actionable with agent assignments |
| **Verification** | 0-15 | Clear success criteria |
| **Exit criteria** | 0-15 | Handoff requirements stated |

**Score Interpretation**:
- 90-100: Ready for fresh agent session
- 75-89: Usable with minor clarification
- 50-74: Needs significant expansion
- 0-49: Rewrite required

---

## Spec Quality Gates

| Gate | Minimum Score | Required For |
|------|---------------|--------------|
| Handoff Quality | 75% | Phase transition |
| Context File Quality | 75% | Phase 2 completion |
| Index Quality | 80% | Phase 3 completion |
| Overall Phase | Varies | Phase completion |

---

## Reflection Quality Indicators

| Indicator | Good | Needs Improvement |
|-----------|------|-------------------|
| Specificity | Concrete examples | Vague statements |
| Actionability | Clear next steps | Observations only |
| Pattern extraction | Named, reusable patterns | One-off notes |
| Honesty | Admits failures | Only successes |
