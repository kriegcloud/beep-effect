# Web Researcher Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/web-researcher.md` (250-350 lines)

---

## Purpose

Create a specialized agent for searching the web, validating source credibility, and synthesizing best practices from multiple sources into actionable recommendations.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- Web search query formulation
- Source credibility validation
- Multi-source synthesis
- Actionable recommendation generation

### Out of Scope
- Scraping private/authenticated content
- Storing web content long-term
- Real-time monitoring

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/web-researcher.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 250-350 lines
- [ ] Methodology uses WebSearch and WebFetch tools effectively
- [ ] Includes source citation format
- [ ] Output format compatible with spec workflow
- [ ] Tested with sample research task

---

## Agent Capabilities

### Core Functions
1. **Formulate Queries** - Create effective search queries from task requirements
2. **Validate Sources** - Assess credibility of search results
3. **Cross-Reference** - Compare findings across multiple sources
4. **Synthesize** - Generate actionable recommendations

### Knowledge Sources
- Web search results (via `WebSearch` tool)
- Web page content (via `WebFetch` tool)
- Community best practices
- Library documentation

### Output Format
```markdown
# Web Research: [Topic]

## Search Queries
- "query 1"
- "query 2"

## Key Findings
### Source: [URL]
[Summary and relevance]

## Recommendations
[Actionable advice based on research]

## Sources
- [Title](URL)
```

---

## Research Phase

Before creating the agent definition, research:

### 1. Web Search Patterns
- Effective query formulation techniques
- How to validate source credibility
- Cross-referencing strategies

### 2. Tool Capabilities
- WebSearch tool syntax and limitations
- WebFetch tool for detailed content retrieval
- Handling redirects and errors

### 3. Citation Best Practices
- Proper source attribution
- Linking to primary sources
- Summarizing vs quoting

---

## Implementation Plan

### Phase 1: Research
1. Review WebSearch and WebFetch tool documentation
2. Identify effective query patterns
3. Document source validation techniques
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design research methodology
2. Define output format with examples
3. Create source credibility checklist
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Validate all tool references
3. Test with sample research task
4. Output: `.claude/agents/web-researcher.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

### Tool Documentation
- WebSearch tool capabilities
- WebFetch tool for content retrieval

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/web-researcher.md
wc -l .claude/agents/web-researcher.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [mcp-researcher](../mcp-researcher/README.md) - Effect docs research agent
