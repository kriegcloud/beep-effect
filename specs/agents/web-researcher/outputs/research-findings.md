# Web Researcher Research Findings

## WebSearch Tool

### Query Syntax
- Basic queries: `WebSearch({ query: "search terms" })`
- Returns array of links with `title` and `url` fields
- Provides summarized content from search results

### Domain Filtering
- `allowed_domains`: Array of domains to include (e.g., `["github.com", "typescriptlang.org"]`)
- `blocked_domains`: Array of domains to exclude
- Useful for focusing on authoritative sources or filtering out unreliable content

### Limitations
- Results are summarized by the tool, not raw HTML
- No date range filtering available
- Limited to web search results (no image/video specific searches)
- Best for informational queries; may not surface niche/obscure content

### Query Optimization Techniques
1. **Be specific**: Include year, technology version, specific error messages
2. **Use domain filtering**: Constrain to known authoritative sources
3. **Iterate**: Start narrow, broaden if insufficient results
4. **Include context**: Add relevant technology stack terms

---

## WebFetch Tool

### Content Retrieval
- Syntax: `WebFetch({ url: "https://...", prompt: "extraction instructions" })`
- Fetches URL content and processes with AI prompt
- Returns AI-processed summary based on prompt instructions

### Prompt Patterns
| Pattern | Example |
|---------|---------|
| Extraction | "Extract key concepts for beginners" |
| Summary | "Summarize the main points in bullet form" |
| Analysis | "Identify the pros and cons discussed" |
| Structured | "List all API endpoints mentioned" |

### Error Handling
- Returns 404 errors when pages don't exist
- HTTP URLs auto-upgraded to HTTPS
- Redirects: Tool informs of redirect to different host; must make new request with redirect URL
- Large content may be summarized/truncated
- Uses 15-minute cache for repeated requests

### Best Practices
1. Verify URL correctness before fetching
2. Use specific, targeted prompts
3. Handle 404 and redirect errors gracefully
4. Cache awareness: Same URL returns cached result within 15 minutes

---

## Source Credibility Framework

### CRAAP Test
| Criterion | Questions to Ask |
|-----------|------------------|
| **Currency** | When was it published? Updated? |
| **Relevance** | Does it relate to your topic? |
| **Authority** | Who wrote it? What credentials? |
| **Accuracy** | Can claims be verified? Sources cited? |
| **Purpose** | Inform, persuade, sell, entertain? |

### SIFT Technique (Complementary)
1. **Stop** - Pause before sharing/using information
2. **Investigate** - Check the source's credibility
3. **Find** - Locate better/additional coverage
4. **Trace** - Follow claims back to original context

### Lateral Reading
Instead of deeply analyzing a single source, cross-check with multiple independent sources. This technique is more resistant to sophisticated misinformation.

### Credibility Tiers for Web Research

| Tier | Source Type | Examples |
|------|-------------|----------|
| **HIGH** | Official documentation, peer-reviewed | effect.website, typescriptlang.org, ACM/IEEE papers |
| **MEDIUM** | Reputable tech blogs, high-vote Stack Overflow | dev.to (verified authors), well-established blogs |
| **LOW** | Unknown authors, outdated content, single sources | Anonymous forums, content farms |

### Red Flags
- No author attribution
- No publication/update date
- Excessive ads or clickbait
- Claims without citations
- Conflicts with official documentation

---

## Citation Format

### Web Source Citation Format
```
[Title](URL) — Brief description | Published: [date] | Accessed: [date]
```

### Inline Quote Citation
```
> "Direct quote from source" — [Source Title](URL)
```

### Reference List Format (IEEE-style for technical)
```
[1] Author(s), "Article Title," Website Name. Available: URL. [Accessed: Month Day, Year].
```

### Simplified Markdown Format (for agent output)
```markdown
## Sources
- [Source Title](URL) — What was learned from this source
- [Source Title 2](URL2) — Key insight extracted
```

### Credibility Indicators
- HIGH: Official docs, reputable organizations
- MEDIUM: Community blogs, high-vote answers
- LOW: Outdated content, unknown authors, unverified claims

---

## Query Formulation Techniques

### Template Categories

#### Documentation Queries
- `"[library] official documentation [year]"`
- `"[library] getting started guide"`
- `"[library] API reference"`

#### Problem-Solving Queries
- `"[error message] solution"`
- `"[technology] [specific problem] fix"`
- `"how to [action] in [technology]"`

#### Comparison Queries
- `"[option A] vs [option B] [year]"`
- `"when to use [technology]"`
- `"[technology] alternatives comparison"`

#### Best Practices Queries
- `"[technology] production best practices [year]"`
- `"[technology] performance optimization"`
- `"[technology] security guidelines"`

### Query Refinement Strategy
1. **Start specific**: `"Effect-TS Layer composition patterns 2026"`
2. **Broaden if needed**: `"Effect-TS Layer patterns"`
3. **Use domain filtering**: Constrain to authoritative sources
4. **Cross-reference**: Search same topic from different angles

### Year Inclusion
Always include current year (2026) for:
- Best practices
- Library documentation
- Framework comparisons
- Security guidelines

---

## Tool Combination Patterns

### Research Workflow
```
1. WebSearch (broad query) -> Get source URLs
2. WebFetch (specific URL) -> Extract detailed information
3. WebSearch (follow-up query) -> Cross-reference findings
4. Synthesize -> Combine findings with credibility weighting
```

### Validation Pattern
```
1. Find claim via WebSearch
2. WebFetch original source
3. WebSearch for corroborating sources
4. Compare and weight by credibility
```
