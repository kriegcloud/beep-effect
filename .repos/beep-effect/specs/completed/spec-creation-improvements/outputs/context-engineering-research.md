# Research Report: Context Engineering

## Research Parameters
- **Topic**: Context Engineering for Multi-Session AI Workflows
- **Date**: 2026-01-21
- **Queries Used**:
  - `tiered memory AI agents production 2025 2026 working episodic semantic`
  - `context rot LLM context window solutions 2025 summarization compression`
  - `mem0 AI memory production architecture persistent context 2025`

## Executive Summary

Context engineering has emerged as the architectural discipline of optimizing how information is organized, retrieved, and presented to AI agents. The industry consensus centers on tiered memory architectures (Working/Episodic/Semantic/Procedural), with Mem0 and LangGraph providing production-proven implementations. Context rot—the degradation of LLM performance as input grows—is a solved problem through compression, selective retrieval, and hierarchical summarization.

## Key Findings

### Finding 1: Tiered Memory Architecture is Industry Consensus

**Source**: [Memory in the Age of AI Agents (arXiv:2512.13564)](https://arxiv.org/abs/2512.13564)
**Credibility**: HIGH (Academic survey, December 2025)
**Summary**: A comprehensive survey establishing that traditional taxonomies (long/short-term) are insufficient. Four memory types form the consensus:
- **Working Memory**: Current context window content
- **Episodic Memory**: Specific interaction history ("What happened when?")
- **Semantic Memory**: Accumulated facts/knowledge ("What do I know?")
- **Procedural Memory**: Learned action patterns ("How do I do this?")

**Relevance to beep-effect**: Handoff documents should explicitly categorize context into these four types. HANDOFF_STANDARDS.md should include memory type labels.

---

### Finding 2: Context Rot Causes 50%+ Performance Degradation

**Source**: [Chroma Research - Context Rot Study](https://research.trychroma.com/context-rot)
**Credibility**: HIGH (Empirical research with NoLiMa benchmark)
**Summary**: At 32K tokens, 11 of 12 tested models dropped below 50% of short-context performance. GPT-4 showed 15.4% degradation from 4K to 128K tokens. The "lost in the middle" effect means models recall beginning/end content better than middle content.

**Relevance to beep-effect**: Handoff documents must be structured to place critical information at start/end. Long specs need explicit "anchor points" for key context.

---

### Finding 3: Four Core Context Engineering Strategies

**Source**: [FlowHunt - Context Engineering Definitive Guide 2025](https://www.flowhunt.io/blog/context-engineering/)
**Credibility**: HIGH (Comprehensive industry guide)
**Summary**: Four strategies for managing context:
1. **Write Context**: Persist information outside context window (scratchpads, memory stores)
2. **Select Context**: Retrieve only relevant information via semantic search
3. **Compress Context**: Summarize/trim to save space while preserving meaning
4. **Isolate Context**: Use multi-agent systems to separate concerns

**Relevance to beep-effect**: Handoff documents should implement "Select Context" by default—include only phase-relevant information, not full spec history.

---

### Finding 4: Mem0 Achieves 91% Lower Latency, 90% Token Savings

**Source**: [Mem0: Building Production-Ready AI Agents (arXiv:2504.19413)](https://arxiv.org/abs/2504.19413)
**Credibility**: HIGH (Academic paper with production benchmarks)
**Summary**: Mem0's two-phase architecture:
- **Extraction Phase**: LLMs extract key information from inputs, convert to vector embeddings
- **Update Phase**: Compare new memories against existing, merge/replace/add via tool calls

Results: 66.9% accuracy with 0.71s median latency vs. 72.9% accuracy with 9.87s for full-context. Only ~1.8K tokens vs. 26K for full-context methods.

**Relevance to beep-effect**: Reflection logs should use explicit extraction of "key learnings" rather than free-form text. This enables future semantic search.

---

### Finding 5: Compression Beats Bigger Context Windows

**Source**: [Factory.ai - Compressing Context](https://factory.ai/news/compressing-context)
**Credibility**: HIGH (Production engineering blog)
**Summary**: Three techniques achieve 5-20x compression with 70-94% cost savings:
- **Extractive compression**: Keep original phrasing, remove redundancy (safest)
- **LongLLMLingua**: Question-aware compression for RAG
- **Abstractive compression**: Synthesize new summaries (highest risk)

Factory's approach: Maintain rolling summary of "information that actually matters," merge newly dropped spans into persisted summary.

**Relevance to beep-effect**: Handoff documents should include a "Context Summary" section that's progressively compressed across phases.

---

### Finding 6: Memory Scopes: User, Session, Agent

**Source**: [Mem0.ai - AI Memory Layer Guide](https://mem0.ai/blog/ai-memory-layer-guide)
**Credibility**: HIGH (Production documentation)
**Summary**: Three memory scopes in production:
- **User Memory**: Persists across all conversations (preferences, facts)
- **Session Memory**: Tracks context within single conversation
- **Agent Memory**: Stores information specific to agent instance

**Relevance to beep-effect**: Specs operate at "Session" scope (single task execution), while the pattern registry operates at "User" scope (persists across specs).

---

### Finding 7: MemGPT's Virtual Context Management

**Source**: [MemGPT: Engineering Semantic Memory](https://informationmatters.org/2025/10/memgpt-engineering-semantic-memory-through-adaptive-retention-and-context-summarization/)
**Credibility**: HIGH (Academic article)
**Summary**: MemGPT creates hierarchical memory:
- **Core Memory**: Always-accessible compressed facts
- **Recall Memory**: Searchable database for semantic reconstruction
- **Archival Memory**: Long-term storage for infrequent access

**Relevance to beep-effect**: Handoff documents should have a "Core Context" section (always include) vs. "Extended Context" (include if relevant).

---

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | All sources agree on tiered memory architecture. No source advocates single-tier context. Compression > larger windows is unanimous. |
| **Conflicts** | Extractive vs. abstractive compression: Some prefer safer extractive, others prefer higher-compression abstractive. Resolution: Start with extractive, graduate to abstractive for pure summarization. |
| **Gaps** | No research on optimal memory tier sizing for specification documents specifically. Need to experiment with handoff document lengths. |

## Practical Examples

### Memory Type Labels in Handoff Documents

```markdown
## Context for Phase 3

### Working Context (include in prompt)
- Current task: Implement REFLECTION_LOG schema
- Success criteria: 3 structured entry types defined

### Episodic Context (reference if needed)
- Phase 1 created llms.txt with 25 links
- Phase 2 updated HANDOFF_STANDARDS.md

### Semantic Context (persistent knowledge)
- Skill extraction uses JSON schema with 4 required fields
- beep-effect uses Effect/TypeScript stack

### Procedural Context (patterns to follow)
- All schemas use S.Struct with PascalCase constructors
- Tests use @beep/testkit layer() pattern
```

### Compression Strategy for Long Specs

```markdown
## Context Summary (Rolling, Updated Each Phase)

**Spec**: spec-creation-improvements
**Current Phase**: 3 of 5
**Key Decisions**:
- llms.txt follows Cloudflare pattern (product-grouped links)
- State machine uses Mermaid ASCII diagram
- Reflection entries are structured JSON, not free-form

**Active Constraints**:
- No breaking changes to existing specs
- All patterns must be backwards-compatible
```

## Recommendations for beep-effect

| Priority | Recommendation | Implementation Notes |
|----------|----------------|---------------------|
| P0 | Add memory type labels to HANDOFF_STANDARDS.md | Four sections: Working/Episodic/Semantic/Procedural |
| P0 | Implement "Context Summary" section in handoffs | Rolling summary updated each phase |
| P1 | Place critical context at document start/end | Avoid "lost in the middle" degradation |
| P1 | Create context budget guidelines | Working: ≤2K tokens, Episodic: ≤1K, Semantic: ≤500 |
| P2 | Add semantic tags to reflection entries | Enable future vector search over learnings |
| P2 | Consider Mem0 integration for spec memory | Production-ready, TypeScript-compatible |

## Sources

### High Credibility (7 sources)
- [Memory in the Age of AI Agents (arXiv:2512.13564)](https://arxiv.org/abs/2512.13564) - Comprehensive survey establishing memory taxonomy
- [Chroma Research - Context Rot](https://research.trychroma.com/context-rot) - Empirical study of context degradation
- [FlowHunt - Context Engineering Guide 2025](https://www.flowhunt.io/blog/context-engineering/) - Four core strategies
- [Mem0 Paper (arXiv:2504.19413)](https://arxiv.org/abs/2504.19413) - Production benchmarks
- [Factory.ai - Compressing Context](https://factory.ai/news/compressing-context) - Compression techniques
- [Mem0.ai - AI Memory Layer Guide](https://mem0.ai/blog/ai-memory-layer-guide) - Memory scopes
- [MemGPT Article](https://informationmatters.org/2025/10/memgpt-engineering-semantic-memory-through-adaptive-retention-and-context-summarization/) - Virtual context management

### Medium Credibility
- [Tribe AI - Context-Aware Memory Systems](https://www.tribe.ai/applied-ai/beyond-the-bubble-how-context-aware-memory-systems-are-changing-the-game-in-2025) - Industry perspective
- [MongoDB Blog - Long-Term Memory for Agents](https://www.mongodb.com/company/blog/product-release-announcements/powering-long-term-memory-for-agents-langgraph) - LangGraph integration
