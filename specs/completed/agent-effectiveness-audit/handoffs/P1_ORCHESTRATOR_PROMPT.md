# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Skill Quality Assessment) of the `agent-effectiveness-audit` spec.

### Context

P0 completed with baseline metrics:
- **45 skills** inventoried
- **7 skills** missing frontmatter
- **3 auth skills** redundant
- **2 skills** with naming inconsistencies

### Your Mission

Score all 45 skills against quality rubric (0-102), identify top/bottom 10, create improvement plan.

### Quality Rubric

| Category | Weight | Criteria |
|----------|--------|----------|
| Clarity | 15 | Clear trigger conditions, unambiguous purpose |
| Completeness | 15 | Sufficient content to be actionable |
| Accuracy | 20 | Technically correct, follows Effect patterns |
| Usefulness | 25 | Provides value agents can't derive themselves |
| Discoverability | 15 | Name/triggers match user intent |
| Maintenance | 10 | Low staleness risk, minimal dependencies |

### Prerequisites (Optional - Can Skip)

These were identified in P0 but can be addressed post-scoring:
- 7 skills missing frontmatter (still scorable on other criteria)
- 2 naming inconsistencies

### Agent Deployment Strategy

Deploy 3 parallel code-reviewer agents, each scoring 15 skills:

**Agent 1 Task**:
```
Score skills 1-15 against the quality rubric.

Skills to score:
1. Better Auth Best Practices
2. Create Auth Skill
3. agentation
4. ai-context-writer
5. atom-state
6. better-auth-best-practices
7. cli
8. command-executor
9. context-witness
10. discovery-kit
11. domain-modeling
12. domain-predicates
13. effect-ai-language-model
14. effect-ai-prompt
15. effect-ai-provider

For each skill:
1. Read `.claude/skills/{name}/SKILL.md`
2. Score against 6 categories (weights: Clarity 15, Completeness 15, Accuracy 20, Usefulness 25, Discoverability 15, Maintenance 10)
3. Calculate total (0-102)
4. Note specific improvement opportunities

Write to: `specs/agent-effectiveness-audit/outputs/skill-scores-batch1.md`

Format:
| Skill | Clarity | Complete | Accuracy | Useful | Discover | Maintain | Total | Notes |
```

**Agent 2 Task**:
```
Score skills 16-30 against the quality rubric.

Skills to score:
16. effect-ai-streaming
17. effect-ai-tool
18. effect-concurrency-testing
19. error-handling
20. filesystem
21. humanizer
22. layer-design
23. legal-review
24. parallel-explore
25. path
26. pattern-matching
27. platform-abstraction
28. platform-layers
29. prompt-refinement
30. react-composition

(Same format as Agent 1)

Write to: `specs/agent-effectiveness-audit/outputs/skill-scores-batch2.md`
```

**Agent 3 Task**:
```
Score skills 31-45 against the quality rubric.

Skills to score:
31. react-vm
32. reflect
33. research-orchestration
34. schema-composition
35. service-implementation
36. session-handoff
37. skill-creator
38. skill-judge
39. spec-driven-development
40. subagent-driven-development
41. the-vm-standard
42. turborepo
43. typeclass-design
44. wide-events
45. writing-laws

(Same format as Agent 1)

Write to: `specs/agent-effectiveness-audit/outputs/skill-scores-batch3.md`
```

### Synthesis

After all 3 agents complete:

1. **Merge scores** into `outputs/skill-rankings.md` (sorted by total)
2. **Identify Top 10** (highest value, keep as-is)
3. **Identify Bottom 10** (consolidation candidates)
4. **Create improvement plan** in `outputs/skill-improvement-plan.md`

### Verification

```bash
# Check outputs exist
ls specs/agent-effectiveness-audit/outputs/skill-scores-*.md

# Count scored skills
grep -E "^\|" specs/agent-effectiveness-audit/outputs/skill-scores-*.md | wc -l
```

### Success Criteria

- [ ] All 45 skills scored
- [ ] `outputs/skill-scores-batch{1,2,3}.md` created
- [ ] `outputs/skill-rankings.md` created (sorted)
- [ ] `outputs/skill-improvement-plan.md` created
- [ ] `outputs/P1_QUALITY_ASSESSMENT.md` created
- [ ] REFLECTION_LOG.md updated with P1 entry
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/agent-effectiveness-audit/handoffs/HANDOFF_P1.md`
