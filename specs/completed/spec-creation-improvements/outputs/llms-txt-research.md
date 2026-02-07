# Research Report: llms.txt Standard

## Research Parameters
- **Topic**: llms.txt AI Documentation Standard
- **Date**: 2026-01-21
- **Queries Used**:
  - `llms.txt specification file structure examples 2025 2026`
  - `Anthropic llms.txt example Cloudflare Vercel documentation site`

## Executive Summary

llms.txt is a markdown-based file standard for providing AI-readable documentation indexes. Proposed by Jeremy Howard (Answer.AI) in September 2024, it gained rapid adoption after Mintlify rolled it out to thousands of documentation sites in November 2025. Major adopters include Anthropic, Cloudflare, Vercel, and Astro. The standard optimizes for token efficiency (10x reduction vs HTML) and provides structured navigation for AI agents without complex crawling.

## Key Findings

### Finding 1: llms.txt Specification Structure

**Source**: [llmstxt.org Official Specification](https://llmstxt.org/)
**Credibility**: HIGH (Official specification)
**Summary**: The file uses Markdown with specific ordering:
1. **H1 heading** (required): Project/site name
2. **Blockquote**: Short summary with key information
3. **Zero or more markdown sections**: Paragraphs, lists (no additional headings)
4. **Structured links**: Markdown links with brief descriptions

Key rules:
- Must be at domain root (`/llms.txt`)
- Uses Markdown (not XML/JSON) because LLMs read it directly
- Related files: `llms-full.txt` (all content inline), `llms-ctx.txt` (without URLs)

**Relevance to beep-effect**: `specs/llms.txt` should follow this exact structure for spec navigation.

---

### Finding 2: Cloudflare Implementation - Product-Grouped Organization

**Source**: [Cloudflare llms.txt](https://developers.cloudflare.com/llms.txt)
**Credibility**: HIGH (Production implementation)
**Summary**: Cloudflare's structure demonstrates enterprise patterns:
- ~40 major product categories (Agents, AI Gateway, Workers, etc.)
- 3-4 nesting levels with consistent indentation
- Uniform link format: `- [Display Text](url)`
- Brief descriptions after links for context
- Consistent section types: Getting started → Concepts → Configuration → Examples → Reference

Organization by function, not alphabetically. Groups related content for AI understanding.

**Relevance to beep-effect**: Organize specs by domain (IAM, Documents, Common) rather than alphabetically.

---

### Finding 3: 844K+ Website Adoption (October 2025)

**Source**: [ProMarketer - What Is llms.txt](https://www.promarketer.ca/post/what-is-llms-txt) and [Semrush Analysis](https://www.semrush.com/blog/llms-txt/)
**Credibility**: HIGH (Industry analysis)
**Summary**: BuiltWith tracking shows 844,000+ websites implemented llms.txt by October 2025. Key adopters:
- Anthropic, Cloudflare, Vercel, Stripe, Astro, Cursor
- Mintlify rollout (November 2025) added thousands overnight

However: Google's Gary Illyes stated Google doesn't support llms.txt. John Mueller compared it to deprecated keywords meta tag.

**Relevance to beep-effect**: Wide adoption validates the pattern for developer documentation. SEO concerns irrelevant for internal specs.

---

### Finding 4: llms-full.txt for Complete Content

**Source**: [365i AI Visibility Definition](https://www.365i.co.uk/ai-visibility-definition/specifications/llms-txt/)
**Credibility**: HIGH (Specification documentation)
**Summary**: Two file types:
- **llms.txt**: Index file with links and brief descriptions. LLM must follow links.
- **llms-full.txt**: All detailed content inline. No navigation needed.

Additional variants:
- `llms-ctx.txt`: Without optional URLs
- `llms-ctx-full.txt`: With URLs

Use case: llms.txt for discovery, llms-full.txt for comprehensive context.

**Relevance to beep-effect**: Create both `specs/llms.txt` (index) and optionally `specs/llms-full.txt` (comprehensive).

---

### Finding 5: Anthropic's Token-Efficient Implementation

**Source**: [Mintlify Blog - What is llms.txt](https://www.mintlify.com/blog/what-is-llms-txt)
**Credibility**: HIGH (Hosting provider with implementation data)
**Summary**: Anthropic's implementation:
- `llms.txt`: 8,364 tokens
- `llms-full.txt`: 481,349 tokens (entire API documentation)

Benefits:
- 10x token reduction vs serving HTML
- Filters out ads, HTML markup, JavaScript-rendered elements
- Hierarchical organization for efficient navigation

**Relevance to beep-effect**: Aim for ~5-10K tokens for `specs/llms.txt`. Keep concise.

---

### Finding 6: Best Practices for File Structure

**Source**: [BigCloudy - llms.txt Guide 2026](https://www.bigcloudy.com/blog/what-is-llms-txt/) and [Bluehost Guide](https://www.bluehost.com/blog/what-is-llms-txt/)
**Credibility**: HIGH (Comprehensive guides)
**Summary**: Best practices:
- **Keep short**: 20-50 links max. Curation, not dumping.
- **Write for context**: Descriptions should help AI decide relevance
- **Update quarterly**: Keep content fresh
- **Group logically**: By product/topic, not alphabetically
- **Load instantly**: Clean, accessible file

Anti-patterns:
- Too long (>50K tokens)
- Too sparse (missing key content)
- No descriptions (just links)

**Relevance to beep-effect**: Spec index should be curated, not exhaustive. Focus on active/relevant specs.

---

### Finding 7: LangChain MCP Integration

**Source**: [LangGraph llms.txt Overview](https://langchain-ai.github.io/langgraph/llms-txt-overview/)
**Credibility**: HIGH (Official LangChain documentation)
**Summary**: LangChain built `mcpdoc`, an MCP server that:
- Exposes llms.txt to IDEs (Cursor, Claude Code)
- Gives developers control over how agents fetch documentation
- Enables audit of documentation context

Integration pattern: MCP server reads llms.txt → serves to AI agent → agent navigates documentation.

**Relevance to beep-effect**: Could create MCP server for spec navigation if needed.

---

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | All sources agree on markdown format, root placement, brief descriptions. 20-50 links is optimal. |
| **Conflicts** | Google doesn't support vs. wide industry adoption. Resolution: For internal specs, adoption concerns irrelevant. |
| **Gaps** | No research on optimal update frequency for specs. Quarterly may be too infrequent for active development. |

## Practical Examples

### Cloudflare-Style Structure for specs/llms.txt

```markdown
# beep-effect Specifications

> Specification library for the beep-effect monorepo. Agent-assisted, self-improving workflows for complex, multi-phase technical tasks.

## Active Specifications

- [spec-creation-improvements](./spec-creation-improvements/README.md): Enhancements to spec workflow based on 2025 AI trends
- [canonical-naming-conventions](./canonical-naming-conventions/README.md): Standardized naming across packages

## Domain Specifications

### IAM (Identity and Access Management)
- [iam-auth-flow](./iam/auth-flow/README.md): Authentication flow implementation
- [iam-permissions](./iam/permissions/README.md): Permission system design

### Documents
- [document-storage](./documents/storage/README.md): S3-based document storage
- [document-search](./documents/search/README.md): Full-text search implementation

## Templates and Guides

- [SPEC_CREATION_GUIDE.md](./SPEC_CREATION_GUIDE.md): How to create new specifications
- [HANDOFF_STANDARDS.md](./HANDOFF_STANDARDS.md): Inter-phase context handoff protocol
- [META_SPEC_TEMPLATE.md](./META_SPEC_TEMPLATE.md): Template for new specs

## Agent Definitions

- [agents/README.md](./agents/README.md): Overview of available agents
- [agents/codebase-researcher.md](./agents/codebase-researcher.md): Codebase exploration
- [agents/ai-trends-researcher.md](./agents/ai-trends-researcher.md): External research
- [agents/doc-writer.md](./agents/doc-writer.md): Documentation generation

## Completed Specifications

- [ai-friendliness-audit](./ai-friendliness-audit/README.md): Codebase AI-readiness audit (COMPLETE)
```

### llms-full.txt Companion (Abbreviated Example)

```markdown
# beep-effect Specifications (Full Content)

> Complete specification content for AI context. Use llms.txt for navigation, this file for comprehensive understanding.

## spec-creation-improvements

### Overview
Implement evidence-based improvements to the spec creation guide...

### Phase 0: Research Validation
- Context Engineering: Tiered memory, context rot solutions
- Orchestration: LangGraph, Google ADK patterns
...

[Full content of each spec README inlined]
```

### Recommended File Sizes

| File | Target Tokens | Content |
|------|---------------|---------|
| `specs/llms.txt` | 5-10K | Index with descriptions |
| `specs/llms-full.txt` | 50-100K | Full spec content |
| Individual spec llms.txt | 1-2K | Per-spec navigation |

## Recommendations for beep-effect

| Priority | Recommendation | Implementation Notes |
|----------|----------------|---------------------|
| P0 | Create `specs/llms.txt` following Cloudflare pattern | Domain-grouped, 20-50 links |
| P0 | Add descriptions to all links | Brief context for AI navigation |
| P1 | Create `specs/llms-full.txt` with inline content | Comprehensive but ≤100K tokens |
| P1 | Add llms.txt to spec template | Each spec gets navigation file |
| P2 | Consider MCP server for spec navigation | Based on mcpdoc pattern |
| P2 | Automate llms.txt generation | Script to compile from README files |

## Sources

### High Credibility (7 sources)
- [llmstxt.org Official Specification](https://llmstxt.org/) - Standard definition
- [Cloudflare llms.txt](https://developers.cloudflare.com/llms.txt) - Production example
- [Mintlify Blog](https://www.mintlify.com/blog/what-is-llms-txt) - Adoption story, token data
- [Semrush Analysis](https://www.semrush.com/blog/llms-txt/) - Industry perspective
- [365i Specification](https://www.365i.co.uk/ai-visibility-definition/specifications/llms-txt/) - Variant files
- [LangGraph llms.txt Overview](https://langchain-ai.github.io/langgraph/llms-txt-overview/) - MCP integration
- [BigCloudy Guide 2026](https://www.bigcloudy.com/blog/what-is-llms-txt/) - Best practices

### Medium Credibility
- [ProMarketer - What Is llms.txt](https://www.promarketer.ca/post/what-is-llms-txt) - Adoption numbers
- [Bluehost Guide](https://www.bluehost.com/blog/what-is-llms-txt/) - Practical guide
- [Yoast Developer Portal](https://developer.yoast.com/features/llms-txt/functional-specification/) - WordPress implementation
