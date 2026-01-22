# Phase 1 Handoff: External Research

> Complete context for Phase 1 execution.

---

## Mission

Research external best practices, academic foundations, and industry standards for AI-native file naming conventions.

## Prerequisites

Phase 0 deliverables should exist:
- `outputs/existing-patterns-audit.md`
- `outputs/file-category-inventory.md`
- `outputs/inconsistency-report.md`

## Context

### Research Goals

1. **Industry Standards**: What do leading Effect/FP repositories use?
2. **AI-Friendliness**: What patterns maximize agent comprehension?
3. **Academic Foundations**: What category-theoretic naming principles exist?
4. **Documentation Standards**: How do llms.txt/CLAUDE.md inform naming?

### Key Questions from Phase 0

*To be populated after Phase 0 execution*

Likely questions include:
- Why do some repos use PascalCase folders while others use lowercase?
- What's the origin of the `mod.ts` convention?
- How do FP languages (Haskell, Scala) name modules?
- What research exists on AI agent code comprehension?

## Deliverables

### 1. `outputs/industry-best-practices.md`

Research industry standards:
- AI-friendly codebase patterns
- Claude Code / Cursor IDE recommendations
- llms.txt specification analysis
- CLAUDE.md/AGENTS.md best practices

### 2. `outputs/fp-repo-conventions.md`

Survey functional programming repositories:
- Effect-TS naming conventions
- Scala ZIO/Cats effect patterns
- Haskell module naming
- PureScript/Elm conventions

### 3. `outputs/academic-research.md`

Academic and theoretical foundations:
- Category theory module naming
- Type theory correspondence
- Domain-Driven Design file patterns
- Clean Architecture naming

### 4. `outputs/llms-txt-patterns.md`

AI documentation standards:
- llms.txt specification
- Claude Code documentation patterns
- Agent-optimized file naming research
- Greppability studies (if any)

## Research Tasks

### Task 1.1: AI-Friendly Codebase Standards

**Agent**: ai-trends-researcher

**Research queries**:
- "AI friendly codebase structure 2025 2026"
- "llms.txt specification file naming"
- "Claude Code CLAUDE.md best practices"
- "Agent-optimized repository structure"

**Questions**:
- What naming conventions do AI tooling guides recommend?
- How does llms.txt inform internal file structure?
- What patterns does Claude Code documentation suggest?

### Task 1.2: Effect-TS Ecosystem Conventions

**Agent**: ai-trends-researcher + mcp-researcher

**Research queries**:
- "Effect-TS file naming conventions"
- "effect/Schema module structure"
- "Effect Layer naming patterns"

**Questions**:
- How does the Effect-TS repository itself name files?
- What conventions do high-starred Effect projects use?
- How are Services/Layers/Effects typically named?

### Task 1.3: Functional Programming Naming Conventions

**Agent**: ai-trends-researcher

**Research queries**:
- "Haskell module naming conventions"
- "Scala ZIO project structure"
- "PureScript module organization"
- "Functional programming file structure best practices"

**Questions**:
- What casing conventions do FP languages use?
- How do FP repos handle barrel exports?
- What category-theoretic naming patterns exist?

### Task 1.4: Academic & DDD Foundations

**Agent**: ai-trends-researcher

**Research queries**:
- "Domain Driven Design file structure"
- "Clean Architecture naming conventions"
- "Category theory module organization"
- "Type theory file naming"

**Questions**:
- What academic foundations exist for file categorization?
- How do DDD tactical patterns map to files?
- What theoretical principles guide module naming?

### Task 1.5: Greppability & Search Optimization

**Agent**: codebase-researcher (internal) + ai-trends-researcher (external)

**Questions**:
- What naming patterns maximize grep efficiency?
- How do IDE search tools handle different conventions?
- What patterns help AI agents find relevant files?

## Agent Delegation

| Task | Agent | Capability | Output |
|------|-------|------------|--------|
| 1.1 | ai-trends-researcher | read-only + web | Research report |
| 1.2 | ai-trends-researcher + mcp-researcher | read-only + web + effect docs | Research report |
| 1.3 | ai-trends-researcher | read-only + web | Research report |
| 1.4 | ai-trends-researcher | read-only + web | Research report |
| 1.5 | codebase-researcher + ai-trends-researcher | read-only | Pattern analysis |

## Source Credibility Guidelines

### High Credibility
- Official Effect-TS documentation
- Anthropic Claude Code documentation
- Academic papers (arxiv.org)
- Official language documentation (Haskell, Scala)

### Medium Credibility
- High-starred GitHub repositories (1000+)
- Tech blogs with editorial standards
- Recent conference talks

### Low Credibility (use with caution)
- Unknown blog authors
- Content >2 years old
- Promotional content

## Verification

After completing artifacts:
- [ ] All four deliverables exist in `outputs/`
- [ ] Each finding has source citation
- [ ] Credibility ratings included
- [ ] Cross-references identified
- [ ] REFLECTION_LOG.md updated

## Success Criteria

- Multiple sources per claim (minimum 2)
- Clear credibility ratings
- Actionable patterns identified
- No premature recommendations (save for Phase 2)

## Next Phase

After Phase 1 completes, proceed to Phase 2 (Synthesis) using `P2_ORCHESTRATOR_PROMPT.md`.
