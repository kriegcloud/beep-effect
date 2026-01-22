# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] `specs/spec-creation-improvements/README.md` exists
- [ ] `specs/spec-creation-improvements/outputs/` directory exists
- [ ] No pre-existing Phase 0 outputs (clean slate)

---

## Prompt

You are executing Phase 0 (Research Validation) of the Spec Creation Improvements spec.

### Context

Initial research on 2026-01-21 identified 6 improvement areas for the spec creation guide. This phase validates and deepens that research before implementation.

**Pre-existing state**: AGENTS.md standardization is ALREADY COMPLETE (CLAUDE.md symlinked to AGENTS.md). Skip that topic.

### Your Mission

Produce 6 validated research reports with ≥5 HIGH credibility sources each.

### Deliverables

1. `outputs/context-engineering-research.md`
2. `outputs/orchestration-patterns-research.md`
3. `outputs/self-improvement-research.md`
4. `outputs/dspy-signatures-research.md`
5. `outputs/llms-txt-research.md`
6. `outputs/additional-patterns-research.md`

### Research Protocol

For EACH topic, use `ai-trends-researcher` or direct web search:

1. Execute 3-5 targeted searches with `2025` or `2026` year filters
2. Validate sources (HIGH = official docs, academic papers, recognized orgs)
3. Cross-reference findings across sources
4. Extract practical examples where possible
5. Map recommendations to beep-effect implementation

### Topic-Specific Queries

**Context Engineering**:
- `"tiered memory" AI agents production 2025`
- `"context rot" LLM solutions 2025`
- `Google ADK "context engineering" case study`

**Graph Orchestration**:
- `LangGraph production deployment patterns 2025`
- `"agent state machine" visualization`
- `Google ADK vs LangGraph comparison`

**Self-Improvement**:
- `Reflexion framework implementation 2025`
- `"skill extraction" AI agents production`
- `"structured reflection" LLM agents format`

**DSPy Signatures**:
- `DSPy signature practical examples 2025`
- `"programmatic prompts" markdown agents`
- `DSPy "input output contract" composition`

**llms.txt**:
- `llms.txt file structure examples 2025`
- `llms-full.txt usage patterns`
- `"llms.txt" Anthropic Cloudflare examples`

**Additional Patterns**:
- `"dry run" AI agents validation 2025`
- `"pattern registry" software engineering`
- `"complexity scoring" specifications`

### Output Format

Each research file must include:
- Executive summary (2-3 sentences)
- ≥5 findings with source URLs and credibility ratings
- Cross-reference analysis (consensus/conflicts/gaps)
- Practical examples (code, file structures, diagrams)
- Recommendations table (P0/P1/P2 priority)
- Sources section with all URLs

### Verification

```bash
# Check all outputs exist
ls specs/spec-creation-improvements/outputs/*.md

# Verify source counts
grep -c "Source.*:" outputs/context-engineering-research.md
```

### Success Criteria

- [ ] All 6 research outputs created
- [ ] Each output has ≥5 HIGH credibility sources
- [ ] Cross-reference analysis for each topic
- [ ] Practical examples included
- [ ] Recommendations mapped to implementation
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P1.md created
- [ ] P1_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/spec-creation-improvements/handoffs/HANDOFF_P0.md`

### Next Phase

After completing Phase 0:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P1.md`
3. Create `handoffs/P1_ORCHESTRATOR_PROMPT.md`
