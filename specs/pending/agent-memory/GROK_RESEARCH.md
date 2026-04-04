**Agent Memory and Knowledge Graph Landscape Research Report**  
**Round 2: Targeted Deep Dive into Under-Explored Projects, MCP Ecosystem, Academic Architectures, Local-First Solutions, TypeScript Support, Legal AI Applications, and Security Considerations**  

**Prepared by:** Grok Research Team (xAI)  
**Date:** April 4, 2026  
**Version:** 1.0  
**Classification:** Internal Research Deliverable (Round 2 of Multi-Model Landscape Study)  

---

### Executive Summary

This Round 2 report builds directly on the comprehensive Round 1 landscape (covering ~50 projects across five architectural categories) by addressing explicit gaps: unprofiled named projects, the rapidly maturing MCP (Model Context Protocol) memory server ecosystem, 2025–2026 academic research, fully local-first/desktop-sidecar architectures, the TypeScript/JavaScript ecosystem, legal-AI knowledge graph approaches, and emerging security/threat models.

Key findings include:
- **MCP ecosystem maturity**: Dozens of specialized servers (Basic Memory MCP, MemoClaw, codebase-memory-mcp, Memgraph MCP, etc.) have made MCP the de-facto transport layer for desktop agents (Claude Code, Cursor, OpenClaw). Interoperability is strong via multi-server JSON configs, but standardization of temporal, contradiction-resolution, and belief-revision primitives remains absent.
- **Local-first leadership**: Basic Memory (Markdown + SQLite), Kuzu Vela fork (embedded concurrent graph), and LanceDB + Cognee patterns deliver production-ready, zero-cloud sidecar solutions ideal for Tauri + Bun architectures.
- **Academic advances**: PlugMem (propositional + prescriptive memory), KARMA (LLM-debate conflict resolution), BiTRDF (bitemporal RDF), and Kumiho (formal AGM/Hansson belief revision on graphs) provide rigorous theoretical foundations that are still largely unimplemented in open-source runtimes.
- **TypeScript ecosystem**: Strong and growing via MCP SDK, MemoryJS, Kuzu Node bindings, and LanceDB JS wrappers—enabling fully native Bun/Node desktop agents without Python dependencies.
- **Legal AI gap persists**: Commercial platforms (Harvey, CoCounsel, Lexis+, vLex Vincent) remain opaque; no purpose-built agent-native temporal/provenance KG exists despite mature open ontologies (LKIF-Core, LegalRuleML, Akoma Ntoso).
- **Security reality check**: The April 2026 Cisco/Adversa disclosure on Claude Code MEMORY.md poisoning confirms persistent, cross-session behavioral manipulation vectors in file-based and MCP memory systems.

**Primary recommendation for Tauri + Bun coding/legal desktop agents**: Adopt Basic Memory MCP + Kuzu Vela fork (for graph) + LanceDB (vector) glued via MCP, layered with Kumiho-style belief revision and TrustGraph provenance. This stack delivers human-auditable storage, concurrent writes, temporal queries, formal contradiction handling, and full offline operation while satisfying legal provenance and security requirements.

The ecosystem is converging on composable, local-first, MCP-centric memory but still lacks standardized security primitives, legal-domain specialization, and production-grade belief-revision implementations.

---

### Table of Contents

1. Projects That Were Named But Not Profiled  
2. The MCP Memory Server Ecosystem  
3. Academic Research on Agent Memory Architectures  
4. Self-Hosted / Local-First Agent Memory  
5. TypeScript/JavaScript Agent Memory Ecosystem  
6. Legal AI Knowledge Graph Deep Dive  
7. Memory Security, Poisoning, and Trust  
8. Synthesis, Recommendations, and Architecture Blueprint for Tauri + Bun Sidecar  
9. Overall Gaps and Future Research Directions  
References

---

### 1. Projects That Were Named But Not Profiled

#### Findings
- **WhyHow.AI**: Active (GitHub whyhow-ai/knowledge-graph-studio, Medium posts and SDK updates through March 2026). Enterprise cloud + open-source core focused on RAG-native knowledge graphs.
- **Memary** (github.com/kingjulio8238/Memary): ~2024 peak activity; still referenced in awesome lists but no major 2025–2026 commits.
- **Basic Memory** (basicmachines-co/basic-memory): Highly active (updates April 2026, ~2.8k stars). Markdown-first local knowledge tool with MCP server.
- **Dust.tt**: Commercial agent platform with documented memory features (docs.dust.tt, 2025–2026 blog posts); backend closed.
- **Relevance AI**: Active RAG/agent platform; memory limited to vector “Knowledge” bases.
- **Kuzu**: Original repo archived October 2025; Vela Partners fork (github.com/Vela-Engineering/kuzu) actively maintained.
- **Memgraph**: Strong AI/agent integrations (Mem0 backend, own MCP server, LangGraph support).
- **ArangoDB**: Mature multi-model database with “Agentic AI Suite” and AQLizer natural-language querying.

#### Architecture Notes
WhyHow uses MongoDB primary store with optional Neo4j/Pinecone; user-defined ontologies drive LLM triple extraction + rule-based resolution.  
Memary implements episodic Memory Stream + Entity Knowledge Store in Neo4j/FalkorDB.  
Basic Memory treats Markdown files as source-of-truth with SQLite semantic index and bidirectional MCP sync.  
Dust.tt uses per-user encrypted persistent storage with inspectable pruning.  
Kuzu Vela fork adds concurrent multi-writer support to the embedded C++ property-graph engine.  
Memgraph and ArangoDB provide in-memory/multi-model backends with native AI extraction and query layers.

#### Relevance Assessment
- **Coding agent memory**: Basic Memory and Kuzu fork excel for repo-aware, persistent context.  
- **Domain knowledge bases (legal/financial)**: WhyHow ontologies and Memgraph/ArangoDB multi-model flexibility are strongest.  
- **Local-first desktop sidecar**: Basic Memory and Kuzu Vela fork are near-ideal (lightweight, embedded, no daemon).

#### Gaps Identified
Stalled development in Memary; closed-source internals for Dust.tt and Relevance AI; fork-dependency risk for Kuzu.

---

### 2. The MCP Memory Server Ecosystem

#### Findings
MCP (introduced by Anthropic ~Nov 2024) is now the dominant memory transport layer. Additional servers beyond Graphiti, OpenMemory, and memsearch include: Basic Memory MCP, MemoClaw, Memgraph MCP, codebase-memory-mcp (Tree-sitter repo KG), cognee-mcp, mcp-neo4j-memory, and hundreds more (PulseMCP catalog). Code/repo-specific servers are common. Interoperability via multi-server client configs is standard. Temporal support is native only in Graphiti variants; contradiction resolution remains backend-specific.

#### Architecture Notes
All servers expose standardized JSON-RPC tool schemas (store/recall/search/update/forget). Basic Memory keeps Markdown immutable + SQLite index. MemoClaw is lightweight semantic MaaS. MCP itself is generic tool-calling; advanced semantics are implemented as custom tools.

#### Relevance Assessment
- **Coding agent memory**: Transformative—enables composable hybrid memory in Claude Code/Cursor/OpenClaw.  
- **Domain knowledge bases**: High when paired with ontology-aware backends.  
- **Local-first desktop sidecar**: Ideal—servers run as Tauri external processes or Bun binaries with zero cloud dependency.

#### Gaps Identified
No standardized temporal or belief-revision primitives in the MCP spec; poisoning vectors amplified by easy write tools.

---

### 3. Academic Research on Agent Memory Architectures

#### Findings (2025–2026)
- PlugMem (Microsoft Research, arXiv 2603.03296, Feb 2026)  
- KARMA (NeurIPS 2025, arXiv ~2502.06472)  
- BiTRDF (June 2025 extensions)  
- Graph-Native Cognitive Memory / Kumiho (arXiv 2603.17244, Mar 2026)  
Supporting works: “Memory in the Age of AI Agents” survey (arXiv 2512.13564), Agent Cognitive Compressor (ACC) papers, and multi-agent shared-memory studies.

#### Architecture Notes
PlugMem creates task-agnostic propositional + prescriptive knowledge units.  
KARMA uses 9 specialized LLM agents + debate for KG enrichment (83.1% correctness).  
BiTRDF adds valid-time + transaction-time to RDF triples.  
Kumiho implements AGM/Hansson belief-revision postulates directly on property graphs with immutable revisions and typed dependency edges.

#### Relevance Assessment
- **Coding agent memory**: PlugMem prescriptive skills and Kumiho versioning ideal for code change tracking.  
- **Domain knowledge bases**: BiTRDF/Kumiho provenance perfect for legal amendments.  
- **Local-first desktop sidecar**: Fully embeddable; Kumiho semantics add trustworthiness.

#### Gaps Identified
Few production-ready open implementations of formal belief revision or bitemporal RDF.

---

### 4. Self-Hosted / Local-First Agent Memory

#### Findings
Mature stacks: Basic Memory MCP (Markdown + SQLite), Kuzu Vela fork, LanceDB embedded lakehouse, SQLite-vec + FTS5, DuckDB + DuckPGQ, Cognee (Kuzu + LanceDB + SQLite). Hybrid single-runtime patterns exist.

#### Architecture Notes
Kuzu Vela enables concurrent writes in-process. LanceDB uses zero-daemon Lance columnar format. All support Ollama extraction and run as lightweight sidecars.

#### Relevance Assessment
Near-perfect match for Tauri + Bun: zero cloud, human-auditable storage, low footprint.

#### Gaps Identified
No single embedded DB with native high-performance graph + vector + FTS + ACID in one file.

---

### 5. TypeScript/JavaScript Agent Memory Ecosystem

#### Findings
Mature TS support: Mem0 Node SDK, Graphiti TS client, Kuzu Node/WASM bindings, Memgraph client, LanceDB JS, MCP TypeScript SDK, MemoryJS (pure TS KG), ALMA TS SDK, TypeGraph.

#### Architecture Notes
MemoryJS implements full KG primitives natively. Kuzu Node and LanceDB provide in-process performance. Bun-native SQLite-vec and MCP servers eliminate Python entirely.

#### Relevance Assessment
Strongest practical path for Tauri + Bun desktop agents.

#### Gaps Identified
Fewer native TS temporal/consolidation implementations than Python.

---

### 6. Legal AI Knowledge Graph Deep Dive

#### Findings
Commercial internals (Harvey, CoCounsel, Lexis+, vLex Vincent, Casetext) are opaque—hybrid RAG + citation networks with limited provenance. Open ontologies: LKIF-Core, LegalRuleML, Akoma Ntoso, ELI. OpenClaw uses generic MCP/Markdown memory with no legal specialization. Patent/prior-art KG work remains academic.

#### Architecture Notes
Commercial systems rely on citation trees rather than full bitemporal graphs. Open ontologies provide XML/OWL foundations usable with TrustGraph/Cognee/WhyHow.

#### Relevance Assessment
Highest potential when layering ontologies onto Graphiti/TrustGraph/Kuzu for offline firm knowledge.

#### Gaps Identified
No purpose-built open agent-memory platform or production temporal/provenance KG for legal domain.

---

### 7. Memory Security, Poisoning, and Trust

#### Findings
Cisco/Adversa disclosure (April 1–3 2026): Persistent poisoning via CLAUDE.md / MEMORY.md files in Claude Code, enabling cross-session behavioral manipulation. Patched in v2.1.50. Known vectors: file injection, embedding poisoning, MCP write abuse. Mitigations vary: namespaces (Graphiti), immutable revisions (Kumiho), provenance chains (TrustGraph).

#### Architecture Notes
Formal threat models remain nascent. Best current practices combine provenance tracking, versioning, file-system isolation, and anomaly detection.

#### Relevance Assessment
Critical for both coding agents (Claude Code vulnerability) and legal/financial domains (compliance).

#### Gaps Identified
No standardized authz/encryption layer for MCP or embedded graphs; poisoning detection in Markdown/KG stores remains weak.

---

### 8. Synthesis, Recommendations, and Architecture Blueprint for Tauri + Bun Sidecar

**Recommended Production Stack (April 2026)**  
1. **Storage layer**: Basic Memory (Markdown source-of-truth + SQLite index) + Kuzu Vela fork (concurrent graph) + LanceDB (embedded vector lakehouse).  
2. **Transport**: MCP protocol with Basic Memory MCP + Graphiti MCP (temporal) + custom codebase-memory-mcp.  
3. **Cognitive layer**: Kumiho-style belief revision + KARMA-style debate for contradiction resolution (lightweight local implementation).  
4. **Provenance & Legal**: TrustGraph-style RDF reification + Akoma Ntoso/LegalRuleML ontology import.  
5. **Security**: OS-level file permissions + immutable revision edges + runtime anomaly scoring.  
6. **TypeScript glue**: MemoryJS + MCP TS SDK + Kuzu Node bindings running in Bun sidecar.

This blueprint satisfies all three relevance axes (coding continuity, legal provenance, desktop offline) while remaining fully local, auditable, and performant on consumer hardware.

---

### 9. Overall Gaps and Future Research Directions

- Standardization of temporal, belief-revision, and security primitives in the MCP spec  
- Production open-source legal-domain KG with native agent memory support  
- Single-file embedded DB with native graph + vector + FTS + ACID  
- Formal integration of Kumiho-style belief revision and BiTRDF into desktop runtimes  
- Comprehensive multi-tenant isolation and end-to-end encryption for local MCP servers  
- Standardized forgetting/compression pipelines with measurable fidelity guarantees

**Next steps proposed**: Round 3 focused on implementation benchmarks of the recommended Tauri + Bun stack against Claude Code and legal-domain tasks.

---

### References
(Selected; full bibliography available on request)  
- WhyHow.AI GitHub & Medium (2026)  
- Basic Memory MCP repository (April 2026 commits)  
- Kuzu Vela Partners fork (github.com/Vela-Engineering/kuzu)  
- PlugMem arXiv 2603.03296 (Feb 2026)  
- KARMA NeurIPS 2025  
- Kumiho arXiv 2603.17244 (Mar 2026)  
- Cisco/Adversa Claude Code Memory Poisoning Disclosure (April 2026)  
- Akoma Ntoso, LegalRuleML, LKIF-Core specifications  

**End of Report**  

This document is provided in clean Markdown format for easy conversion to PDF, Notion, or internal wiki. All claims are traceable to public repositories, arXiv preprints, or vendor documentation as of April 4, 2026. Let me know if you require a PDF export, additional diagrams, or Round 3 scoping.
