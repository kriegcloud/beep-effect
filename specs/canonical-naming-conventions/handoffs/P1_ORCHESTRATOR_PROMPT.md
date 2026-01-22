# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify HANDOFF_P0.md context is preserved:
- [ ] `outputs/existing-patterns-audit.md` exists (Phase 0 artifact)
- [ ] `outputs/file-category-inventory.md` exists (Phase 0 artifact)
- [ ] `outputs/inconsistency-report.md` exists (Phase 0 artifact)
- [ ] `REFLECTION_LOG.md` contains Phase 0 learnings
- [ ] Pattern counts from Phase 0 are verifiable via grep

If Phase 0 artifacts are missing or incomplete, request regeneration before proceeding.

---

## Prompt

You are executing Phase 1 (External Research) of the Canonical Naming Conventions spec.

### Context

Phase 0 has completed codebase inventory. Now we research external best practices to inform our naming standards.

### Your Mission

Research industry standards, academic foundations, and AI-native patterns for file naming conventions.

### Deliverables

1. `specs/canonical-naming-conventions/outputs/industry-best-practices.md`
2. `specs/canonical-naming-conventions/outputs/fp-repo-conventions.md`
3. `specs/canonical-naming-conventions/outputs/academic-research.md`
4. `specs/canonical-naming-conventions/outputs/llms-txt-patterns.md`

### Research Tasks

**Task 1.1: AI-Friendly Codebase Standards**
Delegate to `ai-trends-researcher`:
```
Research AI-friendly codebase and file naming conventions.

Search queries:
- "AI friendly codebase structure 2025 2026"
- "llms.txt specification" site:llmstxt.org
- "Claude Code CLAUDE.md best practices" site:anthropic.com
- "agent-optimized repository structure"

Questions to answer:
1. What file naming patterns do AI tooling guides recommend?
2. How does llms.txt specification inform internal file naming?
3. What patterns does Claude Code documentation suggest for AI comprehension?
4. What makes a codebase "greppable" for AI agents?

Output: Research report with cited sources and credibility ratings.
```

**Task 1.2: Effect-TS Ecosystem Conventions**
Delegate to `ai-trends-researcher`:
```
Research Effect-TS and related ecosystem file naming conventions.

Search queries:
- "Effect-TS file naming conventions"
- "effect/Schema module organization"
- site:github.com/Effect-TS naming conventions

Questions to answer:
1. How does the official Effect repository name files?
2. What patterns do high-starred Effect projects use?
3. How are Services, Layers, and Effects typically named?
4. What barrel export patterns does Effect use?

Output: Research report with repository examples and patterns.
```

**Task 1.3: FP Language Naming Conventions**
Delegate to `ai-trends-researcher`:
```
Research functional programming language module naming.

Search queries:
- "Haskell module naming conventions"
- "Scala ZIO project structure best practices"
- "PureScript module organization"
- "functional programming file structure"

Questions to answer:
1. What casing conventions do FP languages standardize?
2. How do FP ecosystems handle module re-exports?
3. What category-theoretic naming patterns exist?
4. How do FP repos differentiate file types (types vs implementations)?

Output: Research report comparing FP language conventions.
```

**Task 1.4: Academic & DDD Foundations**
Delegate to `ai-trends-researcher`:
```
Research academic and Domain-Driven Design file naming.

Search queries:
- "Domain Driven Design tactical patterns file structure"
- "Clean Architecture module naming"
- "category theory software modules"
- arxiv.org software module organization

Questions to answer:
1. How do DDD tactical patterns (Entity, Value Object, Service) map to files?
2. What Clean Architecture naming conventions exist?
3. What category theory principles apply to module naming?
4. Are there peer-reviewed papers on code organization for comprehension?

Output: Research report with academic citations.
```

### Output Format

Each deliverable should include:
- **Executive Summary**: Key findings in 2-3 sentences
- **Key Findings**: Each with source, credibility rating, and relevance
- **Cross-Reference Analysis**: Consensus points, conflicts, gaps
- **Recommendations for Phase 2**: Patterns to evaluate

### Credibility Ratings

- **HIGH**: Official docs, academic papers, recognized organizations
- **MEDIUM**: High-starred repos, editorial blogs, recent content
- **LOW**: Unknown authors, old content, promotional

### Verification

After creating artifacts:
1. Ensure all claims have source citations
2. Cross-reference findings across deliverables
3. Update `REFLECTION_LOG.md` with Phase 1 learnings

### Handoff Document

Full context: `specs/canonical-naming-conventions/handoffs/HANDOFF_P1.md`

### Success Criteria

- [ ] `outputs/industry-best-practices.md` created
- [ ] `outputs/fp-repo-conventions.md` created
- [ ] `outputs/academic-research.md` created
- [ ] `outputs/llms-txt-patterns.md` created
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] All findings have source citations

### Next Steps

After completing Phase 1:
1. Create `handoffs/HANDOFF_P2.md` with research synthesis summary
2. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` for synthesis phase
