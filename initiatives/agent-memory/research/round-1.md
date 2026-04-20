# Agent Memory and Knowledge Graph Landscape in 2026

**The agent memory ecosystem has reached an inflection point.** What was experimental in 2024 is now production infrastructure: dedicated memory platforms process hundreds of millions of API calls quarterly, temporal knowledge graphs track fact validity across time, and MCP has emerged as the de facto standard for connecting agents to memory systems. The critical architectural shift is the convergence of vector search and graph reasoning — vector stores handle semantic breadth while graphs provide relational depth, temporal tracking, and provenance. No single platform yet delivers the full stack of capabilities needed for sophisticated expert memory (claims modeling, evidence chains, bitemporal lifecycle, bounded retrieval), but Zep/Graphiti comes closest for temporal reasoning, TrustGraph leads on provenance, and the overall landscape is maturing rapidly toward these goals.

The market spans roughly **50+ significant projects** across five categories: dedicated agent memory platforms, graph-based knowledge systems, vector databases, agent framework memory modules, and specialized tools for code intelligence or domain knowledge. Funding has accelerated — Mem0 raised $24M, Greptile $25M, Weaviate $50M, Qdrant $50M — signaling investor conviction that memory is the next critical layer of the AI stack.

---

## The five archetypes of agent memory architecture

The landscape organizes into five distinct architectural approaches, each with fundamentally different tradeoffs.

**Temporal knowledge graphs** (Zep/Graphiti, TrustGraph) represent the most sophisticated approach. Graphiti implements a **bitemporal model** where facts carry both a validity window (when the fact was true in the real world) and a transaction timestamp (when the system learned about it). This enables point-in-time queries and automatic supersession — when new information contradicts existing facts, old facts are invalidated rather than deleted. TrustGraph extends this with RDF reification, where every agent interaction becomes a first-class node in the graph with full metadata about the model used, reasoning chain, and confidence score. These systems excel at evolving knowledge but carry higher complexity.

**Hybrid vector-graph platforms** (Mem0, Cognee) pair semantic embedding search with graph-structured entity relationships. Mem0's three-tier architecture (key-value + graph + vector) uses a two-phase pipeline: an extraction phase pulls entities and relations, then an update phase runs conflict detection and LLM-powered resolution to decide whether to add, merge, invalidate, or skip each memory. Cognee takes a different path with its "memify" pipeline that prunes stale nodes and reweights edges over time, creating a self-improving memory. Both offer more practical entry points than full temporal graphs.

**Self-editing agent memory** (Letta/MemGPT) inverts the paradigm entirely. Rather than an external service managing memory, the LLM itself actively reads, writes, and reorganizes its own memory through tool calls. Letta's OS-inspired hierarchy — core memory (always in context, like RAM), recall memory (searchable conversation history), and archival memory (unlimited vector-backed storage) — gives agents genuine autonomy over what they remember. This is architecturally unique but depends heavily on model reasoning quality.

**Document-graph RAG systems** (Microsoft GraphRAG, LightRAG, nano-graphrag) build knowledge graphs from document corpora via LLM-powered entity extraction, then use graph structure to enhance retrieval. Microsoft GraphRAG's Leiden community detection creates hierarchical summaries enabling "global" queries across entire corpora. LightRAG achieves **70–90% of GraphRAG's quality at 1/100th the cost** through a flat graph with dual-level retrieval, making it the pragmatic choice for most teams.

**Framework-integrated memory** (LangMem, CrewAI Cognition, LlamaIndex Memory Blocks) provides memory as composable primitives within existing agent frameworks. CrewAI's rebuilt "Cognition Memory" (March 2026) is notably sophisticated — it runs five cognitive operations (encode, consolidate, recall, extract, forget) with LLM-powered importance scoring and contradiction detection, creating a self-organizing hierarchy without schema design.

---

## Detailed profiles of the top 20 projects

### Zep and Graphiti — the temporal knowledge graph leader

Zep's open-source engine Graphiti (~20,000 GitHub stars, Apache 2.0) is the only production system with a formal bitemporal data model for agent memory. Its three-tier subgraph hierarchy — episode subgraph (raw data as ground truth), semantic entity subgraph (extracted entities with embedding-based resolution), and community subgraph (higher-level aggregations) — ensures every derived fact traces back to source episodes. Graph backends include Neo4j, FalkorDB, Kuzu, and Amazon Neptune.

Retrieval combines semantic embeddings, BM25 full-text search, and graph traversal, with **P95 latency under 200ms** — fast enough for voice agents. Benchmarks show **94.8% on Deep Memory Retrieval** (vs. MemGPT's 93.4%) and 63.8% on LongMemEval (vs. Mem0's 49.0%), a 15-point gap attributable to temporal architecture. Zep Cloud is SOC 2 Type II certified with HIPAA BAA availability and BYOC/BYOK options. Pricing runs from free tier through metered ($1.25/1K messages) to custom enterprise. Graphiti's MCP server v1.0 has reached hundreds of thousands of weekly users.

### Mem0 — largest ecosystem, most flexible deployment

Mem0 commands the largest developer community in agent memory with **~48,000 GitHub stars** and 13M+ Python downloads. Its hybrid architecture spans 19 vector store backends (Qdrant, Chroma, Weaviate, Milvus, PGVector, and more), graph storage via Neo4j or Kuzu, and key-value stores. The conflict detection pipeline uses an LLM-powered update resolver that decides add/merge/invalidate/skip for each incoming memory.

Growth metrics are striking: API calls grew from 35M (Q1 2025) to **186M (Q3 2025)**, a 30% month-over-month pace. Mem0 is the exclusive memory provider for AWS's Agent SDK (Strands). OpenMemory MCP provides a privacy-first local alternative. Graph memory (Mem0g) shows ~2% improvement on complex multi-hop questions but is gated behind the $249/month Pro tier. The $24M Series A (October 2025) from Basis Set Ventures positions it for aggressive enterprise expansion.

### SuperMemory — the all-in-one coding agent memory

SuperMemory bundles five capabilities into a single API: memory engine, user profiles, hybrid search (SuperRAG), real-time connectors (Google Drive, Gmail, Notion, GitHub), and file processing. Its automatic forgetting mechanism handles temporal facts naturally — "I have an exam tomorrow" expires after the date passes. The coding agent plugin ecosystem is the strongest in the market, with first-party plugins for **Claude Code, OpenCode, Cursor, and OpenClaw**.

Founded by 19-year-old Dhravya Shah with a $2.6M seed round (angels include Jeff Dean and Logan Kilpatrick), SuperMemory is the youngest serious contender. It claims benchmark leadership on LongMemEval (81.6%), though these results are self-reported. The closed-source core limits transparency and customization compared to Graphiti or Mem0. Pricing is aggressive at $19/month for 3M tokens.

### Letta (formerly MemGPT) — agents that manage their own memory

Letta's fundamental innovation is that **the LLM actively manages its own memory** via tool calls like `memory_replace`, `memory_insert`, and `memory_rethink`. This OS-inspired architecture (core memory as RAM, recall as recent disk, archival as long-term storage) gives agents genuine self-improvement capability. Sleep-time agents can manage memory asynchronously in the background.

The Agent File (.af) format (April 2025) enables serializing and porting stateful agents between environments. Letta Code ranked #1 model-agnostic agent on Terminal-Bench. PostgreSQL with pgvector handles production persistence, while SQLite + ChromaDB works for development. The project originated from UC Berkeley research and raised a $10M seed led by Felicis with angels including Jeff Dean. Apache 2.0 licensed with ~13K GitHub stars.

### Microsoft GraphRAG — the research-backed document intelligence system

Microsoft GraphRAG builds knowledge graphs from document corpora using LLM-powered entity extraction, Leiden community detection for hierarchical clustering, and dual search modes (local entity neighborhoods and global community-level map-reduce summarization). The global search mode is uniquely powerful for queries like "summarize all themes across this corpus" that pure vector RAG cannot handle.

The cost challenge is real: **indexing 10,000 documents runs to four figures**, with entity extraction consuming 58% of total tokens. LazyGraphRAG (June 2025) reduces indexing cost to 0.1% of full GraphRAG. DRIFT search combines local and global for 40–60% cost reduction. MIT licensed with ~29,800 GitHub stars. Dynamic Community Selection (January 2025) cut token usage by 79%. Incremental updates remain "clunky" as of early 2026, and there is no explicit temporal or provenance modeling.

### LightRAG — the pragmatic graph RAG choice

LightRAG delivers dual-level retrieval (low-level entity-specific and high-level thematic) without community detection or pre-generated summaries, enabling **incremental updates without full graph rebuilds**. It indexes 500 pages in ~3 minutes at ~$0.50 cost — two orders of magnitude cheaper than Microsoft GraphRAG while achieving 70–90% of its quality.

Published at EMNLP 2025 with MIT license, LightRAG supports multiple backends (Neo4j, PostgreSQL AGE, Milvus, Qdrant, Chroma for vectors; NetworkX or Neo4j for graphs). RAG-Anything extends it to multimodal documents. The flat graph architecture makes it far more practical for production systems that need ongoing updates. It was built on top of the nano-graphrag codebase.

### TrustGraph — strongest provenance and evidence modeling

TrustGraph is architecturally unique as a "Context Operating System" built on containerized microservices. Its **RDF-based knowledge representation with reification** means every agent interaction — including the model used, temperature setting, system prompt, and reasoning chain — becomes a first-class node in the graph. "Context Cores" are portable, versioned bundles of knowledge (embeddings + evidence + policies) that can be treated like code artifacts.

OWL ontology-driven extraction follows a "what should we extract?" philosophy rather than extracting everything. Graph backends include Neo4j, Cassandra, Memgraph, and FalkorDB; one community member runs **1B+ nodes/edges on Cassandra**. Apache 2.0 licensed with native MCP support and 40+ LLM provider integrations. For any system requiring full audit trails, evidence chains, and trust modeling, TrustGraph is the clear architectural leader — though it demands more infrastructure expertise than turnkey alternatives.

### Cognee — self-improving memory with provenance chains

Cognee's poly-store architecture (graph + vector + relational) processes data through a six-stage pipeline: classify, permissions, chunk, LLM entity extraction, summarize, and embed. The "memify" pipeline then refines the graph post-ingestion by pruning stale nodes, reweighting edges, and deriving new facts. Every inferred entity maintains a strict provenance chain linking back to source DocumentChunk and TextDocument.

Default backends (Kuzu + LanceDB + SQLite) enable zero-infrastructure deployment via pip install. Production deployments reach 100+ containers processing 1GB in 40 minutes. With **~7,000 GitHub stars** and a $7.5M seed round, Cognee serves 70+ companies including Bayer. Its 14 retrieval modes — from classic RAG to chain-of-thought graph traversal — and ontology-driven validation make it especially strong for regulated industries. Apache 2.0 licensed.

### FalkorDB — sparse matrix graph performance

FalkorDB (successor to RedisGraph) takes a unique approach: it represents property graphs as **sparse matrices and uses linear algebra** (GraphBLAS with AVX acceleration) for query execution instead of traditional graph traversal. This yields extraordinary performance — sub-10ms query latency, 600K queries/second claimed, and 0.3s on complex 7-hop queries. Redis-protocol compatible on port 6379.

The GraphRAG SDK includes ontology management for structured knowledge extraction. Multi-tenant native, with deployment now available on Snowflake (March 2026). The SSPLv1 license is not truly open source. Graphiti and Mem0 both support FalkorDB as a backend, making it a performant infrastructure choice for agent memory systems built on top.

### Neo4j — the enterprise graph ecosystem standard

Neo4j remains the most widely deployed graph database, with multiple AI integration layers emerging in 2025–2026. Neo4j Aura Agent provides end-to-end agent deployment. The neo4j-agent-memory Labs project implements three memory types (short-term, long-term, reasoning) with a POLE+O entity model. Graphiti/Zep was originally built on Neo4j.

The Neo4j GraphRAG Python package handles entity extraction, and the Context Provider generates human-readable Cypher for explainability. Enterprise-grade with decades of deployment experience, though **374x slower than Kuzu on analytical path queries** in benchmarks. GPL v3 for Community Edition, commercial for Enterprise. Broadest framework ecosystem of any graph database (LangChain, LlamaIndex, AG2, Microsoft Agent Framework, AWS Strands).

### Milvus/Zilliz and memsearch — scalable vectors with human-readable memory

Milvus (42,000+ GitHub stars, the highest among vector databases) provides distributed vector search at billion-scale with sub-10ms latency. The significant 2026 development is **memsearch** (MIT license), a Markdown-first memory system extracted from the OpenClaw agent. All memories are stored as plain-text Markdown files — human-readable and editable — indexed by Milvus for semantic retrieval. Session anchors with timestamps and SHA-256 chunk hashes provide audit trails.

Memsearch includes plugins for Claude Code, OpenCode, and Codex. The approach is philosophically interesting: rather than opaque vector embeddings, memory remains in a format humans can inspect, edit, and version-control with Git. Zilliz Cloud (fully managed) offers a free tier with 5GB storage.

### Qdrant — fastest open-source vector database

Written entirely in Rust with SIMD optimizations, Qdrant delivers **P95 latency of 22ms at 10M vectors** (vs. Pinecone's 45ms) with 2–3x less memory than Go-based alternatives. Built-in quantization reduces RAM by up to 97%. Rich JSON payloads enable storing arbitrary metadata alongside vectors, and advanced filtering (must/must_not/should clauses) enables sophisticated retrieval.

Qdrant Edge (July 2025, private beta) brings vector search to edge devices and robotics. With **29,000+ GitHub stars** and a $50M Series B (March 2026), enterprise customers include Tripadvisor, HubSpot, Canva, and Bosch. Apache 2.0 licensed. It serves as the vector backend for Mem0, Cognee, CrewAI, and many other memory systems.

### Weaviate — hybrid search with emerging agent memory product

Weaviate's native hybrid search — BM25 keyword matching + vector similarity in a single API call — distinguishes it from pure vector databases. In 2025, Weaviate launched "Weaviate Agents" as first-class agentic services: Query Agent (GA), Transformation Agent, and Personalization Agent. Most notably, **"Engram"** was announced for early 2026 preview — a dedicated memory product designed for maintained (not just stored) agent memory with write control, deduplication, reconciliation, and purposeful forgetting.

At **$200M valuation** after a $50M Series C (October 2025), Weaviate serves 2,000+ companies in production. BSD-3 licensed with 14,000+ GitHub stars. Production-ready for billions of objects with sub-50ms P95 latency, though higher memory overhead than Qdrant due to Go's garbage collector.

### CrewAI Cognition Memory — self-organizing multi-agent memory

CrewAI completely rebuilt its memory system in March 2026 as "Cognition Memory" — a unified `Memory()` class with five cognitive operations: encode, consolidate, recall, extract, and forget. The system **self-organizes without schema design**: an LLM analyzes content on save, infers scope, categories, and importance (0–1 score), and structures emerge automatically. Composite scoring blends semantic similarity, recency (with configurable half-life decay), and importance.

Built on LanceDB (replacing ChromaDB/SQLite), it includes built-in contradiction detection and source-scoped privacy for multi-user isolation. With **15,200+ GitHub stars** and billions of agentic executions processed, CrewAI's Cognition Memory represents the most sophisticated framework-integrated memory system. MIT licensed.

### LangMem — procedural memory for LangGraph

LangMem is unique in offering **procedural memory** — agents can rewrite their own system instructions based on feedback, a capability no other platform provides. As a free library (not a service), it provides storage-agnostic primitives: semantic memory (facts), episodic memory (past interactions as few-shot examples), and procedural memory (self-updating prompts). The background memory manager handles extraction and consolidation outside the conversation flow.

Tightly coupled to LangGraph with no standalone REST API or MCP support, it's the right choice for teams already invested in the LangChain ecosystem who want zero vendor lock-in. Multiple prompt optimization algorithms (metaprompt, gradient, prompt_memory) support automated agent improvement. Part of the MIT-licensed LangChain ecosystem.

### Greptile — production code intelligence for agents

Greptile indexes entire repositories into a code graph with AST awareness and multi-hop dependency tracing. Its V4 engine (early 2026) achieved a **74% increase in addressed PR comments** through improved accuracy. Independent benchmarks show an 82% bug catch rate (vs. Cursor 58%, Copilot 54%, CodeRabbit 44%).

The Genius API ($0.45/request) enables building custom tools on top of codebase understanding. With a $25M Series A (September 2025) at $180M valuation, Greptile is the closest production-grade solution to "repo memory," though it focuses on code review rather than persistent session memory. SOC2 Type II certified.

### Sourcegraph Cody — deepest code graph technology

Backed by a decade of code intelligence R&D, Cody's "universal code graph" captures semantic understanding of code (not just text similarity). Tree-sitter AST parsing reduces hallucinations like type errors and imaginary function names. Multi-repo awareness enables pulling context across all repositories. Used by **4 of 6 top US banks** and 15+ US government agencies.

The code graph is the most mature semantic code understanding system available but focuses on real-time context provision rather than persistent session memory. Enterprise-grade with zero code retention, audit logs, and SOC 2/GDPR/CCPA compliance.

### Vectara — enterprise RAG with hallucination controls

Vectara positions itself as the "Snowflake of RAG" with a centralized platform preventing "RAG Sprawl." Founded by ex-Google AI researchers, its standout feature is the **Factual Consistency Score (FCS)** using the HHEM hallucination detection model, plus an automatic Hallucination Corrector. Guardian Agents provide an always-on governance layer. Open RAG Eval (developed with University of Waterloo) provides open-source RAG evaluation.

Deployment options span SaaS, VPC, and on-premise. The legal-assistant demo using vectara-agentic demonstrates domain applicability, though it lacks legal-specific ontologies.

### Haystack — context engineering for production RAG

Haystack (Apache 2.0, 19,600+ GitHub stars) by deepset provides the most explicit pipeline control and observability of any agent framework. The distinction between document stores (change on explicit indexing) and memory stores (evolve automatically) is well-designed. Mem0 integration (haystack-experimental) wraps Mem0 as a memory backend with automatic fact extraction and decay.

Serializable, Kubernetes-ready pipelines serve via REST APIs or MCP servers (Hayhooks). Used by the European Commission, German Federal Ministry, and NHS. Strong European/public sector presence.

---

## Comparison matrix across evaluation dimensions

| Project | Architecture | Temporal Awareness | Provenance | Contradiction Handling | Deployment | License | MCP Support | Persistence | Code Intelligence | Legal Suitability | Production Maturity |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Zep/Graphiti** | Temporal KG | ★★★★★ Bitemporal | ★★★★★ Episode-level | ★★★★★ Automated supersession | Cloud + BYOC + OSS | Apache 2.0 | ★★★★★ Native | Neo4j/FalkorDB/Kuzu | — | ★★★★ Temporal facts | ★★★★★ |
| **Mem0** | Hybrid V+G+KV | ★★ Timestamps only | ★★★ Metadata | ★★★★ LLM resolver | Cloud + Self-hosted + Air-gap | Apache 2.0 | ★★★★ OpenMemory | 19 vector backends | — | ★★★ General | ★★★★★ |
| **SuperMemory** | All-in-one | ★★★ Auto-forgetting | ★★ Closed source | ★★★★ Auto-resolution | Cloud + Enterprise VPC | Closed core | ★★★★★ Universal + plugins | Cloud-managed | ★★★★ AST-aware chunking | ★★★ Via plugins | ★★★ |
| **Letta** | Self-editing tiered | ★★ Agent-driven | ★★★ Tool-call traced | ★★★ Agent-driven | Docker + Cloud + pip | Apache 2.0 | ★★ Not native | PostgreSQL + pgvector | ★★★ Letta Code | ★★ General | ★★★★ |
| **MS GraphRAG** | Document graph | ★ Static batch | ★★★ Text chunk IDs | ★ None | Self-hosted Python | MIT | ★ None | Various backends | — | ★★★★ Global queries | ★★★★ |
| **LightRAG** | Hybrid V+G | ★★ Incremental | ★★★ Source excerpts | ★ None | Self-hosted Python | MIT | ★ None | NetworkX/Neo4j + vectors | — | ★★★ Cost-effective | ★★★ |
| **TrustGraph** | RDF + reification | ★★★★ Versioned cores | ★★★★★ Full reification | ★★★★ Ontology enforcement | Docker/K8s | Apache 2.0 | ★★★★★ Native + auth | Neo4j/Cassandra + Qdrant | — | ★★★★★ Audit trails | ★★★ |
| **Cognee** | Poly-store (G+V+R) | ★★★ Self-improving | ★★★★★ Strict chains | ★★★ Memify pruning | pip (zero-infra) | Apache 2.0 | ★★ Partial | Kuzu + LanceDB + SQLite | ★★★ Parso/Jedi | ★★★★ Ontology validation | ★★★★ |
| **FalkorDB** | Sparse matrix graph | ★ Real-time updates | ★★ Graph paths | ★ None | Docker/Cloud/Snowflake | SSPLv1 | ★★ Via SDK | In-memory + persistence | — | ★★★ Explainable | ★★★★ |
| **Neo4j** | Property graph | ★★★★★ Via Graphiti | ★★★★ Via Graphiti | ★★★★★ Via Graphiti | Aura/Self-hosted | GPL v3 / Commercial | ★★★ Labs | Disk + memory | — | ★★★★ Cypher explainability | ★★★★★ |
| **Qdrant** | Vector + payload | ★ Metadata filtering | ★ Payload metadata | ★ None | Docker/Cloud/Edge | Apache 2.0 | ★★ Community | Rust-native on-disk | — | ★★ General | ★★★★★ |
| **Weaviate** | Hybrid V+structured | ★★★ Engram (preview) | ★★ Module metadata | ★★★ Engram (planned) | Docker/Cloud/Hybrid | BSD-3 | ★★ Community | Go-native | — | ★★ General | ★★★★★ |
| **Milvus + memsearch** | Distributed vector + MD | ★★ Session anchors | ★★★ SHA-256 hashes | ★ None | Lite/Docker/K8s/Cloud | Apache 2.0 / MIT | ★★★ memsearch plugins | Distributed storage | ★★★ memsearch plugins | ★★ General | ★★★★★ |
| **CrewAI Cognition** | Self-organizing | ★★★ Recency decay | ★★★ Source-scoped | ★★★★ Built-in detection | Framework-integrated | MIT | ★★ Via tools | LanceDB | — | ★★ General | ★★★★ |
| **LangMem** | Library primitives | ★ None | ★ None | ★★ Consolidation | Self-managed | MIT | ★ None | Pluggable stores | — | ★ None | ★★★ |
| **Greptile** | Code graph + AST | ★ None | ★★★ Git history | ★ None | SaaS + self-hosted | Partially open | ★ None | Cloud | ★★★★★ Full AST | ★ None | ★★★★ |
| **Haystack** | Pipeline framework | ★★ Via Mem0 | ★★ Document stores | ★★ Via Mem0 | Self-hosted + Cloud | Apache 2.0 | ★★★ Hayhooks | Multiple doc stores | — | ★★ General | ★★★★ |
| **Vectara** | Enterprise RAG | ★ None | ★★★★ Inline citations | ★★★★ Hallucination corrector | SaaS/VPC/On-prem | Proprietary | ★★ Via integrations | Cloud-managed | — | ★★★★ FCS + citations | ★★★★★ |

---

## Recommendations by use case

### Coding agent memory (Claude Code, Codex CLI)

The coding agent memory space has a clear gap: **no tool bridges code intelligence with persistent session memory.** Greptile and Sourcegraph Cody understand codebases deeply (AST, dependency graphs, symbol resolution) but don't track session history. Memory tools track sessions but don't understand code structure.

**Recommended stack for today:** Use Claude Code's native three-layer memory (CLAUDE.md + Auto Memory + Memory Tool) as the foundation, augmented by **memsearch** (Zilliz/Milvus) for human-readable Markdown-based memory with semantic search, or **SuperMemory's Claude Code plugin** for cloud-based memory with contradiction resolution. For codebase understanding, integrate Greptile's Genius API as a read-only knowledge source.

**For maximum sophistication:** Pair **Graphiti** (temporal knowledge graph for evolving project context) with a code graph tool. Codex CLI's built-in Rust memory system — with two-phase extraction→consolidation, SQLite persistence, and secret redaction — is the most sophisticated native implementation and worth studying as an architectural reference.

**Key watch:** Weaviate's Engram (in preview) could become the first purpose-built memory product that handles write control, deduplication, and purposeful forgetting for coding workflows.

### Building domain knowledge bases (legal, finance, compliance)

**For general-purpose agent knowledge bases:** Start with **Cognee** for its zero-infrastructure setup, strict provenance chains, ontology-driven validation, and 14 retrieval modes. Its self-improving memify pipeline adapts to domain-specific patterns over time. For teams needing maximum temporal reasoning, **Zep/Graphiti** provides the bitemporal model necessary for tracking how domain knowledge evolves.

**For finance and compliance:** **TrustGraph** is architecturally ideal — its OWL ontology support, full reification (complete audit trails), and Context Cores (portable, versioned knowledge bundles) map directly to regulatory requirements. Pair with **Neo4j** as the graph backend for enterprise maturity.

**For teams prioritizing scale and ecosystem:** **Mem0** offers the broadest integration story (19 vector backends, AWS Strands integration, 21 framework integrations) with the lowest friction path to production. Its graph memory on Kuzu handles entity relationships, though the $249/month Pro tier for graph features is a consideration.

### Legal AI knowledge systems

**The honest assessment: no existing agent memory platform is purpose-built for legal knowledge.** The legal AI space is dominated by established players — Harvey AI ($190M ARR, used by 100,000+ lawyers), Westlaw/CoCounsel (40,000+ databases with KeyCite citation verification), and Lexis+ AI (real-time Shepard's validation) — none of which expose their knowledge graphs for custom agent development.

**Building a legal agent memory system requires combining multiple tools.** The critical requirements are citation chain validation, authority hierarchy modeling (binding vs. persuasive authority), temporal law modeling (statutes amended, overruled, superseded), jurisdiction awareness, and hallucination prevention. **TrustGraph** best matches these needs architecturally: RDF reification captures evidence chains, OWL ontologies model legal hierarchies, Context Cores version knowledge bundles, and full audit trails satisfy regulatory requirements.

**Practical approach:** Use **Vectara** for the RAG layer (its Factual Consistency Score and Hallucination Corrector are critical for legal applications where 700+ court cases have already involved AI hallucinations), backed by **Graphiti** for temporal fact management (statutes change over time, precedents get overruled). For citation network analysis, build a custom graph in **Neo4j** using established Cypher patterns for authority hierarchies.

**Note on OpenClaw:** Despite the URL suggesting legal AI, OpenClaw (openclaw.ai) is actually a general-purpose autonomous agent framework (formerly Clawdbot/Moltbot, 247K+ GitHub stars). It is not a legal domain tool — it's an LLM-agnostic local agent runtime that connects to messaging platforms as UI.

---

## Architectural insights for sophisticated expert memory

The ideal expert memory architecture — combining claims modeling, evidence chains, provenance, temporal lifecycle, bounded retrieval, and control planes — does not exist as a single product. Here is how each requirement maps to current capabilities and where the gaps remain.

**Claims and evidence modeling** is the least served requirement. TrustGraph's RDF reification comes closest by making every assertion a first-class entity with metadata about its source, reasoning chain, and confidence. The academic KARMA framework (NeurIPS 2025) demonstrates LLM-based debate mechanisms for conflict resolution between multiple agents, achieving 4.6–14.4% accuracy improvement. ClaimVer provides explainable claim-level verification against knowledge graph triplets. But no production system lets you represent competing claims about the same fact, assign confidence scores, and trace evidence chains — this requires custom engineering on top of TrustGraph or Graphiti.

**Bitemporal lifecycle management** is available in Graphiti (validity windows + transaction timestamps), making it possible to answer "what did we believe was true on date X about fact Y." TrustGraph's versioned Context Cores provide a complementary approach — treating knowledge bundles like code with version control. Academic work on BiTRDF (June 2025) extends RDF with proper bitemporal semantics but remains research-stage.

**Bounded retrieval** — controlling what the agent can see based on authorization, jurisdiction, or temporal scope — maps to Mem0's source-scoped privacy (memories tagged with `source=` for multi-user isolation), CrewAI Cognition's source-scoped memory, and TrustGraph's multi-tenancy. None provide the fine-grained, policy-driven access control that a true expert memory control plane would need.

**The architectural recommendation** for teams building sophisticated expert memory: use **Graphiti as the temporal knowledge graph core** (bitemporal facts, entity resolution, provenance to source episodes), **TrustGraph's reification pattern** for evidence and trust modeling (even if you reimplement it on Neo4j rather than deploying TrustGraph's full microservice architecture), **Qdrant** as the vector layer for semantic retrieval, and build a custom control plane on top. PlugMem (Microsoft Research, February 2026) is worth watching — it transforms raw interactions into structured propositional knowledge (facts) and prescriptive knowledge (skills) using a task-agnostic plugin memory approach.

---

## Emerging trends and notable gaps

**The convergence toward "context engineering"** is the defining trend of 2026. The field has shifted from "prompt engineering" to systematic design of the full information pipeline — memory, retrieval, tools, and context — that feeds LLMs. OpenAI's January 2026 cookbook formalized context engineering patterns including state management with long-term memory notes. Every major framework now treats memory as a first-class architectural concern rather than an afterthought.

**MCP is becoming memory infrastructure.** Donated to the Agentic AI Foundation (Linux Foundation) in December 2025 and co-founded by Anthropic, Block, and OpenAI, MCP is the de facto standard for connecting agents to external tools and data. OpenMemory MCP, Graphiti MCP, memsearch MCP, and Basic Memory MCP all use it as their transport layer. Organizations report **40–60% faster agent deployment** with MCP. However, MCP was designed for tool interaction, not memory-specific operations — it lacks native support for temporal queries, contradiction resolution, or bounded retrieval. This gap will likely drive a memory-specific extension or protocol.

**Graph memory moved from experimental to production** between 2024 and early 2026. The consensus architecture is now "vectors for breadth, graphs for depth" — vector stores handle initial semantic retrieval, then graph traversal provides precise relational context. Mem0 added graph backends (Kuzu, Neo4j), Cognee ships with Kuzu by default, and Weaviate announced Engram. The hybrid approach consistently outperforms either modality alone on multi-hop reasoning tasks.

**Memory portability is nascent but demanded.** Anthropic's memory import tool (March 2026) lets users copy context from ChatGPT or Gemini. Mem0 envisions a "memory passport" — portable memory across apps and agents. Letta's Agent File (.af) format serializes stateful agents. But there is no standard format for agent memory interchange. CLAUDE.md, AGENTS.md, .cursor/rules/, and .codex files are all incompatible.

**Five critical gaps persist in the landscape.** First, no system unifies code intelligence with session memory — AST-aware temporal memory for coding agents is essentially nonexistent. Second, the ~200-line practical limit (observed in both Claude Code's CLAUDE.md and Auto Memory) constrains static memory approaches, demanding better retrieval and selective injection. Third, memory security is a serious concern — Cisco disclosed a memory poisoning vulnerability in Claude Code (April 2026), and community tools like claude-mem expose unauthenticated HTTP APIs. Fourth, team-shared agent memory with access controls and knowledge merging remains largely unsolved. Fifth, no commercial platform offers a comprehensive legal knowledge graph combining citation networks, authority hierarchies, temporal law changes, and hallucination-free RAG — this remains the most significant vertical-specific gap.

**The market is bifurcating into memory-as-a-service and memory-as-infrastructure.** Mem0, SuperMemory, and Zep Cloud offer turnkey APIs where memory is someone else's problem. Graphiti, Cognee, LightRAG, and TrustGraph offer building blocks for teams that need architectural control. Neither approach has won — enterprise teams increasingly use managed services for standard agent memory while building custom infrastructure for domain-specific expert memory. The winning strategy depends on whether memory is a commodity utility or a competitive differentiator for your use case.

---

## Conclusion

The agent memory landscape in early 2026 is rich, rapidly maturing, and increasingly segmented by architectural philosophy. **Zep/Graphiti owns temporal reasoning**, with the only production bitemporal model and the strongest benchmark results on memory-intensive tasks. **Mem0 owns the ecosystem**, with the largest developer community, broadest integration story, and most flexible deployment. **TrustGraph owns provenance and trust**, with RDF reification providing the deepest evidence modeling. **Letta owns agent autonomy**, with the only architecture where agents genuinely manage their own memory.

For most teams, the practical starting point is Mem0 (broadest compatibility, fastest to production) or Cognee (zero-infrastructure, self-improving, strong provenance). Teams building sophisticated expert memory systems should invest in Graphiti for temporal modeling and study TrustGraph's reification patterns for evidence and claims. The legal AI vertical remains the most underserved — no existing platform combines the citation verification of Westlaw/Lexis with the temporal graph modeling of Graphiti and the provenance tracking of TrustGraph. This gap represents both the hardest technical challenge and the largest commercial opportunity in the agent memory space.