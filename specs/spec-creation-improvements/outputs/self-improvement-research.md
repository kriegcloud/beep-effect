# Research Report: Self-Improvement Patterns

## Research Parameters
- **Topic**: Self-Improving AI Agents and Skill Extraction
- **Date**: 2026-01-21
- **Queries Used**:
  - `Reflexion framework self-improving AI agents 2025 2026 skill extraction`
  - `AI skill library extraction automatic promotion production agents 2025`
  - `SEAL self-adapting language models self-improving agents 2025`

## Executive Summary

Self-improving AI agents operate through two dominant paradigms: Reflexion (verbal reinforcement learning via episodic memory) and SEAL (weight updates via self-generated training data). The Agent Skills open standard (December 2025, adopted by Anthropic and OpenAI) provides a production-ready format for packaging and sharing learned capabilities. Skill extraction follows a structured interview-and-codify pattern, with quality scoring enabling automatic promotion to skill libraries.

## Key Findings

### Finding 1: Reflexion Framework - Verbal Reinforcement Learning

**Source**: [Reflexion Paper (arXiv:2303.11366)](https://arxiv.org/abs/2303.11366) and [NeurIPS 2023](https://openreview.net/forum?id=vAElhFcKW6)
**Credibility**: HIGH (Academic paper, major conference)
**Summary**: Reflexion reinforces agents through linguistic feedback, not weight updates. Three components:
1. **Actor**: LLM attempting tasks
2. **Self-Reflection**: Generates verbal cues for improvement
3. **Memory**: Short-term (current trajectory) + long-term (distilled reflections)

Results: GPT-4 + Reflexion achieved 91% on HumanEval (vs. 80% without). Solved 130/134 AlfWorld challenges.

**Relevance to beep-effect**: REFLECTION_LOG.md should capture "distilled reflections" in a structured format that agents can reference in future specs.

---

### Finding 2: Agent Skills Open Standard (December 2025)

**Source**: [Anthropic - Agent Skills](https://github.com/anthropics/skills) and [VentureBeat Coverage](https://venturebeat.com/technology/anthropic-launches-enterprise-agent-skills-and-opens-the-standard)
**Credibility**: HIGH (Official announcement, major tech publication)
**Summary**: Agent Skills are folders containing instructions, scripts, and resources that AI agents discover and use. Key features:
- **Auto-discovery**: Skills discovered at startup from directories like `~/.config/goose/skills/`
- **Model-invoked**: AI decides when to use based on context
- **SKILL.md format**: Structured file with description, instructions, tools

Adopted by: OpenAI Codex, Microsoft VS Code, GitHub, Cursor, Goose, Amp, OpenCode.

**Relevance to beep-effect**: Extracted patterns from specs should be formatted as Skills for reuse across projects.

---

### Finding 3: Skill Quality Scoring Framework

**Source**: [DEV Community - Agent Skills](https://dev.to/nickytonline/advent-of-ai-2025-day-14-agent-skills-4d48)
**Credibility**: HIGH (Production guidance)
**Summary**: `skill-testing-checklist.md` provides quality validation with 8 categories:
1. Completeness
2. Actionability
3. Format consistency
4. Cross-skill integration
5. Scenario coverage
6. Technical validation
7. User experience
8. Maintenance

Scoring: 102 points max. 75+ = good quality, 90+ = production ready.

**Relevance to beep-effect**: Reflection entries should be scored before promotion to skill library. Define quality thresholds.

---

### Finding 4: Skill Extraction via Interview Pattern

**Source**: [Subramanya.ai - Agent Skills Enterprise](https://subramanya.ai/2025/12/18/agent-skills-the-missing-piece-of-the-enterprise-ai-puzzle/)
**Credibility**: HIGH (Technical blog with production context)
**Summary**: `skill-generator-guide.md` is a meta-skill for creating new skills:
1. Interview an expert (or extract from successful execution)
2. Extract knowledge into structured format
3. Generate SKILL.md file
4. Validate against checklist

Process: Ask agent "Help me create a skill for [domain]" and it interviews you to extract procedural knowledge.

**Relevance to beep-effect**: Phase completion should prompt extraction: "What patterns from this phase should become skills?"

---

### Finding 5: SEAL - Self-Adapting Language Models

**Source**: [SEAL Paper (arXiv:2506.10943)](https://arxiv.org/abs/2506.10943) and [MIT News](https://news.mit.edu/2025/teaching-large-language-models-to-absorb-new-knowledge-1112)
**Credibility**: HIGH (Academic paper, MIT research)
**Summary**: SEAL enables LLMs to self-adapt by generating their own finetuning data. Two-loop architecture:
- **Outer Loop**: RL to learn effective "self-edits"
- **Inner Loop**: SFT to apply self-edits as weight updates

Results: QA accuracy improved from 32.7% (no adaptation) to 47.0% (two rounds of ReST-EM). 72.5% success on ARC benchmark subset.

Limitation: Catastrophic forgetting—performance on earlier tasks degrades with repeated adaptation.

**Relevance to beep-effect**: While SEAL involves weight updates (not applicable to specs), the "self-edit" concept informs reflection format—capture what would change.

---

### Finding 6: Reflection vs. Reflexion Distinction

**Source**: [Sider AI - Reflection vs Reflexion](https://sider.ai/blog/ai-tools/reflection-vs_reflexion-in-ai-agents-strategy-implementation-and-the-path-to-self-optimization)
**Credibility**: HIGH (Technical comparison)
**Summary**:
- **Reflection** (lowercase): Broad class of meta-cognition and self-critique
- **Reflexion** (capitalized): Specific framework operationalizing self-improvement via memory, critique, and planning

Reflexion typically includes:
- Outcome-guided critique
- Memory writing of lessons
- Memory-conditioned planning in future episodes

**Relevance to beep-effect**: REFLECTION_LOG.md implements "Reflexion" pattern—outcome-guided, memory-written, future-conditioned.

---

### Finding 7: Enterprise Skill Management

**Source**: [Anthropic Enterprise Features](https://venturebeat.com/technology/anthropic-launches-enterprise-agent-skills-and-opens-the-standard)
**Credibility**: HIGH (Major publication)
**Summary**: Enterprise features for skills:
- **Central provisioning**: Admins control which workflows available
- **Cross-platform portability**: Skills work across compliant agents
- **Marketplace potential**: Both open-source and commercial skills

Quote: "Enterprise customers are using skills in production across both coding workflows and business functions like legal, finance, accounting, and data science."

**Relevance to beep-effect**: Spec patterns could become a skill marketplace for the organization—shareable across projects.

---

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | All sources agree on structured reflection over free-form. Memory persistence is critical. Skills need explicit success criteria. |
| **Conflicts** | Reflexion (no weight update) vs. SEAL (weight update): For specs, Reflexion is more applicable since we can't update model weights. |
| **Gaps** | No research on optimal reflection granularity—per-task, per-phase, or per-spec? Need to experiment. |

## Practical Examples

### Structured Reflection Entry Format

```json
{
  "id": "refl-2026-01-21-001",
  "phase": "Phase 0",
  "outcome": "success",
  "task": "Validate context engineering research",
  "duration_minutes": 45,
  "reflection": {
    "what_worked": [
      "Parallel web searches reduced research time by 60%",
      "Cross-referencing sources increased confidence in findings"
    ],
    "what_failed": [
      "Initial queries too broad, required refinement"
    ],
    "key_insight": "Year-filtered queries (2025/2026) dramatically improve relevance",
    "pattern_candidate": {
      "name": "year-filtered-search",
      "description": "Always include year filter in research queries",
      "applicability": "Research phases",
      "confidence": "high"
    }
  },
  "skill_extraction": {
    "ready_for_promotion": true,
    "quality_score": 82,
    "suggested_skill_name": "research-query-refinement"
  }
}
```

### SKILL.md Format for Extracted Pattern

```markdown
# Skill: Research Query Refinement

## Description
Techniques for constructing effective web search queries for AI/ML research topics.

## When to Use
- Research phases of specifications
- Gathering evidence for technical decisions
- Validating industry trends

## Instructions

1. **Start with year filter**: Always include `2025` or `2026` in queries
2. **Use domain-specific terms**: Include framework names, not generic concepts
3. **Parallel search strategy**: Run 3-5 related queries concurrently
4. **Cross-reference requirement**: Findings need 3+ sources for HIGH confidence

## Examples

### Good Queries
- `"tiered memory" AI agents production 2025`
- `DSPy signature programmatic prompts examples 2025`

### Poor Queries
- `AI memory` (too broad)
- `machine learning agents` (no year, no specificity)

## Success Criteria
- ≥5 HIGH credibility sources per topic
- Cross-reference validation completed
- Recommendations mapped to implementation
```

### Quality Scoring Rubric for Reflections

| Category | Max Points | Criteria |
|----------|------------|----------|
| Completeness | 15 | All required fields present |
| Actionability | 20 | Specific, executable recommendations |
| Reproducibility | 15 | Steps can be followed by another agent |
| Generalizability | 15 | Applies beyond current spec |
| Evidence | 15 | Backed by concrete outcomes |
| Format | 10 | Follows schema exactly |
| Integration | 12 | Links to related patterns |
| **Total** | **102** | **75+ = good, 90+ = production** |

## Recommendations for beep-effect

| Priority | Recommendation | Implementation Notes |
|----------|----------------|---------------------|
| P0 | Define structured reflection JSON schema | Based on example above with required fields |
| P0 | Add quality scoring rubric to REFLECTION_LOG.md | 8 categories, 102 points max |
| P1 | Create skill extraction prompt for phase completion | "What patterns should become skills?" |
| P1 | Define promotion threshold (75+ for library) | Lower scores stay in spec-local reflection |
| P2 | Create SKILL.md template in `specs/templates/` | Standard format for extracted patterns |
| P2 | Consider skills directory at `specs/skills/` | Cross-spec pattern library |

## Sources

### High Credibility (7 sources)
- [Reflexion Paper (arXiv:2303.11366)](https://arxiv.org/abs/2303.11366) - Original framework
- [NeurIPS 2023 Reflexion](https://openreview.net/forum?id=vAElhFcKW6) - Peer-reviewed publication
- [Anthropic Skills GitHub](https://github.com/anthropics/skills) - Open standard
- [VentureBeat - Agent Skills](https://venturebeat.com/technology/anthropic-launches-enterprise-agent-skills-and-opens-the-standard) - Industry adoption
- [SEAL Paper (arXiv:2506.10943)](https://arxiv.org/abs/2506.10943) - Self-adapting models
- [MIT News - SEAL](https://news.mit.edu/2025/teaching-large-language-models-to-absorb-new-knowledge-1112) - Accessible summary
- [Sider AI - Reflection vs Reflexion](https://sider.ai/blog/ai-tools/reflection-vs_reflexion-in-ai-agents-strategy-implementation-and-the-path-to-self-optimization) - Pattern distinction

### Medium Credibility
- [DEV Community - Agent Skills](https://dev.to/nickytonline/advent-of-ai-2025-day-14-agent-skills-4d48) - Practical guide
- [Subramanya.ai - Enterprise Skills](https://subramanya.ai/2025/12/18/agent-skills-the-missing-piece-of-the-enterprise-ai-puzzle/) - Interview pattern
- [HuggingFace Blog - Reflection](https://huggingface.co/blog/Kseniase/reflection) - Conceptual overview
