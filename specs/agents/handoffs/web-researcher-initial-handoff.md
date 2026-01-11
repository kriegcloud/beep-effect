# Web Researcher Agent — Initial Handoff

> **Priority**: Tier 2 (Research)
> **Spec Location**: `specs/agents/web-researcher/README.md`
> **Target Output**: `.claude/agents/web-researcher.md` (250-350 lines)

---

## Mission

Create the **web-researcher** agent — a web search specialist that formulates effective queries, validates source credibility, cross-references findings, and synthesizes actionable recommendations.

---

## Critical Constraints

1. **Agent definition must be 250-350 lines**
2. **All file references must be validated**
3. **Include proper source citation format**
4. **Handle redirects and errors gracefully**

---

## Phase 1: Research (Read-Only)

### Task 1.1: Study WebSearch and WebFetch Tools

**Test tool capabilities**:

```typescript
// WebSearch - basic query
WebSearch({ query: "Effect-TS best practices 2026" })

// WebSearch - with domain filtering
WebSearch({
  query: "TypeScript monorepo patterns",
  allowed_domains: ["github.com", "typescriptlang.org"]
})

// WebFetch - retrieve content
WebFetch({
  url: "https://effect.website/docs/getting-started",
  prompt: "Extract key concepts for beginners"
})
```

**Document**:
- Query syntax and limitations
- Domain filtering capabilities
- WebFetch prompt patterns
- Redirect handling behavior

### Task 1.2: Research Source Validation Techniques

**Key questions**:
- How to assess source credibility?
- When to trust vs. verify information?
- How to handle conflicting sources?

**Credibility checklist**:
- [ ] Official documentation site
- [ ] Recognized author/organization
- [ ] Recent publication date
- [ ] Multiple sources confirm
- [ ] Technical accuracy verifiable

### Task 1.3: Study Citation Best Practices

**Research**:
- Academic citation formats
- Web-specific attribution
- Linking to primary sources

### Task 1.4: Review Agent Template

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

### Output: `specs/agents/web-researcher/outputs/research-findings.md`

```markdown
# Web Researcher Research Findings

## WebSearch Tool
[Query syntax, domain filtering, limitations]

## WebFetch Tool
[Prompt patterns, redirect handling, content extraction]

## Source Credibility Framework
[Checklist for validating sources]

## Citation Format
[Standard format for source attribution]

## Query Formulation Techniques
[How to create effective search queries]
```

---

## Phase 2: Design

### Task 2.1: Design Research Methodology

1. **Query Formulation**
   - Start with specific queries
   - Broaden if too few results
   - Use domain filtering for quality

2. **Source Validation**
   - Apply credibility checklist
   - Flag uncertain sources
   - Prioritize official documentation

3. **Cross-Referencing**
   - Compare findings across sources
   - Note agreements and conflicts
   - Weight by source quality

4. **Synthesis**
   - Distill actionable insights
   - Cite all sources
   - Note confidence levels

### Task 2.2: Define Output Format

```markdown
# Web Research: [Topic]

## Research Parameters
- **Queries**: [list of search queries used]
- **Domain Filters**: [allowed/blocked domains]
- **Date Range**: [if applicable]

## Search Results Summary
| Query | Results | Top Sources |
|-------|---------|-------------|

## Key Findings

### Finding 1: [Title]
**Source**: [URL]
**Credibility**: HIGH/MEDIUM/LOW
**Summary**: [Key insight]
**Relevance**: [Why this matters for the task]

### Finding 2: [Title]
...

## Cross-Reference Analysis
[Agreements, conflicts, gaps]

## Recommendations
**Confidence**: HIGH/MEDIUM/LOW
[Actionable advice based on research]

## Sources
- [Title 1](URL1)
- [Title 2](URL2)
```

### Task 2.3: Create Query Template Library

```markdown
## Query Templates

### Library/Framework Documentation
- "[Library] official documentation 2026"
- "[Library] getting started guide"
- "[Library] best practices"

### Problem Solving
- "[Error message] solution"
- "[Technology] [specific problem] fix"
- "how to [action] in [technology]"

### Comparisons
- "[Option A] vs [Option B] [year]"
- "when to use [technology]"
- "[technology] alternatives"

### Best Practices
- "[technology] production best practices"
- "[technology] performance optimization"
- "[technology] security guidelines"
```

### Output: `specs/agents/web-researcher/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/web-researcher.md`:

```markdown
---
description: Web research agent for searching, validating, and synthesizing information from the web
tools: [WebSearch, WebFetch]
---

# Web Researcher Agent

[Purpose statement]

## Tools Reference

### WebSearch
[Syntax, domain filtering, best practices]

### WebFetch
[Content retrieval, prompt formulation]

## Methodology

### Step 1: Query Formulation
[Templates and techniques]

### Step 2: Source Validation
[Credibility checklist]

### Step 3: Cross-Referencing
[Comparison techniques]

### Step 4: Synthesis
[How to create recommendations]

## Query Template Library
[Pre-built query patterns]

## Output Format
[Structure with examples]

## Examples
[Sample research task and output]
```

### Task 3.2: Include Source Citation Format

```markdown
## Citation Format

### Inline Citation
> "Direct quote from source" — [Source Title](URL)

### Reference List
- [Title](URL) — Brief description of what was learned

### Credibility Indicators
- 🟢 HIGH: Official docs, reputable organizations
- 🟡 MEDIUM: Community blogs, Stack Overflow answers with high votes
- 🔴 LOW: Outdated content, unknown authors, single-source claims
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/web-researcher.md
wc -l .claude/agents/web-researcher.md

# Verify tool references
grep -E "WebSearch|WebFetch" .claude/agents/web-researcher.md

# Check for source citation section
grep -i "citation\|sources" .claude/agents/web-researcher.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/web-researcher.md`
- [ ] Length is 250-350 lines
- [ ] Follows template structure with frontmatter
- [ ] Includes query template library
- [ ] Includes source credibility checklist
- [ ] Includes citation format
- [ ] Tested with sample research task

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the web-researcher agent creation spec.

Your goal: Create `.claude/agents/web-researcher.md` (250-350 lines) — a web research agent for search, validation, and synthesis.

PHASE 1 - Research:
1. Test WebSearch with sample queries
2. Test WebFetch with sample URL
3. Research source validation techniques
4. Study citation best practices
5. Output to specs/agents/web-researcher/outputs/research-findings.md

PHASE 2 - Design:
1. Design research methodology (Query -> Validate -> Cross-Reference -> Synthesize)
2. Create query template library
3. Define source credibility checklist
4. Define output format with citation
5. Output to specs/agents/web-researcher/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/web-researcher.md
2. Include query templates
3. Include credibility checklist
4. Test with sample research (e.g., "Best practices for Effect-TS testing")

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
