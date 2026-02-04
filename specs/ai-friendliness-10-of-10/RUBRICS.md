# Quality Rubrics: AI-Friendliness 10/10

Evaluation criteria for all deliverables.

---

## ai-context.md Quality Rubric (30 points)

### Frontmatter (6 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Path correct | 2 | Matches actual file location |
| Summary informative | 2 | Searchable, under 100 chars |
| Tags appropriate | 2 | 3-5 relevant tags |

### Content Quality (18 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Overview clear | 3 | Purpose understood in 30 seconds |
| Architecture diagram | 3 | ASCII diagram present and accurate |
| Core modules listed | 3 | Key files documented |
| Usage pattern shown | 3 | At least 1 code example |
| Design decisions | 3 | Rationale for key choices |
| Dependencies accurate | 3 | Internal/external deps listed |

### Format Compliance (6 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Length appropriate | 2 | 50-100 lines |
| Links to AGENTS.md | 2 | Related section present |
| No duplication | 2 | Doesn't copy AGENTS.md content |

### Scoring

| Score | Quality Level |
|-------|---------------|
| 27-30 | Excellent |
| 22-26 | Good |
| 17-21 | Acceptable |
| < 17 | Needs revision |

---

## Error Catalog Entry Rubric (20 points)

### Identification (6 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| ID unique | 2 | {PREFIX}_{NNN} format |
| Pattern accurate | 2 | Regex matches real errors |
| Category correct | 2 | Appropriate classification |

### Documentation (10 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Description clear | 2 | What the error means |
| Diagnosis helpful | 2 | How to find root cause |
| Fix steps actionable | 3 | Ordered, specific steps |
| Example provided | 3 | Before/after code |

### Classification (4 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Fix type accurate | 2 | safe/unsafe/manual correct |
| Remediation level | 2 | trivial/easy/major appropriate |

### Scoring

| Score | Quality Level |
|-------|---------------|
| 18-20 | Production ready |
| 14-17 | Good |
| 10-13 | Needs improvement |
| < 10 | Incomplete |

---

## Onboarding Documentation Rubric (25 points)

### Completeness (10 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Effect primer | 3 | Core concepts explained |
| First contribution | 3 | Step-by-step guide |
| Common tasks | 2 | Patterns documented |
| Verification | 2 | Quality gates listed |

### Accessibility (10 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| No assumed knowledge | 3 | Terms defined |
| Progressive disclosure | 3 | Basics before advanced |
| Quick reference | 2 | Commands table |
| Links to resources | 2 | Points to detailed docs |

### Actionability (5 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Checklist format | 2 | Interactive checkboxes |
| Verification commands | 3 | Can validate completion |

### Scoring

| Score | Quality Level |
|-------|---------------|
| 22-25 | Excellent |
| 18-21 | Good |
| 13-17 | Acceptable |
| < 13 | Needs revision |

---

## Self-Healing Hook Rubric (25 points)

### Safety (10 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Only safe fixes | 4 | No semantic changes |
| Retry limits | 3 | Max 3 attempts |
| Rollback support | 3 | Can undo changes |

### Effectiveness (10 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Detection accurate | 4 | Correct error identification |
| Fix successful | 4 | Actually resolves issue |
| Logging complete | 2 | Actions are traceable |

### Integration (5 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Hook registered | 2 | In settings.json |
| Documentation | 3 | Behavior explained |

### Scoring

| Score | Quality Level |
|-------|---------------|
| 22-25 | Production ready |
| 18-21 | Good |
| 13-17 | Needs testing |
| < 13 | Not ready |

---

## Worked Example Rubric (15 points)

### Completeness (6 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Happy path | 2 | Normal case shown |
| Edge case | 2 | Boundary shown |
| Error case | 2 | Failure handled |

### Clarity (6 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Code compiles | 2 | Valid TypeScript |
| Comments helpful | 2 | Explain key points |
| Output shown | 2 | What to expect |

### Relevance (3 points)

| Criterion | Points | Pass Condition |
|-----------|--------|----------------|
| Matches rule | 2 | Demonstrates the pattern |
| Real-world | 1 | Practical scenario |

### Scoring

| Score | Quality Level |
|-------|---------------|
| 13-15 | Excellent |
| 10-12 | Good |
| 7-9 | Acceptable |
| < 7 | Needs expansion |

---

## Overall Spec Success Rubric (100 points)

### Phase Completion (50 points)

| Phase | Points | Weight |
|-------|--------|--------|
| P0: Discovery | 5 | Complete outputs |
| P1: ai-context.md | 20 | 62+ files |
| P2: Error Catalog | 10 | 50+ entries |
| P3: Onboarding | 5 | Documentation + skill |
| P4: Self-Healing | 5 | Hooks operational |
| P5: Validation | 5 | Audit passes |

### Quality Thresholds (30 points)

| Deliverable | Points | Threshold |
|-------------|--------|-----------|
| ai-context.md avg | 10 | ≥ 22/30 avg |
| Error catalog entries | 10 | ≥ 14/20 avg |
| Onboarding docs | 5 | ≥ 18/25 |
| Self-healing hooks | 5 | ≥ 18/25 |

### Impact Metrics (20 points)

| Metric | Points | Target |
|--------|--------|--------|
| /modules coverage | 5 | 100% packages |
| Error auto-fix rate | 5 | 80% safe errors |
| New agent success | 5 | 95% completion |
| Zero ambiguity | 5 | 95% audit pass |

### Final Score Mapping

| Score | AI-Friendliness Rating |
|-------|------------------------|
| 95-100 | 10/10 |
| 90-94 | 9.5/10 |
| 85-89 | 9/10 |
| 80-84 | 8.5/10 (current) |
| < 80 | Below current |

---

## Validation Commands

```bash
# Count ai-context.md files
find packages apps tooling -name "ai-context.md" | wc -l

# Test module discovery
bun run .claude/scripts/context-crawler.ts -- --mode=list | wc -l

# Count error catalog entries
grep -c "^  - id:" .claude/errors/catalog.yaml

# Validate YAML syntax
bun x yaml-lint .claude/errors/catalog.yaml

# Test onboarding skill
/onboarding

# Check hook registration
grep -A5 '"hooks"' .claude/settings.json
```
