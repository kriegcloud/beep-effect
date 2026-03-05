# GraphRAG & Knowledge Graphs for Semantic Codebase Search

> Deep research compiled 2026-02-19. Covers GraphRAG applied to code, Code Property Graphs,
> knowledge graph tooling, local/self-hosted solutions, and architectural recommendations
> for an Effect TypeScript monorepo.

---

## Table of Contents

1. [GraphRAG for Code](#1-graphrag-for-code)
2. [Knowledge Graphs for Code](#2-knowledge-graphs-for-code)
3. [Local/Self-Hosted Solutions](#3-localself-hosted-solutions)
4. [Specific Use Case: Effect TypeScript Monorepo](#4-specific-use-case-effect-typescript-monorepo)
5. [Tool Comparison Matrix](#5-tool-comparison-matrix)
6. [Recommended Architecture](#6-recommended-architecture)
7. [Sources](#7-sources)

---

## 1. GraphRAG for Code

### 1.1 Microsoft GraphRAG Overview

Microsoft's GraphRAG (https://github.com/microsoft/graphrag) is a modular, graph-based RAG
pipeline that extracts a knowledge graph from unstructured text, builds a community hierarchy
via Leiden clustering, generates community summaries, and leverages those structures at query
time. As of January 2026, the project is at version 2.7.0 and actively maintained.

**Core pipeline steps:**

1. **Chunking** -- split source material into text chunks
2. **Entity/Relationship Extraction** -- LLM extracts entities and relationships from each chunk
3. **Graph Construction** -- entities become nodes, relationships become edges in a property graph
4. **Community Detection** -- Leiden algorithm clusters the graph into hierarchical communities
5. **Community Summarization** -- LLM generates a summary for each community at each hierarchy level
6. **Indexing** -- embeddings generated for entities, relationships, and community summaries
7. **Query** -- local search (entity-neighborhood traversal) or global search (community summaries)

**Can it work on code?** Microsoft's GraphRAG was designed for unstructured text (documents,
articles, reports). It does NOT natively understand code syntax, ASTs, or import graphs. However,
the pipeline is modular -- you can feed it code files as "documents" and it will extract entities
and relationships using the LLM. The results are mediocre for code because:

- The LLM extracts semantic entities (e.g., "UserService", "authentication") rather than
  syntactic code entities (functions, classes, type signatures)
- It misses structural relationships that AST parsing captures deterministically
- Community detection on LLM-extracted code entities produces noisy clusters

**Verdict:** GraphRAG is not ideal for code out of the box. The graph-based RAG paradigm is
excellent for code, but you need AST-aware entity extraction instead of LLM-based extraction.

### 1.2 GraphRAG Implementations Specifically for Code

Several projects have emerged that apply the GraphRAG paradigm to codebases with proper
code-aware entity extraction:

#### code-graph-rag (vitali87)
- **URL:** https://github.com/vitali87/code-graph-rag
- **Approach:** Tree-sitter AST parsing + Memgraph knowledge graph + AI-powered Cypher generation
- **Languages:** Python, JavaScript, TypeScript, C++, Rust, Java, Lua (fully supported)
- **TypeScript features:** ES6 modules, classes, interfaces, type aliases, enums, namespaces,
  generics, advanced type inference
- **Graph DB:** Memgraph (in-memory, C++ based, openCypher compatible)
- **AI providers:** Ollama (local), OpenAI, Google Gemini -- configurable per component
- **MCP server:** Yes, integrates directly with Claude Code
- **Real-time updates:** `realtime_updater.py` watches filesystem, recalculates CALLS
  relationships on changes
- **Setup:** Python 3.12+, Docker (Memgraph), cmake, ripgrep, uv package manager
- **Querying:** Natural language queries translated to Cypher via LLM
  (e.g., "Show me all classes containing 'user' in their name")

#### CodeGraph Analyzer (ChrisRoyse)
- **URL:** https://github.com/ChrisRoyse/CodeGraph
- **Approach:** Two-pass analysis (AST build then cross-file relationship resolution) + Neo4j
- **Languages:** TypeScript/JavaScript (ts-morph), Python (native AST), Java/C#/C++/Go/SQL
  (tree-sitter), HTML/CSS (specialized parsers)
- **TypeScript parser:** ts-morph (uses the actual TypeScript Compiler API, not tree-sitter)
  -- this gives the deepest TypeScript understanding of any tool surveyed
- **Entity types:** Files, directories, classes, interfaces, functions, methods, variables,
  parameters, type aliases, React components, SQL tables
- **Relationships:** IMPORTS, EXPORTS, CALLS, EXTENDS, IMPLEMENTS, HAS_METHOD,
  RENDERS_ELEMENT, USES_COMPONENT, REFERENCES_TABLE
- **MCP integration:** Two servers -- Neo4j MCP (natural language -> Cypher) +
  Code Analyzer MCP (trigger analysis, watch changes)
- **Setup:** Neo4j Desktop v5.26.4+, Node.js LTS, APOC Core + GDS plugins recommended

#### Code Grapher (mufasadb)
- **URL:** https://github.com/mufasadb/code-grapher
- **Approach:** Hybrid retrieval combining vector similarity (ChromaDB) + graph traversal (Neo4j)
- **AI integration:** Ollama (Gemma3, Llama) for local, Gemini for cloud
- **Entity classifications:** 25+ types including data classes, Pydantic models, factory
  functions, validators, controllers, services
- **Relationship types:** INHERITS, DECORATES, CALLS
- **PRIMER.md:** Inject business domain context that AI uses to enrich descriptions
- **Incremental updates:** Surgical Update Coordinator -- updates based on git diff, not
  full reanalysis
- **MCP tools:** `create_code_graph`, `query_code_graph`, `get_related_entities`,
  `update_graph_from_diff`
- **Key insight:** "Claude receives exactly the right code without over-fetching through
  intelligent, relationship-aware context assembly"

#### CodeGraphContext
- **URL:** https://github.com/CodeGraphContext/CodeGraphContext
- **Approach:** tree-sitter parsing into FalkorDB Lite (default) or Neo4j
- **Languages:** 12 languages including TypeScript
- **DB options:** FalkorDB Lite (zero-config, in-process, Unix) or Neo4j (Docker/native)
- **Real-time:** `cgc watch` for live filesystem monitoring + incremental graph updates
- **Analysis commands:** callers, callees, dead-code detection, complexity analysis
- **MCP setup:** Automatic IDE detection wizard (`cgc mcp setup`)
- **File ignoring:** `.cgcignore` (gitignore syntax)

#### CartographAI mcp-server-codegraph
- **URL:** https://github.com/CartographAI/mcp-server-codegraph
- **Approach:** Lightweight MCP server that indexes code entities and relationships
- **Tools:** `index`, `list_file_entities`, `list_entity_relationships`
- **Languages:** Python, JavaScript, TypeScript, Rust
- **Use case:** Quick structural understanding without heavy infrastructure

### 1.3 How Code Entities Map to Graph Nodes/Edges

The consensus across all surveyed tools follows this mapping:

**Nodes (entities):**

| Entity Type | Node Label | Properties |
|---|---|---|
| File | `:File` | path, language, size, hash |
| Module/Package | `:Module` | name, path, exports |
| Class | `:Class` | name, file, line, visibility, abstract |
| Interface | `:Interface` | name, file, line, generic_params |
| Function | `:Function` | name, file, line, params, return_type, async |
| Method | `:Method` | name, class, visibility, static, abstract |
| Type Alias | `:TypeAlias` | name, file, definition |
| Variable/Constant | `:Variable` | name, file, const, exported |
| Schema (Effect-specific) | `:Schema` | name, file, fields, annotations |
| Service (Effect-specific) | `:Service` | name, file, dependencies |
| Layer (Effect-specific) | `:Layer` | name, file, provides, requires |

**Edges (relationships):**

| Relationship | From | To | Properties |
|---|---|---|---|
| IMPORTS | File/Module | File/Module | named_imports, default |
| EXPORTS | File | Symbol | named, default, re_export |
| CALLS | Function | Function | line, args_count |
| EXTENDS | Class | Class | |
| IMPLEMENTS | Class | Interface | |
| HAS_MEMBER | Class/Interface | Method/Property | |
| RETURNS_TYPE | Function | TypeAlias/Interface | |
| DEPENDS_ON | Service/Layer | Service/Layer | |
| PROVIDES | Layer | Service | |
| REQUIRES | Layer | Service | |
| USES_SCHEMA | Function/Service | Schema | |
| VARIANT_OF | Schema | Schema | tag_field, tag_value |

### 1.4 Community vs. Global Search for Code

In the GraphRAG paradigm, these search patterns map to code discovery as follows:

**Local Search (Community Search):**
- Starts from a specific entity (e.g., "AccountSchema") and traverses its neighborhood
- Returns: the entity, its direct relationships, and low-level community context
- Code use case: "What services use AccountSchema?" "What does UserService depend on?"
- Implementation: entity embedding lookup -> graph neighborhood traversal -> context assembly
- Best for: targeted questions about specific code entities and their immediate context

**Global Search:**
- Searches across high-level community summaries of the entire codebase
- Returns: thematic patterns, architectural overview, cross-cutting concerns
- Code use case: "How is error handling done across the codebase?"
  "What patterns are used for database access?"
- Implementation: community summary embedding lookup -> map-reduce over relevant communities
- Best for: architectural questions, pattern discovery, onboarding queries

**Dynamic Community Selection (Microsoft Research, 2025):**
- Improved global search that dynamically selects relevant communities instead of scanning all
- Uses cheaper LLM models for relevancy rating
- Significantly reduces token usage for global search queries

For an Effect codebase, local search excels at surfacing schema patterns, service dependencies,
and layer compositions. Global search excels at answering "how do we do X in this codebase?"
questions -- exactly the kind of query the user described.

---

## 2. Knowledge Graphs for Code

### 2.1 Code Property Graphs (CPGs)

A Code Property Graph merges three program representations into a single graph:
- **Abstract Syntax Tree (AST)** -- syntactic structure
- **Control Flow Graph (CFG)** -- execution paths
- **Program Dependence Graph (PDG)** -- data and control dependencies

This gives the richest possible code representation but is primarily designed for
security analysis and vulnerability detection.

#### Joern
- **URL:** https://github.com/joernio/joern
- **Specification:** https://cpg.joern.io/
- **Languages:** C/C++, Java, Java bytecode, Kotlin, Python, JavaScript, TypeScript,
  LLVM bitcode, x86 binaries
- **Query language:** Scala-based DSL (CPGQL)
- **TypeScript support:** Yes, via `cpg-language-typescript` frontend
- **Storage:** Custom in-memory graph database
- **Use case:** Security analysis, vulnerability detection, taint tracking
- **Relevance to our use case:** Overkill for code search/discovery. The CPG captures
  far more detail than needed (control flow, data dependencies) and the Scala query
  language is not LLM-friendly. However, the CPG specification is an excellent
  reference for designing a code ontology.

#### CodeQL (GitHub/Microsoft)
- **URL:** https://codeql.github.com/
- **Approach:** Proprietary relational database + declarative query language (QL)
- **Languages:** C/C++, C#, Go, Java, Kotlin, JavaScript, TypeScript, Python, Ruby, Swift
- **Use case:** Security scanning, SARIF report generation
- **Relevance:** Not useful for our purpose -- it is a security tool, not a search tool,
  and the query language is specialized for vulnerability patterns.

#### Fraunhofer CPG Library
- **URL:** https://github.com/Fraunhofer-AISEC/cpg
- **Approach:** Multi-language CPG via LLVM-IR
- **Use case:** Academic research, compliance analysis

### 2.2 Building a Knowledge Graph from TypeScript/Effect Code

For TypeScript with Effect, a knowledge graph needs to capture not just standard
TypeScript entities but also Effect-specific patterns:

**Standard TypeScript entities (via ts-morph or tree-sitter-typescript):**
- Classes, interfaces, type aliases, enums
- Functions (including arrow functions, function declarations)
- Imports/exports (named, default, re-exports, barrel files)
- Generics and type parameters
- Decorators

**Effect-specific entities (require custom extraction):**
- `Schema` definitions (S.Struct, S.Class, S.TaggedStruct, etc.)
- Schema annotations (identifier, title, description)
- `TaggedErrorClass` definitions
- `Service` definitions (Context.Tag / Effect.Service)
- `Layer` definitions (Layer.effect, Layer.succeed, etc.)
- `Effect.fn` function definitions with their R (requirements) types
- `Command` definitions (from `effect/unstable/cli`)
- Pipe chains and composition patterns
- `VariantSchema` patterns (discriminated unions with tag fields)
- Model patterns (combining schemas with services)

**Extraction approaches:**

1. **ts-morph (TypeScript Compiler API)** -- highest fidelity for TypeScript
   - Can resolve types, follow imports, understand generics
   - Handles Effect's complex generic signatures
   - Slower but more accurate
   - Used by: CodeGraph Analyzer

2. **tree-sitter-typescript** -- fast incremental parsing
   - Generates concrete syntax trees
   - Cannot resolve types or follow cross-file references natively
   - Needs post-processing for import resolution
   - Used by: code-graph-rag, CodeGraphContext

3. **Hybrid approach** -- tree-sitter for speed + TypeScript Compiler API for depth
   - tree-sitter for initial fast scan and entity detection
   - ts-morph for cross-file reference resolution and type analysis
   - Best balance of speed and accuracy

### 2.3 Ontology-Driven LLM Prompting for Code Discovery

The key insight from recent research (LLMs4OL 2025, ODKE+) is that providing an ontology
(a formal description of entity types and their relationships) to an LLM dramatically
improves its ability to extract structured knowledge.

For code discovery, this means:

1. **Define a code ontology** -- formal description of what entities exist and how they relate
2. **Embed the ontology in extraction prompts** -- tell the LLM "extract entities of these
   types with these relationships" rather than "extract entities"
3. **Use the ontology for query decomposition** -- when a user asks "create Account schema",
   decompose into: find Schema nodes -> find related Service nodes -> find Layer nodes ->
   find similar Schema patterns -> synthesize

**Effect-specific ontology example:**

```
Ontology: Effect TypeScript Codebase
---
EntityTypes:
  Schema: { fields, annotations, tag?, extends? }
  Service: { interface, implementation, dependencies }
  Layer: { provides, requires, scope }
  Effect: { success_type, error_type, requirements }
  TaggedError: { tag, fields, schema_identifier }
  Command: { name, flags, arguments, handler }

RelationshipTypes:
  PROVIDES: Layer -> Service
  REQUIRES: Layer -> Service
  USES_SCHEMA: Service -> Schema
  EXTENDS_SCHEMA: Schema -> Schema
  VARIANT_OF: Schema -> Schema (discriminated union members)
  ERROR_CHANNEL: Effect -> TaggedError
  DEPENDS_ON: Service -> Service (transitive via Layer)
  HANDLER_USES: Command -> Service
```

### 2.4 Neo4j and Graph DBs for Code Indexing

**Neo4j** is the most mature and widely used graph database for code knowledge graphs:

- **graph-code (davidsuarezcdo):** https://github.com/davidsuarezcdo/graph-code
  TypeScript-based, uses Neo4j, parses with TypeScript Compiler API, includes
  NestJS-specific analysis. Supports natural language queries via LLM -> Cypher translation.

- **Neo4j Blog: Codebase Knowledge Graph:**
  https://neo4j.com/blog/developer/codebase-knowledge-graph/
  Official Neo4j article on storing code as a knowledge graph. Reports 67% improvement
  in query relevance vs. pure vector similarity for code search across 500K+ functions.

- **GraphAware: Graph-Assisted TypeScript Refactoring:**
  https://graphaware.com/blog/graph-assisted-typescript-refactoring/
  Using Neo4j specifically for TypeScript dependency analysis and automated refactoring.

**Memgraph** (used by code-graph-rag):
- In-memory, C++ implementation
- 25-120x faster than Neo4j for traversal queries
- openCypher compatible (same query language)
- Better for real-time code analysis where latency matters
- Limitation: graph must fit in RAM

**FalkorDB Lite** (used by CodeGraphContext):
- Zero-configuration, embedded graph database
- Good for local development, no Docker needed on Unix
- Redis-compatible protocol

### 2.5 Projects Combining AST Parsing + Knowledge Graphs + LLM Search

The most relevant research papers:

#### Knowledge Graph Based Repository-Level Code Generation (ICSE 2025)
- **Paper:** https://arxiv.org/abs/2505.14394
- Represents code repositories as graphs capturing structural and relational information
- Hybrid retrieval: knowledge graph traversal + embedding similarity
- Tracks inter-file modular dependencies
- Demonstrated significant improvements over baseline RAG approaches

#### SemanticForge (arXiv 2025)
- **Paper:** https://arxiv.org/abs/2511.07584
- Dual static-dynamic knowledge graphs for code
- Neural graph query generation from natural language (73% precision vs. 51% for traditional)
- Beam search with SMT solving for constraint verification
- Incremental knowledge graph maintenance algorithm
- 49.8% Pass@1 on repository-level code generation (18.1% improvement over baselines)
- 52% reduction in schematic hallucination (type mismatches, signature violations)

#### HiRAG: Hierarchical Knowledge RAG (EMNLP 2025)
- **Paper:** https://arxiv.org/abs/2503.10150
- **Code:** https://github.com/hhy-huang/HiRAG
- Unsupervised hierarchical indexing of knowledge graphs
- Bridges gap between local entity knowledge and global community knowledge
- Current state-of-the-art for graph-based RAG

---

## 3. Local/Self-Hosted Solutions

### 3.1 GraphRAG with Local Models (Ollama)

**Can GraphRAG run locally?** Yes, with significant caveats.

**Setup options:**

1. **graphrag-local-ollama** (https://github.com/TheAiSingularity/graphrag-local-ollama)
   - Adapted Microsoft GraphRAG to use Ollama for both LLM and embeddings
   - LLM: llama3.1:8b or similar
   - Embeddings: nomic-embed-text
   - API endpoints: `http://localhost:11434/v1` (LLM), `http://localhost:11434/api` (embeddings)

2. **GraphRAG-Local-UI** (https://github.com/severian42/GraphRAG-Local-UI)
   - Full UI for indexing, prompt tuning, querying, chat, visualization
   - Supports multiple local model backends

3. **nano-graphrag** (https://github.com/gusye1234/nano-graphrag)
   - ~1,100 lines of Python -- lightweight, hackable GraphRAG implementation
   - Supports batch and incremental inserts
   - Three query modes: Naive, Local, Global
   - Storage backends: NetworkX (in-memory) or Neo4j
   - Easy to customize LLM, embedding, and storage components
   - Best starting point for experimentation

4. **LightRAG** (https://github.com/HKUDS/LightRAG)
   - EMNLP 2025 paper
   - Dual-level retrieval (low-level entities + high-level themes)
   - 10x token reduction vs. Microsoft GraphRAG
   - ~30% lower query latency
   - Supports local models via Ollama

### 3.2 Setup Complexity

| Solution | Setup Time | Dependencies | Difficulty |
|---|---|---|---|
| code-graph-rag | 30-60 min | Python 3.12, Docker (Memgraph), cmake, Ollama | Medium |
| CodeGraph Analyzer | 45-90 min | Node.js, Neo4j Desktop + plugins, Python 3 | Medium-High |
| Code Grapher | 30-45 min | Python, Docker (Neo4j + ChromaDB), Ollama | Medium |
| CodeGraphContext | 15-30 min | Python 3.12 (FalkorDB Lite is embedded) | Low |
| CartographAI codegraph | 5-10 min | Node.js only (no external DB) | Very Low |
| nano-graphrag | 15-30 min | Python, Ollama or API key | Low |
| LightRAG | 15-30 min | Python, Ollama or API key | Low |

### 3.3 Incremental Updates as Code Changes

This is a critical requirement. Here is how each approach handles it:

**Microsoft GraphRAG:**
- `graphrag.append` command (since v0.4.0)
- Adds new documents without full re-index
- Caches prevent reprocessing existing content
- Only new entities/relationships extracted
- Minimizes community recomputes
- Limitation: still expensive for large diffs

**code-graph-rag:**
- `realtime_updater.py` watches filesystem
- Recalculates all CALLS relationships on file changes (expensive for large repos)
- Batch size configurable to tune flush frequency

**Code Grapher (mufasadb):**
- Surgical Update Coordinator based on `git diff`
- Only processes changed files and affected relationships
- Dramatically faster than full reanalysis
- MCP tool: `update_graph_from_diff`

**CodeGraphContext:**
- `cgc watch` command for live filesystem monitoring
- Background indexing + real-time delta updates
- Job tracking with `job_id` for progress monitoring

**nano-graphrag:**
- Built-in incremental insert support
- Avoids redundant computations on existing graph portions

### 3.4 Memory/Compute Requirements

**For the graph database:**
- Memgraph: ~500MB-2GB RAM for a medium codebase (10K-50K LOC)
- Neo4j: ~1-4GB RAM (uses disk + page cache, more flexible)
- FalkorDB Lite: ~200MB-1GB RAM (embedded, lightweight)

**For local LLM inference (Ollama):**
- 7B model (llama3.1:8b): 6-8GB VRAM (GPU) or 8-16GB RAM (CPU)
- 13B model: 10-16GB VRAM
- Embeddings (nomic-embed-text): ~500MB RAM additional
- Quantized 4-bit models: ~0.6-0.8GB per billion parameters

**For indexing (one-time cost):**
- AST parsing: CPU-bound, fast (30-60 seconds for most codebases)
- Entity extraction via LLM: expensive if using GraphRAG-style LLM extraction
  (avoid this -- use AST parsing instead)
- Embedding generation: moderate (depends on number of entities)

**Minimum viable setup:**
- 16GB RAM system
- 8GB VRAM GPU (or CPU-only with 32GB RAM)
- Ollama with llama3.1:8b + nomic-embed-text
- Docker for graph DB

**Recommended setup:**
- 32GB RAM
- 12-24GB VRAM GPU (RTX 3060 12GB or better)
- Ollama with llama3.1:70b-q4 or similar
- SSD storage for graph DB persistence

---

## 4. Specific Use Case: Effect TypeScript Monorepo

### 4.1 The Problem

You have a monorepo with Effect TypeScript code. When you say "create Account schema", you want
the system to:

1. Surface existing Schema patterns (S.Struct, S.Class, S.TaggedStruct usage)
2. Find Model.ts, VariantSchema.ts, and similar architectural files
3. Understand relationships between schemas, services, layers
4. Return compacted/synthesized results, not raw code dumps

### 4.2 Why Standard RAG Fails

Standard vector-similarity RAG fails here because:

- "Account schema" has no textual similarity to `VariantSchema.ts` or `Model.ts`
- Schema patterns are structural, not textual -- they share code patterns, not words
- Service/Layer relationships are transitive and graph-structured
- You need synthesis ("here is how we do schemas") not retrieval ("here are 50 files")

### 4.3 Why Graph-Based Search Succeeds

A knowledge graph captures:

```
AccountSchema -[VARIANT_OF]-> BaseEntitySchema
AccountSchema -[USES_SCHEMA]-> TimestampFields
AccountService -[USES_SCHEMA]-> AccountSchema
AccountService -[PROVIDES]-> AccountServiceLayer
AccountServiceLayer -[REQUIRES]-> DatabaseService
AccountServiceLayer -[REQUIRES]-> LoggingService
```

When you query "create Account schema", the system can:

1. Find all `:Schema` nodes -> identify patterns (S.Struct vs S.Class vs S.TaggedStruct)
2. Find schemas with similar structure (via embedding similarity on schema definitions)
3. Traverse VARIANT_OF edges to find discriminated union patterns
4. Traverse USES_SCHEMA edges to find how schemas are consumed by services
5. Traverse PROVIDES/REQUIRES edges to find layer composition patterns
6. Synthesize: "In this codebase, schemas are defined using S.Class with annotations.
   They are grouped into Model.ts files. Services consume them via decode helpers.
   Layers provide services with DatabaseService + LoggingService requirements."

### 4.4 Recommended Architecture for Effect Monorepo

```
                    +-------------------+
                    |   User Query      |
                    | "create Account   |
                    |  schema"          |
                    +--------+----------+
                             |
                    +--------v----------+
                    |  Query Decomposer |  (LLM + Effect Ontology)
                    |  -> entity types  |
                    |  -> search mode   |
                    +--------+----------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+       +-----------v-----------+
    |   Graph Traversal |       |   Vector Similarity   |
    |   (Cypher/Neo4j)  |       |   (ChromaDB/Qdrant)   |
    |                   |       |                       |
    | Find: Schema nodes|       | Find: similar code    |
    | Follow: edges     |       | by embedding distance |
    +---------+---------+       +-----------+-----------+
              |                             |
              +-------------+---------------+
                            |
                   +--------v----------+
                   |  Result Merger    |
                   |  Rank & Dedupe    |
                   +--------+----------+
                            |
                   +--------v----------+
                   |  Context Compiler |  (LLM)
                   |  Synthesize into  |
                   |  actionable guide |
                   +-------------------+
```

**Components:**

1. **Entity Extractor (offline, incremental)**
   - ts-morph for deep TypeScript analysis (resolves types, generics, imports)
   - Custom Effect pattern matchers for Schema/Service/Layer/Error extraction
   - Runs on file save or git commit
   - Outputs: nodes + edges to graph DB, embeddings to vector store

2. **Graph Database (Neo4j or Memgraph)**
   - Stores the code knowledge graph
   - Cypher queries for structural traversal
   - Community detection for architectural clustering

3. **Vector Store (ChromaDB or Qdrant)**
   - Stores embeddings of code entity descriptions
   - Enables "find similar patterns" queries
   - all-MiniLM-L6-v2 or nomic-embed-text for local embeddings

4. **Query Decomposer (LLM)**
   - Takes natural language query + Effect ontology
   - Decomposes into: entity type filter, graph traversal pattern, similarity query
   - Example: "create Account schema" ->
     { entity_type: "Schema", traversal: "VARIANT_OF, USES_SCHEMA, PROVIDES",
       similarity: "account entity schema pattern", depth: 2 }

5. **Context Compiler (LLM)**
   - Takes retrieved graph context + code snippets
   - Synthesizes into actionable guide
   - "Here is how schemas are defined in this codebase, here are the relevant patterns,
     here is what services consume them, here is the layer structure you should follow"

### 4.5 Effect-Specific Custom Extractors Needed

No off-the-shelf tool understands Effect patterns. You would need custom extractors for:

```typescript
// Schema detection patterns
S.Struct({ ... })
S.Class<T>("Tag")({ ... })
S.TaggedStruct("Tag")({ ... })
S.extend(BaseSchema, { ... })
S.Union(SchemaA, SchemaB, ...)

// Service detection patterns
Effect.Service<T>()("ServiceName", { ... })
Context.GenericTag<T>("ServiceName")  // v3 only, doesn't exist in v4

// Layer detection patterns
Layer.effect(ServiceTag, Effect.gen(function*() { ... }))
Layer.succeed(ServiceTag, implementation)
Layer.provide(outerLayer, innerLayer)
Effect.provide([LayerA, LayerB])

// Error detection patterns
S.TaggedErrorClass<T>("Identifier")("Tag", { ... }, { ... })

// CLI detection patterns
Command.make("name", { ... })
Flag.text("name")
Argument.text("name")
```

These patterns could be detected via:
1. **ts-morph AST walking** -- visit call expressions, match against known Effect API shapes
2. **tree-sitter queries** -- write .scm query files matching Effect patterns
3. **Regex pre-scan** -- fast initial detection, then ts-morph for confirmation

---

## 5. Tool Comparison Matrix

| Feature | code-graph-rag | CodeGraph | Code Grapher | CodeGraphContext | CartographAI |
|---|---|---|---|---|---|
| **Graph DB** | Memgraph | Neo4j | Neo4j + ChromaDB | FalkorDB/Neo4j | None (in-memory) |
| **Parser** | tree-sitter | ts-morph | AST + tree-sitter | tree-sitter | Custom |
| **TS depth** | Good | Excellent | Moderate | Good | Basic |
| **MCP server** | Yes | Yes (2 servers) | Yes | Yes | Yes |
| **Local LLM** | Ollama | No (needs API) | Ollama | No (needs API) | No |
| **Incremental** | Filesystem watch | Watch + manual | Git diff surgical | Filesystem watch | Manual re-index |
| **Setup** | Medium | Medium-High | Medium | Low | Very Low |
| **Hybrid search** | Graph only | Graph only | Graph + Vector | Graph only | Graph only |
| **Custom ontology** | No | No | PRIMER.md | No | No |
| **Real-time** | Yes | Yes | Yes | Yes | No |
| **Maturity** | Active, good | Active, good | Active, moderate | Active, early | Minimal |
| **License** | MIT | MIT | MIT | Open source | MIT |

---

## 6. Recommended Architecture

### 6.1 Tier 1: Quick Win (1-2 days setup)

**Use CodeGraphContext + Claude Code MCP**

- Zero-config FalkorDB Lite (no Docker needed)
- tree-sitter TypeScript parsing out of the box
- `cgc index .` to index your monorepo
- `cgc watch .` for live updates
- MCP server for Claude Code integration
- Limitation: no Effect-specific entity understanding, basic relationships only

### 6.2 Tier 2: Production Quality (1-2 weeks)

**Use Code Grapher (mufasadb) with customization**

- Neo4j + ChromaDB for hybrid graph + vector search
- Ollama for fully local operation
- PRIMER.md for Effect domain knowledge injection
- Git-diff-based surgical updates
- Add custom Effect entity classifiers to the Python extraction pipeline
- Limitation: requires Python + Docker setup, custom classifier work

### 6.3 Tier 3: Purpose-Built (2-4 weeks)

**Build a custom solution combining the best ideas:**

1. **Parser:** ts-morph (deepest TypeScript understanding) with custom Effect pattern matchers
2. **Graph DB:** Neo4j (mature, great tooling, persistent) or Memgraph (fastest traversal)
3. **Vector Store:** Qdrant or ChromaDB with nomic-embed-text embeddings via Ollama
4. **Ontology:** Custom Effect ontology (Schema, Service, Layer, Error, Command relationships)
5. **MCP Server:** Custom MCP server exposing:
   - `find_patterns(entity_type, query)` -- find similar patterns
   - `trace_dependencies(entity, depth)` -- graph traversal
   - `synthesize_guide(query)` -- LLM-powered synthesis
   - `update_graph()` -- incremental re-index from git diff
6. **Query pipeline:** Ontology-driven query decomposition -> hybrid retrieval -> LLM synthesis

This gives you exactly the workflow described: "create Account schema" ->
surfaces existing Schema patterns, Model.ts conventions, service consumption patterns,
layer structure, and synthesizes into an actionable guide.

### 6.4 Implementation Starting Point

The fastest path to a working prototype:

1. Start with **code-graph-rag** (already has Memgraph + tree-sitter + MCP + Ollama)
2. Fork and add custom Effect entity extractors to the tree-sitter parsing pipeline
3. Add ChromaDB vector store alongside Memgraph for hybrid search
4. Define Effect ontology in the Cypher schema
5. Customize the RAG query pipeline to use ontology-driven decomposition
6. Add a synthesis step that compiles graph context into actionable guides

---

## 7. Sources

### Tools & Projects
- [Microsoft GraphRAG](https://github.com/microsoft/graphrag)
- [code-graph-rag (vitali87)](https://github.com/vitali87/code-graph-rag)
- [CodeGraph Analyzer (ChrisRoyse)](https://github.com/ChrisRoyse/CodeGraph)
- [Code Grapher (mufasadb)](https://github.com/mufasadb/code-grapher)
- [CodeGraphContext](https://github.com/CodeGraphContext/CodeGraphContext)
- [CartographAI mcp-server-codegraph](https://github.com/CartographAI/mcp-server-codegraph)
- [graphrag-local-ollama](https://github.com/TheAiSingularity/graphrag-local-ollama)
- [GraphRAG-Local-UI](https://github.com/severian42/GraphRAG-Local-UI)
- [nano-graphrag](https://github.com/gusye1234/nano-graphrag)
- [LightRAG](https://github.com/HKUDS/LightRAG)
- [HiRAG](https://github.com/hhy-huang/HiRAG)
- [Joern (Code Property Graphs)](https://github.com/joernio/joern)
- [Fraunhofer CPG Library](https://github.com/Fraunhofer-AISEC/cpg)
- [graph-code (Neo4j + TypeScript)](https://github.com/davidsuarezcdo/graph-code)
- [code-graph-rag-mcp (er77)](https://github.com/er77/code-graph-rag-mcp)
- [Neo4j MCP Server](https://github.com/neo4j-contrib/mcp-neo4j)
- [tree-sitter-typescript](https://github.com/tree-sitter/tree-sitter-typescript)

### Research Papers
- [Knowledge Graph Based Repository-Level Code Generation (ICSE 2025)](https://arxiv.org/abs/2505.14394)
- [SemanticForge: Semantic Knowledge Graphs + Constraint Satisfaction (arXiv 2025)](https://arxiv.org/abs/2511.07584)
- [HiRAG: Hierarchical Knowledge RAG (EMNLP 2025)](https://arxiv.org/abs/2503.10150)
- [From Local to Global: A Graph RAG Approach (Microsoft Research)](https://arxiv.org/abs/2404.16130)
- [Ontology Learning and Knowledge Graph Construction (arXiv 2025)](https://arxiv.org/abs/2511.05991)
- [LLM-empowered Knowledge Graph Construction Survey (arXiv 2025)](https://arxiv.org/abs/2510.20345)

### Documentation & Articles
- [GraphRAG Official Docs](https://microsoft.github.io/graphrag/)
- [GraphRAG: Improving Global Search via Dynamic Community Selection](https://www.microsoft.com/en-us/research/blog/graphrag-improving-global-search-via-dynamic-community-selection/)
- [Neo4j: Codebase Knowledge Graph](https://neo4j.com/blog/developer/codebase-knowledge-graph/)
- [Neo4j: RAG Tutorial on Knowledge Graphs](https://neo4j.com/blog/developer/rag-tutorial/)
- [GraphAware: Graph-Assisted TypeScript Refactoring](https://graphaware.com/blog/graph-assisted-typescript-refactoring/)
- [Memgraph: GraphRAG for Devs Demo](https://memgraph.com/blog/graphrag-for-devs-coding-assistant)
- [GraphRAG Local Ollama Setup Guide](https://chishengliu.com/posts/graphrag-local-ollama/)
- [Memgraph vs Neo4j Performance Comparison](https://memgraph.com/blog/memgraph-vs-neo4j-performance-benchmark-comparison)
- [Code Property Graph Specification](https://cpg.joern.io/)
- [GraphRAG Complete Guide 2026](https://www.meilisearch.com/blog/graph-rag)
- [GraphRAG Incremental Updates Discussion](https://github.com/microsoft/graphrag/discussions/511)
- [LightRAG: Simple and Fast Alternative](https://learnopencv.com/lightrag/)
