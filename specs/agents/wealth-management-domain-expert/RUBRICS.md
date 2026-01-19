# Wealth Management Domain Expert - Output Rubrics

Scoring criteria for evaluating the agent definition output.

---

## Agent Definition Quality (100%)

### Frontmatter Correctness (25%)

| Score | Criteria |
|-------|----------|
| 5/5 | Valid YAML, includes name, description, model, tools |
| 4/5 | Valid YAML, minor missing optional fields |
| 3/5 | Valid YAML but incomplete fields |
| 2/5 | YAML syntax errors |
| 1/5 | Missing frontmatter |

### Description Clarity (25%)

| Score | Criteria |
|-------|----------|
| 5/5 | Clear "when to use" criteria, specific use cases, well-formatted |
| 4/5 | Good description, minor clarity issues |
| 3/5 | Basic description, vague use cases |
| 2/5 | Unclear or generic description |
| 1/5 | Missing or unusable description |

### Domain Knowledge Coverage (30%)

| Score | Criteria |
|-------|----------|
| 5/5 | All core entities, relationships, account types, trust types, compliance awareness |
| 4/5 | Most entities and relationships, minor gaps |
| 3/5 | Core entities present, missing relationships or compliance |
| 2/5 | Minimal domain knowledge |
| 1/5 | No domain knowledge |

### Response Guidelines (20%)

| Score | Criteria |
|-------|----------|
| 5/5 | Clear guidelines, appropriate for domain expert role, compliance-aware |
| 4/5 | Good guidelines, minor gaps |
| 3/5 | Basic guidelines present |
| 2/5 | Vague or inappropriate guidelines |
| 1/5 | Missing guidelines |

---

## Verification Checklist

- [ ] File exists at `.claude/agents/wealth-management-domain-expert.md`
- [ ] YAML frontmatter parses without errors
- [ ] `name` field matches filename
- [ ] `description` includes "when to use" guidance
- [ ] `model` is set (sonnet recommended)
- [ ] `tools` array is present
- [ ] Prompt includes entity types
- [ ] Prompt includes key relationships
- [ ] Prompt includes account/trust types
- [ ] Prompt includes compliance awareness
- [ ] Response guidelines are present

---

## Minimum Acceptance

- Overall score: ≥ 70%
- No dimension below 50%
- All checklist items satisfied
