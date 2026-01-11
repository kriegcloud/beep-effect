# Web Researcher Agent Design

## Research Methodology

### Step 1: Query Formulation

**Strategy: Start specific, broaden if needed**

1. Parse research request to identify:
   - Primary topic/technology
   - Specific questions to answer
   - Context (version, year, environment)

2. Generate initial queries:
   - Use query templates from library
   - Include current year (2026) for time-sensitive topics
   - Apply domain filtering for quality sources

3. Refine based on results:
   - Too few results -> broaden query
   - Too many/irrelevant -> add specificity
   - Mix of quality -> apply domain filters

### Step 2: Source Validation

**CRAAP + Lateral Reading Hybrid**

For each source, evaluate:

| Criterion | Check | Weight |
|-----------|-------|--------|
| Authority | Official docs? Known author? Org? | HIGH |
| Currency | Published/updated in last 2 years? | MEDIUM |
| Accuracy | Claims verifiable? Cites sources? | HIGH |
| Corroboration | Multiple sources agree? | HIGH |
| Purpose | Educational vs promotional? | MEDIUM |

**Credibility Assignment:**
- HIGH: Official docs, reputable tech companies, peer-reviewed
- MEDIUM: Well-known blogs, high-vote community answers, respected authors
- LOW: Unknown authors, outdated, single-source claims, content farms

### Step 3: Cross-Referencing

**Comparison Matrix:**

| Finding | Source 1 | Source 2 | Source 3 | Consensus |
|---------|----------|----------|----------|-----------|
| Claim A | | | | |
| Claim B | | | | |

**Conflict Resolution:**
1. Weight by source credibility
2. Prefer official documentation over community sources
3. Prefer more recent information
4. Note unresolved conflicts in output

### Step 4: Synthesis

1. Identify key findings with strongest evidence
2. Note confidence levels based on:
   - Number of corroborating sources
   - Source credibility tiers
   - Recency of information
3. Formulate actionable recommendations
4. Document all sources with proper attribution

---

## Query Template Library

### Library/Framework Documentation
```
"[Library] official documentation [year]"
"[Library] getting started guide"
"[Library] best practices"
"[Library] [version] migration guide"
"[Library] API reference [specific feature]"
```

### Problem Solving
```
"[Error message] solution"
"[Technology] [specific problem] fix"
"how to [action] in [technology]"
"[Technology] [error code] troubleshooting"
"[Library] [issue] workaround"
```

### Comparisons
```
"[Option A] vs [Option B] [year]"
"when to use [technology]"
"[technology] alternatives comparison"
"[Library A] or [Library B] for [use case]"
"pros and cons of [technology] [year]"
```

### Best Practices
```
"[technology] production best practices [year]"
"[technology] performance optimization"
"[technology] security guidelines"
"[technology] testing patterns"
"[technology] architecture patterns"
```

### Current Information
```
"[technology] latest version features [year]"
"[technology] changelog [version]"
"[technology] roadmap [year]"
"[technology] deprecation warnings"
```

---

## Source Credibility Checklist

### Tier 1: HIGH Credibility
- [ ] Official documentation site (e.g., effect.website, typescriptlang.org)
- [ ] Recognized organization (e.g., Microsoft, Google, Vercel)
- [ ] Peer-reviewed publication
- [ ] Author with verifiable expertise
- [ ] Content updated within last year
- [ ] Technical claims include code examples
- [ ] Multiple independent sources confirm

### Tier 2: MEDIUM Credibility
- [ ] Well-known tech blog with editorial standards
- [ ] Stack Overflow answer with high votes (50+)
- [ ] GitHub repository with significant stars (1000+)
- [ ] Author has public professional profile
- [ ] Content updated within last 2 years
- [ ] Community engagement (comments, discussions)

### Tier 3: LOW Credibility (Use with caution)
- [ ] Unknown author without credentials
- [ ] Content older than 2 years
- [ ] No citations or references
- [ ] Single source making claim
- [ ] Promotional/marketing content
- [ ] Content farm or clickbait indicators

---

## Output Format

```markdown
# Web Research: [Topic]

## Research Parameters
- **Research Question**: [What we're investigating]
- **Queries Used**: [list of search queries]
- **Domain Filters**: [allowed/blocked domains if any]
- **Date**: [research date]

## Search Results Summary
| Query | Results Count | Top Sources |
|-------|---------------|-------------|
| query 1 | N | source names |
| query 2 | N | source names |

## Key Findings

### Finding 1: [Title]
**Source**: [URL]
**Credibility**: HIGH/MEDIUM/LOW
**Summary**: [Key insight in 1-3 sentences]
**Evidence**: [Supporting details or quotes]
**Relevance**: [Why this matters for the research question]

### Finding 2: [Title]
...

## Cross-Reference Analysis

### Agreements
- [Points where multiple sources agree]

### Conflicts
- [Points where sources disagree + resolution approach]

### Gaps
- [Areas with insufficient information]

## Recommendations

**Confidence**: HIGH/MEDIUM/LOW

[Actionable advice based on research findings]

### Caveats
- [Any limitations or uncertainties]

## Sources

### High Credibility
- [Title](URL) — What was learned

### Medium Credibility
- [Title](URL) — What was learned

### Low Credibility (for reference only)
- [Title](URL) — What was learned
```

---

## Example Research Task

**Request**: "Best practices for Effect-TS testing in 2026"

### Query Sequence
1. `"Effect-TS testing best practices 2026"` (allowed_domains: ["effect.website", "github.com"])
2. `"Effect testing patterns"` (broad backup)
3. `"Effect-TS vitest integration"`

### Expected Output Structure
- Research parameters documented
- 3-5 key findings with credibility ratings
- Cross-reference analysis showing consensus
- Actionable recommendations with confidence level
- Complete source list with descriptions
