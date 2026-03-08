# Letta (MemGPT) Memory Architecture: Comprehensive Research Report

**Date**: 2026-02-18
**Purpose**: Deep research on Letta's memory architecture for AI agents, covering the MemGPT
paper foundations, Letta's production implementation, memory operations, ontological modeling,
session management, and comparison with competing frameworks.

---

## Table of Contents

1. [MemGPT Paper: Foundational Contributions](#1-memgpt-paper-foundational-contributions)
2. [Letta's Memory Architecture](#2-lettas-memory-architecture)
3. [Memory Management Operations](#3-memory-management-operations)
4. [Context Engineering and Compilation](#4-context-engineering-and-compilation)
5. [Session and Conversation Management](#5-session-and-conversation-management)
6. [Agent State Management](#6-agent-state-management)
7. [Sleep-Time Compute and Asynchronous Memory](#7-sleep-time-compute-and-asynchronous-memory)
8. [Multi-Agent Shared Memory](#8-multi-agent-shared-memory)
9. [Comparison with Other Memory Frameworks](#9-comparison-with-other-memory-frameworks)
10. [Memory as an Ontological Model](#10-memory-as-an-ontological-model)
11. [Key Takeaways for Ontology Design](#11-key-takeaways-for-ontology-design)
12. [Sources](#12-sources)

---

## 1. MemGPT Paper: Foundational Contributions

**Paper**: *MemGPT: Towards LLMs as Operating Systems*
**Authors**: Charles Packer, Vivian Fang, et al.
**Published**: October 2023 (arXiv:2310.08560)
**Research site**: https://research.memgpt.ai/

### 1.1 Core Thesis

MemGPT proposes **virtual context management** -- a technique drawing direct analogy from
hierarchical memory systems in traditional operating systems. Just as an OS provides the
illusion of unlimited RAM through virtual memory (moving pages between RAM and disk), MemGPT
provides the illusion of unlimited context by moving data between the LLM's fixed context
window and external storage.

### 1.2 Key Insight: LLM as Its Own Memory Manager

The central innovation is that **memory management is self-directed**. The LLM itself decides
what to store, retrieve, and evict. There is no external controller -- the "OS" that manages
memory *is* the LLM. The model uses designated function calls to move data between in-context
memory and external storage.

### 1.3 Architecture Components

The MemGPT architecture consists of:

```
+--------------------------------------------------+
|              MAIN CONTEXT (Prompt Tokens)         |
|                                                   |
|  +--------------------------------------------+  |
|  | System Instructions (read-only, static)     |  |
|  | - Control flow rules                        |  |
|  | - Memory level usage instructions           |  |
|  | - Function calling instructions             |  |
|  +--------------------------------------------+  |
|  | Working Context (read-write, fixed-size)    |  |
|  | - Key facts about user                      |  |
|  | - Agent persona information                 |  |
|  | - Important state (writable via functions)   |  |
|  +--------------------------------------------+  |
|  | FIFO Queue (rolling message history)        |  |
|  | - User messages                             |  |
|  | - Agent messages                            |  |
|  | - System messages                           |  |
|  | - Function call inputs/outputs              |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
          |                    |
          v                    v
+------------------+  +------------------+
| Archival Storage |  |  Recall Storage  |
| (Vector DB)      |  | (Conversation DB)|
| - Long-term      |  | - Full message   |
|   knowledge      |  |   history        |
| - Indexed data   |  | - Searchable by  |
+------------------+  |   date and text  |
                      +------------------+
```

**System Instructions**: Read-only, static. Contains MemGPT control flow, memory level usage
instructions, and function calling specifications.

**Working Context**: Fixed-size, read-write block of unstructured text. Writeable only via
MemGPT function calls. Stores key facts, preferences, and persona information.

**FIFO Queue**: Rolling history of messages. When the queue overflows, older messages are
evicted.

**Function Executor**: Interprets LLM completion tokens as function calls that move data
between main context and external storage.

### 1.4 Memory Pressure and Eviction

When prompt tokens exceed a warning threshold (e.g., 70% of context window), the queue
manager inserts a **memory pressure warning** -- a system message telling the LLM that queue
eviction is imminent. This allows the LLM to proactively store important information to
working context or archival storage before data is lost.

When eviction occurs:
1. The first index of the FIFO queue (containing a recursive summary) and all other data are
   combined into a new summary
2. This summary is placed into the first index of a new queue
3. Evicted raw messages remain accessible via recall memory search

### 1.5 Evaluation Results

MemGPT was evaluated in two domains:

| Domain | Task | Key Result |
|--------|------|------------|
| Document Analysis | Nested key-value retrieval | Only approach to consistently complete beyond 2 nesting levels |
| Multi-Session Chat | Long-term conversational memory | Significantly outperformed fixed-context baselines |

Evaluation metrics included ROUGE-L scores and LLM-judge consistency ratings.

---

## 2. Letta's Memory Architecture

Letta is the production platform that evolved from the MemGPT research project. It implements
and extends the MemGPT architecture with production-grade features.

### 2.1 Memory Type Hierarchy

Letta defines four distinct memory types organized by proximity to the LLM's attention:

| Memory Type | Analogy | Location | Access Pattern | Persistence |
|-------------|---------|----------|---------------|-------------|
| **Core Memory** (Blocks) | CPU Registers / L1 Cache | In-context (system prompt) | Always visible | Database-backed |
| **Message Buffer** | RAM | In-context (FIFO queue) | Recent messages visible | Auto-persisted |
| **Recall Memory** | Disk (indexed) | Out-of-context | Search by date/text | Full history in DB |
| **Archival Memory** | Disk (large storage) | Out-of-context | Semantic search (vector) | Vector DB |

### 2.2 Core Memory (Memory Blocks)

Core memory is the most critical layer -- it is **always present** in the LLM's context
window, injected into the system prompt at every inference step.

**Structure**: Core memory consists of named **blocks** -- labeled text containers with:
- A `label` (e.g., "persona", "human", "project_status")
- A `value` (free-form text content)
- A `description` (tells the agent what the block is for)
- A `limit` (maximum character count, default 2,000 characters)
- A unique `id` (for API access and sharing)

**Default blocks** for a standard Letta agent:

| Block Label | Purpose | Content Example |
|-------------|---------|-----------------|
| `persona` | Agent's identity, personality, behavior | "I am a helpful assistant specializing in..." |
| `human` | Information about the user | "Name: Sarah. Prefers concise answers. Works in marketing." |

**Custom blocks** can be created for any purpose:
- `project_status` -- current project state
- `preferences` -- user preferences
- `policies` -- organizational rules
- `history` -- running event log

**Key properties**:
- Blocks are **read-write** if the agent has memory editing tools
- Blocks have **character limits** to prevent excessive token usage
- Blocks are **compiled into the system prompt** at every agent step
- Blocks can be **shared across multiple agents** (shared memory)

### 2.3 Message Buffer

The message buffer is a FIFO queue of recent conversation turns:

- Contains user messages, assistant messages, system messages, tool calls, and tool returns
- The **first index** always contains a recursive summary of previously evicted messages
- When the buffer is full, the oldest messages are evicted:
  1. Evicted messages are combined with the existing summary
  2. A new summary replaces the first index
  3. Raw evicted messages remain searchable via recall memory

### 2.4 Recall Memory

Recall memory preserves the **complete history** of all interactions:

- Every message ever sent or received is logged
- Searchable by **date** and **text content**
- Automatically persisted to disk (unlike many frameworks that require manual persistence)
- Messages from **all conversations** (if using the conversations feature) are pooled together
- The agent can search across conversations using `conversation_search`

### 2.5 Archival Memory

Archival memory is a **semantically searchable** vector database:

- Stores processed, indexed information (not raw conversation)
- Each entry ("passage") is embedded using the agent's embedding model
- Backed by vector databases (Chroma, pgvector, etc.)
- Can store millions of entries without affecting token usage
- Agents use `archival_memory_search` to find relevant passages
- **Data sources** can be attached to populate archival memory from external documents

---

## 3. Memory Management Operations

### 3.1 Core Memory Tools

Letta provides different sets of memory tools depending on the agent type:

#### Legacy MemGPT Tools (`memgpt_v2_agent`)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `memory_insert` | `block_label`, `content`, `line_number` | Insert text at a specific line in a memory block |
| `memory_replace` | `block_label`, `old_str`, `new_str` | Replace exact text in a memory block (old_str must match exactly) |

#### Unified Memory Tool (`letta_v1_agent`)

The newer architecture provides a unified `memory` tool with a path-based interface:

| Operation | Path | Description |
|-----------|------|-------------|
| Read | `/memories/<label>` | Read contents of a block |
| Write/Update | `/memories/<label>` | Update content of a block |
| Create | `/memories/<label>` | Create a new block |
| Detach | `/memories/<label>` | Detach a block from the agent |
| Rename | `/memories/<label>` | Rename a block |

### 3.2 Archival Memory Tools

| Tool | Parameters | Description |
|------|-----------|-------------|
| `archival_memory_insert` | `content` | Store important information in the vector database |
| `archival_memory_search` | `query`, `page` | Retrieve relevant memories via embedding-based semantic search |

### 3.3 Recall Memory Tools

| Tool | Parameters | Description |
|------|-----------|-------------|
| `conversation_search` | `query`, `page` | Search conversation history by text content |
| `conversation_search_date` | `start_date`, `end_date`, `page` | Search conversation history by date range |

### 3.4 Memory Update Lifecycle

When an agent calls a memory tool, the following sequence occurs:

```
1. Agent generates tool call (e.g., memory_replace)
2. Function executor validates and runs the tool
3. Block is updated in the database
4. On next loop iteration:
   a. Memory.compile() concatenates all blocks with labels
   b. Compiled text replaces IN_CONTEXT_MEMORY_PLACEHOLDER in system prompt
   c. Agent sees updated memory in its next context window
```

### 3.5 External Memory Management via API

Memory can also be managed externally through Letta's REST API:

```python
# Python SDK examples
from letta_client import Letta

client = Letta(base_url="http://localhost:8283")

# Create a block
block = client.blocks.create(label="project", value="Current project: Ontology design")

# Attach block to agent
client.agents.blocks.attach(agent_id=agent.id, block_id=block.id)

# Update block externally
client.blocks.modify(block_id=block.id, value="Project complete. Moving to testing.")

# Search archival memory
results = client.agents.archival.list(agent_id=agent.id, query="ontology patterns")

# Load a data source into archival memory
client.agents.sources.attach(agent_id=agent.id, source_id=source.id)
```

---

## 4. Context Engineering and Compilation

### 4.1 Context Window Structure

Letta gives developers full control over context window composition:

```
+----------------------------------------------------------+
|  SYSTEM PROMPT                                           |
|  +----------------------------------------------------+  |
|  | Static Instructions (agent behavior, control flow)  |  |
|  +----------------------------------------------------+  |
|  | Compiled Memory Blocks                              |  |
|  | [persona]: "I am a helpful assistant..."            |  |
|  | [human]: "User name: Sarah..."                      |  |
|  | [custom_block]: "..."                               |  |
|  +----------------------------------------------------+  |
|  | Tool Descriptions                                   |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
|  MESSAGE BUFFER (FIFO Queue)                             |
|  +----------------------------------------------------+  |
|  | [0] Summary of evicted messages                     |  |
|  | [1] system: "Memory pressure warning..."            |  |
|  | [2] user: "What did we discuss last week?"          |  |
|  | [3] assistant: <tool_call: conversation_search>     |  |
|  | [4] tool: <search results>                          |  |
|  | [5] assistant: "Last week we discussed..."          |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

### 4.2 Compilation Process

At each agent step:

1. `Memory.compile()` concatenates all attached blocks with their labels
2. The compiled text replaces `IN_CONTEXT_MEMORY_PLACEHOLDER` in the system prompt template
3. The message buffer is assembled with the summary at index 0
4. Tool descriptions are injected
5. The complete context is sent to the LLM

### 4.3 Context Overflow Management

When the context exceeds the model's limit:
- Oldest messages in the FIFO queue are evicted
- A recursive summary is generated and stored at index 0
- Evicted messages remain searchable in recall memory
- Memory pressure warnings alert the agent before eviction

---

## 5. Session and Conversation Management

### 5.1 No Traditional Sessions

A key distinction of Letta: **there are no traditional sessions or threads**. Instead, each
agent has a **single perpetual thread** -- a continuous sequence of messages that persists
indefinitely. All interactions are part of the agent's persistent memory.

This is philosophically different from frameworks that treat conversations as ephemeral:

| Framework | Model | Persistence |
|-----------|-------|------------|
| OpenAI Assistants | Thread-based sessions | Threads can be deleted |
| LangChain | Session-based memory | Requires manual persistence |
| **Letta** | **Perpetual agent state** | **All state auto-persisted** |

### 5.2 Conversations Feature (Multi-Session)

For scenarios requiring parallel sessions, Letta provides **conversations** (experimental):

- A conversation is a **message thread within an agent**
- A single agent can have **multiple conversations running in parallel**
- Each conversation has its own:
  - Context window (independent message buffers)
  - Message stream (can be written to independently)
  - Compaction history (long conversations compacted independently)
- All conversations **share**:
  - The same memory blocks (core memory)
  - The same archival memory
  - Searchable message history (agent can search across all conversations)

**Use cases**:
- Multiple users interacting with the same agent simultaneously
- Parallel task threads (e.g., one conversation for code refactoring, another for testing)
- Concurrent API calls from different processes

```python
# Create a conversation
conv = client.agents.conversations.create(agent_id=agent.id)

# Send message to specific conversation
response = client.agents.messages.create(
    agent_id=agent.id,
    messages=[{"role": "user", "content": "Hello"}],
    conversation_id=conv.id
)
```

### 5.3 Multi-User Pattern

For multi-user applications, Letta recommends **one agent per user**:
- Each agent maintains personalized memory about its specific user
- Agent identity and user knowledge are both persistent
- Agents can share memory blocks for common knowledge

---

## 6. Agent State Management

### 6.1 Agent State Components

A Letta agent's complete state comprises:

| Component | Mutable? | Storage |
|-----------|----------|---------|
| System Prompt | Read-only at runtime | Database |
| Memory Blocks | Read-write (via tools) | Database |
| Message History | Append-only | Database |
| Tool Configuration | Configurable | Database |
| LLM Configuration | Configurable | Database |
| Embedding Configuration | Configurable | Database |
| Archival Memory | Read-write (via tools) | Vector DB |

### 6.2 Identity: System Prompt vs. Persona Block

Letta separates **stable behavior** from **evolving identity**:

- **System Prompt**: Read-only at runtime. Defines the agent's architecture, control flow,
  and high-level behavioral instructions. This is the fixed "personality DNA."

- **Persona Block**: Read-write. The agent can modify this during operation, allowing its
  self-description to evolve over time. This is the dynamic "learned personality."

This creates a dual-layer identity:
```
System Prompt (immutable during runtime):
  "You are a helpful research assistant. Always cite sources.
   Use formal language. Follow the MemGPT control flow."

Persona Block (self-editable):
  "I have been working with Sarah for 3 months. She prefers
   bullet-point summaries. I've developed expertise in ontology
   engineering topics based on our conversations."
```

### 6.3 State Persistence and Checkpointing

- At **each agent step** (iteration of the agentic loop), the entire state is checkpointed
  and persisted to the database
- State can be retrieved via API: `GET /v1/agents/:agent_id`
- All state -- memories, messages, reasoning, tool calls -- is persisted and never lost
- Even data evicted from the context window remains in recall/archival memory

### 6.4 Agent File Format (.af)

Letta has introduced an open **Agent File** format for serializing stateful agents:

- Packages all components: system prompts, memory blocks, tool configurations, LLM settings
- Enables sharing, checkpointing, and version control of agents
- Allows agent portability across compatible frameworks

---

## 7. Sleep-Time Compute and Asynchronous Memory

### 7.1 Concept

Sleep-time compute is Letta's evolution beyond the original MemGPT approach, addressing a
key limitation: in MemGPT, memory management happens **synchronously** during conversation,
potentially slowing response times and producing messy, incrementally-built memories.

### 7.2 Dual-Agent Architecture

When creating a sleep-time agent, Letta creates **two agents**:

| Agent | Role | Capabilities |
|-------|------|-------------|
| **Primary Agent** | Conversation | Send messages, call custom tools, search external memory |
| **Sleep-Time Agent** | Memory Management | Runs in background, modifies memory blocks asynchronously |

### 7.3 How It Works

1. Primary agent handles conversation normally
2. Every N steps (default: 5), the sleep-time agent is triggered
3. Sleep-time agent reviews recent conversation history
4. Sleep-time agent generates clean, organized memory updates
5. Updated memory blocks are available to primary agent on next step

### 7.4 Benefits Over Synchronous MemGPT

| Aspect | MemGPT (Synchronous) | Sleep-Time (Asynchronous) |
|--------|---------------------|--------------------------|
| Response latency | Slower (memory ops during conversation) | Faster (memory ops decoupled) |
| Memory quality | Incremental, can become messy | Clean, comprehensive rewrites |
| Memory organization | Appended facts over time | Continuously reorganized |
| Agent focus | Split between conversation and memory | Dedicated to conversation |

---

## 8. Multi-Agent Shared Memory

### 8.1 Shared Blocks

Memory blocks can be shared across agents by attaching the same block ID:

```python
# Create a shared block
shared_block = client.blocks.create(
    label="team_knowledge",
    value="Project deadline: March 15. Tech stack: Python, PostgreSQL."
)

# Attach to multiple agents
client.agents.blocks.attach(agent_id=agent_a.id, block_id=shared_block.id)
client.agents.blocks.attach(agent_id=agent_b.id, block_id=shared_block.id)
```

- When one agent writes to the shared block, all other agents see the update
- `memory_insert` is the most robust operation for concurrent multi-agent writes (additive,
  no conflicts)
- `memory_replace` can cause conflicts if multiple agents try to replace the same text

### 8.2 Shared Archival Memory

Agents can share archival memory by attaching the same data source:

- Multiple agents can search the same vector database
- Each agent can also have private archival entries

---

## 9. Comparison with Other Memory Frameworks

### 9.1 Framework Overview

| Framework | Memory Model | Storage Backend | Key Differentiator |
|-----------|-------------|----------------|-------------------|
| **Letta** | Tiered (core/recall/archival) | PostgreSQL + Vector DB | Self-managing memory via tool calls |
| **Mem0** | Hybrid (vector + graph) | Vector DB + Neo4j | Automatic fact extraction, graph relationships |
| **Zep** | Temporal knowledge graph | Neo4j (Graphiti engine) | Bi-temporal modeling, sub-100ms retrieval |
| **LangMem** | Semantic/Episodic/Procedural | Pluggable (via LangGraph) | Cognitive science memory types |
| **CrewAI** | Short/Long/Entity/Contextual | ChromaDB + SQLite | Task-oriented crew memory |

### 9.2 Letta vs. Mem0

| Dimension | Letta | Mem0 |
|-----------|-------|------|
| **Memory paradigm** | Agent self-manages via tool calls | External memory layer extracts facts automatically |
| **Core abstraction** | Memory blocks (labeled text in context) | Memory objects (extracted facts with metadata) |
| **Graph support** | No native graph memory | Native graph memory via Neo4j |
| **Agent coupling** | Memory is integral to agent architecture | Memory layer is decoupled, pluggable into any framework |
| **Context management** | Full context window engineering | Memory retrieval for context augmentation |
| **Multi-tenancy** | One agent per user (recommended) | Built-in user/session/agent hierarchy |
| **Benchmarks** | MemGPT paper baselines | 26% improvement over OpenAI memory (LOCOMO) |

**Mem0 Architecture**:
- Five pillars: LLM-powered fact extraction, vector storage, graph storage, hybrid retrieval,
  production infrastructure
- Automatically extracts atomic facts from conversations
- Stores in both vector DB (semantic similarity) and knowledge graph (entity relationships)
- Supports 25+ vector DB providers
- Hierarchical memory: user-level, session-level, agent-level

### 9.3 Letta vs. Zep

| Dimension | Letta | Zep |
|-----------|-------|-----|
| **Memory paradigm** | Tiered storage with self-management | Temporal knowledge graph |
| **Core engine** | MemGPT-style virtual context | Graphiti (temporal KG engine) |
| **Temporal modeling** | Message timestamps in recall memory | Bi-temporal model (event time + ingestion time) |
| **Memory structure** | Flat blocks + vector passages | Three-tier subgraphs (episode, entity, community) |
| **Extraction** | Agent-directed (agent decides what to store) | Automatic (NER, relationship extraction, temporal parsing) |
| **Benchmark performance** | MemGPT baselines | DMR: 94.8%, LongMemEval: +18.5% accuracy, 90% latency reduction |

**Zep Architecture**:
- **Episode subgraph**: Raw events/messages with timestamps
- **Semantic entity subgraph**: Extracted entities with 1024D embeddings
- **Community subgraph**: Clustered entity groups with shared context
- Bi-temporal model: Timeline T (event ordering) and T' (data ingestion ordering)
- Named entity recognition with contextual window (current + last 4 messages)

### 9.4 Letta vs. LangMem (LangChain)

| Dimension | Letta | LangMem |
|-----------|-------|---------|
| **Memory paradigm** | OS-inspired virtual context | Cognitive science memory types |
| **Memory types** | Core/Recall/Archival | Semantic/Episodic/Procedural |
| **Semantic memory** | Core memory blocks (facts about user) | Facts and knowledge triplets |
| **Episodic memory** | Recall memory (conversation history) | Past interaction experiences |
| **Procedural memory** | System prompt (static) + persona (dynamic) | Learned procedures as prompt updates |
| **State management** | Full agent state persistence | Relies on LangGraph for persistence |
| **Framework coupling** | Standalone platform | Designed for LangChain/LangGraph ecosystem |

**LangMem Memory Types**:
- **Semantic**: Facts about users, domains, knowledge triplets
- **Episodic**: Specific past experiences, "how" problems were solved
- **Procedural**: Generalized skills, rules, behaviors -- saved as prompt updates

### 9.5 Letta vs. CrewAI Memory

| Dimension | Letta | CrewAI |
|-----------|-------|--------|
| **Memory paradigm** | Agent-centric self-management | Task-centric crew coordination |
| **Short-term** | Message buffer (FIFO queue) | ChromaDB with RAG for current context |
| **Long-term** | Archival memory (vector DB) | SQLite3 for task results across sessions |
| **Entity memory** | Core memory blocks (manual) | RAG-based entity tracking (automatic) |
| **Contextual** | Context compilation from all sources | Integration of short-term + long-term |
| **Scope** | Individual agent memory | Crew-wide memory across multiple agents |
| **Self-management** | Agent edits own memory via tools | Framework manages memory automatically |

### 9.6 Comparative Summary Table

| Feature | Letta | Mem0 | Zep | LangMem | CrewAI |
|---------|-------|------|-----|---------|--------|
| Self-editing memory | Yes | No | No | Partial | No |
| Graph memory | No | Yes | Yes | No | No |
| Temporal awareness | Basic | Basic | Advanced | Basic | No |
| Context engineering | Full | Augmentation | Augmentation | Augmentation | Automatic |
| Auto fact extraction | No (agent-directed) | Yes | Yes | Yes | Yes |
| Multi-agent sharing | Shared blocks | User/session hierarchy | N/A | Via LangGraph | Crew-wide |
| Async memory | Sleep-time agents | No | No | Background processing | No |
| Agent persistence | Full state | Memory objects only | Graph state | Depends on LangGraph | Session-based |
| Open source | Yes | Yes (core) | Partial | Yes | Yes |

---

## 10. Memory as an Ontological Model

### 10.1 Existing Ontological Foundations

Several existing ontologies provide relevant foundations:

**BDI Ontology** (Belief-Desire-Intention): A formal OWL ontology capturing cognitive
architecture through beliefs, desires, intentions, and their dynamic interrelations.
Provides vocabulary for mental states, goals, plans, and justifications.

**OpenRobots Ontology (ORO)**: OWL ontology for cognitive robotics that includes memory
management, categorization, and reasoning on parallel cognitive models.

**Agentic Ontology of Work** (Skan.ai): Defines canonical entities -- Objectives, Intents,
Agents, Skills, Policies, Outcomes, Assurance Levels, Memory, Guardians -- and their
semantic relationships.

### 10.2 Proposed OWL Formalization of Letta Memory

Below is a conceptual OWL model capturing Letta's memory architecture:

#### Class Hierarchy

```turtle
@prefix : <http://example.org/letta-memory#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix bfo: <http://purl.obolibrary.org/obo/BFO_> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

# === Top-Level Classes ===

:MemorySystem a owl:Class ;
    rdfs:label "Memory System" ;
    skos:definition "A system that manages the storage, retrieval, and organization of
        information for an AI agent across multiple memory tiers." .

:MemoryTier a owl:Class ;
    rdfs:label "Memory Tier" ;
    skos:definition "A level in the hierarchical memory architecture, distinguished by
        access pattern, latency, and proximity to the agent's active context." .

:InContextMemory a owl:Class ;
    rdfs:subClassOf :MemoryTier ;
    rdfs:label "In-Context Memory" ;
    skos:definition "A memory tier whose contents are always present in the LLM's
        context window during inference." .

:OutOfContextMemory a owl:Class ;
    rdfs:subClassOf :MemoryTier ;
    rdfs:label "Out-of-Context Memory" ;
    skos:definition "A memory tier whose contents are stored externally and must be
        explicitly retrieved into the context window." .

# === In-Context Memory Subtypes ===

:CoreMemory a owl:Class ;
    rdfs:subClassOf :InContextMemory ;
    rdfs:label "Core Memory" ;
    skos:definition "An in-context memory tier composed of labeled, editable text blocks
        that are compiled into the system prompt at every agent step." .

:MessageBuffer a owl:Class ;
    rdfs:subClassOf :InContextMemory ;
    rdfs:label "Message Buffer" ;
    skos:definition "An in-context memory tier implemented as a FIFO queue of recent
        conversation messages, with a recursive summary at index zero." .

# === Out-of-Context Memory Subtypes ===

:RecallMemory a owl:Class ;
    rdfs:subClassOf :OutOfContextMemory ;
    rdfs:label "Recall Memory" ;
    skos:definition "An out-of-context memory tier that preserves the complete history
        of all agent interactions, searchable by text and date." .

:ArchivalMemory a owl:Class ;
    rdfs:subClassOf :OutOfContextMemory ;
    rdfs:label "Archival Memory" ;
    skos:definition "An out-of-context memory tier backed by a vector database for
        semantically searchable long-term knowledge storage." .

# === Memory Content Classes ===

:MemoryBlock a owl:Class ;
    rdfs:label "Memory Block" ;
    skos:definition "A labeled, bounded text container within core memory that the
        agent can read and modify via tool calls." .

:PersonaBlock a owl:Class ;
    rdfs:subClassOf :MemoryBlock ;
    rdfs:label "Persona Block" ;
    skos:definition "A memory block storing the agent's self-description, personality
        traits, and behavioral guidelines." .

:HumanBlock a owl:Class ;
    rdfs:subClassOf :MemoryBlock ;
    rdfs:label "Human Block" ;
    skos:definition "A memory block storing information about the user the agent is
        conversing with." .

:CustomBlock a owl:Class ;
    rdfs:subClassOf :MemoryBlock ;
    rdfs:label "Custom Block" ;
    skos:definition "A user-defined memory block for domain-specific persistent state." .

:Message a owl:Class ;
    rdfs:label "Message" ;
    skos:definition "A single turn in the conversation history, including content,
        role, timestamp, and optional tool call information." .

:Passage a owl:Class ;
    rdfs:label "Passage" ;
    skos:definition "A chunk of information stored in archival memory with an
        associated embedding vector for semantic retrieval." .

:ConversationSummary a owl:Class ;
    rdfs:label "Conversation Summary" ;
    skos:definition "A recursive summary of evicted messages, always stored at index
        zero of the message buffer." .

# === Agent Classes ===

:Agent a owl:Class ;
    rdfs:label "Agent" ;
    skos:definition "A stateful AI entity with persistent memory, tools, and a
        continuous identity across interactions." .

:Conversation a owl:Class ;
    rdfs:label "Conversation" ;
    skos:definition "A message thread within an agent, with its own context window
        but sharing the agent's memory blocks and searchable history." .

:SleepTimeAgent a owl:Class ;
    rdfs:subClassOf :Agent ;
    rdfs:label "Sleep-Time Agent" ;
    skos:definition "A background agent that asynchronously processes conversation
        history to generate clean, organized memory updates." .

# === Tool Classes ===

:MemoryTool a owl:Class ;
    rdfs:label "Memory Tool" ;
    skos:definition "A function that an agent can call to read, write, or search
        its memory tiers." .

:CoreMemoryTool a owl:Class ;
    rdfs:subClassOf :MemoryTool ;
    rdfs:label "Core Memory Tool" ;
    skos:definition "A tool for reading or modifying core memory blocks." .

:ArchivalMemoryTool a owl:Class ;
    rdfs:subClassOf :MemoryTool ;
    rdfs:label "Archival Memory Tool" ;
    skos:definition "A tool for inserting into or searching archival memory." .

:RecallMemoryTool a owl:Class ;
    rdfs:subClassOf :MemoryTool ;
    rdfs:label "Recall Memory Tool" ;
    skos:definition "A tool for searching recall memory by text or date." .

# === Data Source ===

:DataSource a owl:Class ;
    rdfs:label "Data Source" ;
    skos:definition "An external document or dataset that is processed, embedded,
        and loaded into an agent's archival memory." .
```

#### Object Properties

```turtle
# === Structural Relations ===

:hasMemoryTier a owl:ObjectProperty ;
    rdfs:domain :MemorySystem ;
    rdfs:range :MemoryTier ;
    rdfs:label "has memory tier" .

:hasMemoryBlock a owl:ObjectProperty ;
    rdfs:domain :CoreMemory ;
    rdfs:range :MemoryBlock ;
    rdfs:label "has memory block" .

:hasMessage a owl:ObjectProperty ;
    rdfs:domain :MessageBuffer ;
    rdfs:range :Message ;
    rdfs:label "has message" .

:hasPassage a owl:ObjectProperty ;
    rdfs:domain :ArchivalMemory ;
    rdfs:range :Passage ;
    rdfs:label "has passage" .

:hasSummary a owl:ObjectProperty ;
    rdfs:domain :MessageBuffer ;
    rdfs:range :ConversationSummary ;
    rdfs:label "has summary" .

# === Agent Relations ===

:hasMemorySystem a owl:ObjectProperty ;
    rdfs:domain :Agent ;
    rdfs:range :MemorySystem ;
    rdfs:label "has memory system" .

:hasConversation a owl:ObjectProperty ;
    rdfs:domain :Agent ;
    rdfs:range :Conversation ;
    rdfs:label "has conversation" .

:hasTool a owl:ObjectProperty ;
    rdfs:domain :Agent ;
    rdfs:range :MemoryTool ;
    rdfs:label "has tool" .

:hasSleepTimeAgent a owl:ObjectProperty ;
    rdfs:domain :Agent ;
    rdfs:range :SleepTimeAgent ;
    rdfs:label "has sleep-time agent" .

# === Memory Operations ===

:readsFrom a owl:ObjectProperty ;
    rdfs:domain :MemoryTool ;
    rdfs:range :MemoryTier ;
    rdfs:label "reads from" .

:writesTo a owl:ObjectProperty ;
    rdfs:domain :MemoryTool ;
    rdfs:range :MemoryTier ;
    rdfs:label "writes to" .

:evictsTo a owl:ObjectProperty ;
    rdfs:domain :MessageBuffer ;
    rdfs:range :RecallMemory ;
    rdfs:label "evicts to" ;
    skos:definition "When the message buffer is full, older messages are evicted
        to recall memory." .

:sharedWith a owl:ObjectProperty, owl:SymmetricProperty ;
    rdfs:domain :MemoryBlock ;
    rdfs:range :Agent ;
    rdfs:label "shared with" ;
    skos:definition "A memory block that is attached to multiple agents,
        providing shared read-write access." .

:populatedFrom a owl:ObjectProperty ;
    rdfs:domain :ArchivalMemory ;
    rdfs:range :DataSource ;
    rdfs:label "populated from" .
```

#### Datatype Properties

```turtle
:hasLabel a owl:DatatypeProperty ;
    rdfs:domain :MemoryBlock ;
    rdfs:range xsd:string ;
    rdfs:label "has label" .

:hasValue a owl:DatatypeProperty ;
    rdfs:domain :MemoryBlock ;
    rdfs:range xsd:string ;
    rdfs:label "has value" .

:hasDescription a owl:DatatypeProperty ;
    rdfs:domain :MemoryBlock ;
    rdfs:range xsd:string ;
    rdfs:label "has description" .

:hasCharacterLimit a owl:DatatypeProperty ;
    rdfs:domain :MemoryBlock ;
    rdfs:range xsd:integer ;
    rdfs:label "has character limit" .

:hasTimestamp a owl:DatatypeProperty ;
    rdfs:domain :Message ;
    rdfs:range xsd:dateTime ;
    rdfs:label "has timestamp" .

:hasRole a owl:DatatypeProperty ;
    rdfs:domain :Message ;
    rdfs:range xsd:string ;
    rdfs:label "has role" ;
    skos:definition "The role of the message sender: user, assistant, system, or tool." .

:hasEmbedding a owl:DatatypeProperty ;
    rdfs:domain :Passage ;
    rdfs:range xsd:string ;
    rdfs:label "has embedding" ;
    skos:definition "The vector embedding of the passage content for semantic search." .

:hasEvictionPolicy a owl:DatatypeProperty ;
    rdfs:domain :MessageBuffer ;
    rdfs:range xsd:string ;
    rdfs:label "has eviction policy" ;
    skos:definition "The policy for evicting messages (default: FIFO with recursive summary)." .
```

### 10.3 BFO Alignment Considerations

If aligning to Basic Formal Ontology (BFO):

| Letta Concept | BFO Category | Rationale |
|---------------|-------------|-----------|
| MemorySystem | BFO:Object | A material entity that persists through time |
| MemoryTier | BFO:FiatObjectPart | A demarcated part of the memory system |
| MemoryBlock | BFO:InformationContentEntity (IAO) | Bears information about the agent/user |
| Message | BFO:InformationContentEntity (IAO) | A discrete unit of communicated content |
| Passage | BFO:InformationContentEntity (IAO) | An indexed unit of stored knowledge |
| Agent | BFO:Object | An entity with persistent identity |
| MemoryTool | BFO:Function | A function realized by the agent's execution |
| memory_insert (event) | BFO:Process | A temporal process of modifying memory |
| eviction (event) | BFO:Process | A temporal process of moving data between tiers |

### 10.4 Competency Questions for an Agent Memory Ontology

These CQs would drive formal axiomatization:

1. What memory tiers does an agent's memory system consist of?
2. Which memory blocks are currently attached to a given agent?
3. What is the current value of a specific memory block?
4. Which agents share a given memory block?
5. What messages have been evicted from the message buffer?
6. What archival passages match a given semantic query?
7. When was a memory block last modified, and by which agent?
8. What data sources populate an agent's archival memory?
9. What is the eviction policy for a given message buffer?
10. Which memory tools does an agent have access to?
11. What conversations are active for a given agent?
12. How does the sleep-time agent's memory update frequency relate to conversation pace?

---

## 11. Key Takeaways for Ontology Design

### 11.1 Design Patterns Worth Formalizing

1. **Tiered Memory Pattern**: The hierarchy of in-context vs. out-of-context memory with
   different access patterns is a reusable architectural pattern across all agent frameworks.

2. **Self-Editing Memory Pattern**: The agent's ability to modify its own memory via tool
   calls is unique to Letta/MemGPT and creates interesting reflexive relationships.

3. **Memory Pressure / Eviction Pattern**: The FIFO queue with recursive summarization
   and eviction to persistent storage is a well-defined process pattern.

4. **Shared Block Pattern**: Memory blocks shared across agents create a coordination
   mechanism that has interesting concurrency properties.

5. **Dual Identity Pattern**: The separation of immutable system prompt from mutable
   persona block creates a two-layer identity model.

6. **Asynchronous Memory Formation Pattern**: Sleep-time agents represent a delegation
   pattern where memory management is offloaded to a background process.

### 11.2 Cross-Framework Concepts

Despite architectural differences, all frameworks share common concepts that should be
captured in a general agent memory ontology:

| Universal Concept | Letta | Mem0 | Zep | LangMem | CrewAI |
|-------------------|-------|------|-----|---------|--------|
| **Working memory** | Core blocks | N/A | N/A | N/A | Short-term |
| **Semantic facts** | Core blocks | Memory objects | Entity subgraph | Semantic memory | Entity memory |
| **Episodic history** | Recall memory | Session history | Episode subgraph | Episodic memory | Short-term |
| **Long-term knowledge** | Archival memory | Vector + graph | Community subgraph | Semantic memory | Long-term |
| **Procedural knowledge** | System prompt | N/A | N/A | Procedural memory | N/A |
| **Entity tracking** | Human block | Graph memory | Entity subgraph | Semantic memory | Entity memory |
| **Temporal ordering** | Message timestamps | Basic | Bi-temporal model | Basic | N/A |

### 11.3 Recommended Ontology Scope

For a personal agent ontology, the memory model should capture:

1. **Memory tier taxonomy** -- the hierarchy from in-context to archival
2. **Memory content types** -- blocks, messages, passages, summaries
3. **Memory operations** -- insert, replace, search, evict (as processes)
4. **Agent-memory relationships** -- ownership, sharing, tool access
5. **Temporal aspects** -- creation time, modification time, eviction events
6. **Memory quality** -- organization, staleness, relevance scoring
7. **Cross-agent coordination** -- shared blocks, multi-agent writes

---

## 12. Sources

### Primary Documentation
- [Understanding Memory Management | Letta Docs](https://docs.letta.com/advanced/memory-management/)
- [Core Concepts | Letta Docs](https://docs.letta.com/core-concepts/)
- [MemGPT Concept | Letta Docs](https://docs.letta.com/concepts/memgpt/)
- [Base Tools | Letta Docs](https://docs.letta.com/guides/agents/base-tools/)
- [Memory Blocks (Core Memory) | Letta Docs](https://docs.letta.com/guides/agents/memory-blocks/)
- [Introduction to Stateful Agents | Letta Docs](https://docs.letta.com/guides/agents/memory/)
- [Conversations | Letta Docs](https://docs.letta.com/guides/agents/conversations/)
- [Context Engineering | Letta Docs](https://docs.letta.com/guides/agents/context-engineering/)
- [Archival Memory | Letta Docs](https://docs.letta.com/guides/agents/archival-memory/)
- [Building Stateful Agents | Letta Docs](https://docs.letta.com/guides/agents/overview)
- [Multi-Agent Shared Memory | Letta Docs](https://docs.letta.com/guides/agents/multi-agent-shared-memory)
- [Sleep-Time Agents | Letta Docs](https://docs.letta.com/guides/agents/architectures/sleeptime/)
- [Agent Settings | Letta Docs](https://docs.letta.com/guides/ade/settings/)
- [Data Sources | Letta Docs](https://docs.letta.com/guides/ade/data-sources)
- [Research Background | Letta Docs](https://docs.letta.com/concepts/letta/)

### Research Papers
- [MemGPT: Towards LLMs as Operating Systems (arXiv:2310.08560)](https://arxiv.org/abs/2310.08560)
- [Zep: A Temporal Knowledge Graph Architecture for Agent Memory (arXiv:2501.13956)](https://arxiv.org/abs/2501.13956)
- [Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory (arXiv:2504.19413)](https://arxiv.org/abs/2504.19413)
- [The Belief-Desire-Intention Ontology (arXiv:2511.17162)](https://arxiv.org/abs/2511.17162)

### Blog Posts and Articles
- [Agent Memory: How to Build Agents that Learn and Remember | Letta Blog](https://www.letta.com/blog/agent-memory)
- [Memory Blocks: The Key to Agentic Context Management | Letta Blog](https://www.letta.com/blog/memory-blocks)
- [Stateful Agents: The Missing Link in LLM Intelligence | Letta Blog](https://www.letta.com/blog/stateful-agents)
- [Sleep-Time Compute | Letta Blog](https://www.letta.com/blog/sleep-time-compute)
- [Rearchitecting Letta's Agent Loop | Letta Blog](https://www.letta.com/blog/letta-v1-agent)
- [Anatomy of a Context Window: A Guide to Context Engineering | Letta Blog](https://www.letta.com/blog/guide-to-context-engineering)
- [Adding Memory to LLMs with Letta | Terse Systems](https://tersesystems.com/blog/2025/02/14/adding-memory-to-llms-with-letta/)
- [Virtual Context Management with MemGPT | Leonie Monigatti](https://www.leoniemonigatti.com/blog/memgpt.html)
- [Survey of AI Agent Memory Frameworks | Graphlit Blog](https://www.graphlit.com/blog/survey-of-ai-agent-memory-frameworks)
- [LangChain Memory vs Mem0 vs Zep | Index.dev](https://www.index.dev/skill-vs-skill/ai-mem0-vs-zep-vs-langchain-memory)
- [AI Memory Tools Evaluation | Cognee](https://www.cognee.ai/blog/deep-dives/ai-memory-tools-evaluation)
- [AI Memory Benchmark: Mem0 vs OpenAI vs LangMem vs MemGPT | Mem0](https://mem0.ai/blog/benchmarked-openai-memory-vs-langmem-vs-memgpt-vs-mem0-for-long-term-memory-here-s-how-they-stacked-up)
- [LangMem SDK Launch | LangChain Blog](https://blog.langchain.com/langmem-sdk-launch/)

### GitHub Repositories
- [letta-ai/letta](https://github.com/letta-ai/letta) -- Main Letta platform
- [letta-ai/ai-memory-sdk](https://github.com/letta-ai/ai-memory-sdk) -- Experimental memory SDK
- [letta-ai/agent-file](https://github.com/letta-ai/agent-file) -- Agent File format specification
- [letta-ai/learning-sdk](https://github.com/letta-ai/learning-sdk) -- Continual learning SDK
- [mem0ai/mem0](https://github.com/mem0ai/mem0) -- Mem0 memory layer
- [getzep/zep](https://github.com/getzep/zep) -- Zep memory platform

### Framework Documentation
- [Memory | CrewAI Docs](https://docs.crewai.com/en/concepts/memory)
- [Long-term Memory Concepts | LangMem](https://langchain-ai.github.io/langmem/concepts/conceptual_guide/)
- [Graph Memory | Mem0 Docs](https://docs.mem0.ai/open-source/features/graph-memory)
