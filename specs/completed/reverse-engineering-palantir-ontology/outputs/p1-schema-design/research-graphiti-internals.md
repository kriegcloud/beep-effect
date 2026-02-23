# Graphiti Internals Research: Data Model, Schema, and Capabilities

**Date:** 2026-02-20
**Source:** Graphiti GitHub repository (getzep/graphiti), Zep documentation, FalkorDB documentation, arxiv paper 2501.13956v1
**Purpose:** Inform knowledge graph schema design for Palantir Ontology reverse engineering

---

## Table of Contents

1. [Core Architecture: Three-Tier Graph Model](#1-core-architecture-three-tier-graph-model)
2. [Node Data Model](#2-node-data-model)
3. [Edge Data Model](#3-edge-data-model)
4. [Episode Model](#4-episode-model)
5. [Entity Type System](#5-entity-type-system)
6. [Edge Type System](#6-edge-type-system)
7. [Bi-Temporal Model](#7-bi-temporal-model)
8. [Entity Resolution and Deduplication](#8-entity-resolution-and-deduplication)
9. [Community Detection](#9-community-detection)
10. [Search Capabilities](#10-search-capabilities)
11. [FalkorDB Underlying Schema](#11-falkordb-underlying-schema)
12. [Constraints and Limitations](#12-constraints-and-limitations)
13. [Recommendations for Ontology Schema Design](#13-recommendations-for-ontology-schema-design)

---

## 1. Core Architecture: Three-Tier Graph Model

Graphiti organizes its knowledge graph into three interconnected subgraphs (per the Zep paper, arxiv 2501.13956v1):

### Episode Subgraph (G_e)
- Raw input storage: messages, text, JSON episodes
- Serves as a "non-lossy data store from which semantic entities and relations are extracted"
- Episodes are chained temporally via `NEXT_EPISODE` edges
- Episodes are grouped into Sagas via `HAS_EPISODE` edges

### Semantic Entity Subgraph (G_s)
- Entity nodes connected by `RELATES_TO` relationship edges
- Each edge represents a "fact" (a knowledge triple: subject-predicate-object)
- Episodic edges (`MENTIONS`) link episodes to the entities they reference

### Community Subgraph (G_c)
- Higher-level clusters of semantically related entities
- Built via label propagation algorithm
- Community nodes connected to member entities via `HAS_MEMBER` edges
- Used for generating high-level summarizations

**Source:** `graphiti_core/nodes.py`, `graphiti_core/edges.py`, arxiv paper Section 3

---

## 2. Node Data Model

### Base Node (Abstract)

All nodes inherit from this base class:

```python
class Node(BaseModel, ABC):
    uuid: str                    # Auto-generated UUID4
    name: str                    # Human-readable name
    group_id: str                # Graph partition identifier
    labels: list[str]            # FalkorDB node labels (e.g., ["Entity", "Person"])
    created_at: datetime         # UTC creation timestamp
```

**Source:** `graphiti_core/nodes.py`

### EntityNode

The primary node type for knowledge graph entities:

```python
class EntityNode(Node):
    name_embedding: list[float] | None  # 1024-dim vector embedding of name (default: None)
    summary: str                        # LLM-generated contextual summary (default: "")
    attributes: dict[str, Any]          # Custom attributes from entity types (default: {})
```

Key properties:
- `name_embedding` is stored as `vecf32()` in FalkorDB for vector similarity search
- `summary` is regenerated when new episodes mention the entity
- `attributes` stores custom fields from entity type Pydantic models (e.g., `{"age": 35, "occupation": "engineer"}`)
- `labels` contains both the base `"Entity"` label AND any custom entity type labels (e.g., `["Entity", "Person"]`)

**Cypher for Entity Node creation:**
```cypher
MERGE (n:Entity {uuid: $entity_data.uuid})
SET n:{labels}
SET n = $entity_data
SET n.name_embedding = vecf32($entity_data.name_embedding)
RETURN n.uuid AS uuid
```

Note: `SET n:{labels}` dynamically applies labels from the `labels` list. This is how custom entity types become FalkorDB node labels.

**Source:** `graphiti_core/nodes.py`, `graphiti_core/models/nodes/node_db_queries.py`

### EpisodicNode

Represents raw data events:

```python
class EpisodicNode(Node):
    source: EpisodeType          # Enum: message, json, text
    source_description: str      # Description of data origin
    content: str                 # Raw episode content
    valid_at: datetime           # When the episode's events occurred (event time)
    entity_edges: list[str]      # UUIDs of entity edges referenced by this episode
```

**Cypher for Episodic Node:**
```cypher
MERGE (n:Episodic {uuid: $uuid})
SET n = {uuid: $uuid, name: $name, group_id: $group_id,
  source_description: $source_description, source: $source,
  content: $content, entity_edges: $entity_edges,
  created_at: $created_at, valid_at: $valid_at}
```

**Source:** `graphiti_core/nodes.py`, `graphiti_core/models/nodes/node_db_queries.py`

### CommunityNode

Represents entity clusters:

```python
class CommunityNode(Node):
    name_embedding: list[float] | None  # Vector embedding (default: None)
    summary: str                        # LLM-generated community summary (default: "")
```

### SagaNode

Lightweight grouping node for episode sequences:

```python
class SagaNode(Node):
    # No additional fields beyond base Node
```

---

## 3. Edge Data Model

### Base Edge (Abstract)

```python
class Edge(BaseModel, ABC):
    uuid: str                    # Auto-generated UUID4
    group_id: str                # Graph partition identifier
    source_node_uuid: str        # Source node reference
    target_node_uuid: str        # Target node reference
    created_at: datetime         # UTC creation timestamp
```

### EntityEdge (RELATES_TO)

The primary relationship type storing knowledge facts:

```python
class EntityEdge(Edge):
    name: str                           # Relation name (e.g., "WORKS_AT")
    fact: str                           # Natural language fact description
    fact_embedding: list[float] | None  # Vector embedding of the fact
    episodes: list[str]                 # Episode UUIDs that reference this edge
    expired_at: datetime | None         # When this fact was invalidated in the system (T' timeline)
    valid_at: datetime | None           # When this fact became true (T timeline)
    invalid_at: datetime | None         # When this fact ceased being true (T timeline)
    attributes: dict[str, Any]          # Custom attributes from edge types
```

**Cypher for Entity Edge (FalkorDB):**
```cypher
MATCH (source:Entity {uuid: $source_node_uuid})
MATCH (target:Entity {uuid: $target_node_uuid})
MERGE (source)-[r:RELATES_TO {uuid: $uuid}]->(target)
SET r = {uuid: $uuid, group_id: $group_id, name: $name,
  fact: $fact, episodes: $episodes,
  created_at: $created_at, valid_at: $valid_at,
  invalid_at: $invalid_at, expired_at: $expired_at,
  attributes: $attributes}
SET r.fact_embedding = vecf32($fact_embedding)
```

**Critical detail:** ALL entity-to-entity relationships use the same FalkorDB relationship type `RELATES_TO`. The semantic relationship type is stored in the `name` property (e.g., `"WORKS_AT"`, `"LOCATED_IN"`). This means you CANNOT use FalkorDB's native relationship type filtering for different kinds of facts -- you must filter on the `name` property instead.

**Source:** `graphiti_core/edges.py`, `graphiti_core/models/edges/edge_db_queries.py`

### Other Edge Types

| Edge Class | FalkorDB Relationship Type | Connects | Extra Fields |
|---|---|---|---|
| EpisodicEdge | `MENTIONS` | Episodic -> Entity | None |
| CommunityEdge | `HAS_MEMBER` | Community -> Entity/Community | None |
| HasEpisodeEdge | `HAS_EPISODE` | Saga -> Episodic | None |
| NextEpisodeEdge | `NEXT_EPISODE` | Episodic -> Episodic | None |

---

## 4. Episode Model

### Episode Types

```python
class EpisodeType(Enum):
    message = 'message'  # "actor: content" conversational format
    json = 'json'        # Structured JSON data
    text = 'text'        # Plain text
```

### Episode Processing Pipeline

When `add_episode()` is called:

1. **Create EpisodicNode** with content, source, timestamps
2. **Extract entities** via LLM from episode content (uses 4 prior episodes as context)
3. **Classify entities** into entity types (if custom types provided)
4. **Extract attributes** for typed entities
5. **Resolve entities** against existing graph (deduplication)
6. **Extract edges/facts** between entities via LLM
7. **Deduplicate edges** against existing edges between same entity pairs
8. **Invalidate contradicted edges** (set `invalid_at` timestamp)
9. **Create MENTIONS edges** from episode to all referenced entities
10. **Chain episode** via NEXT_EPISODE to previous episode (if applicable)

### group_id Partitioning

- Every node and edge carries a `group_id` field
- `group_id` acts as a logical partition/namespace for the graph
- All search queries filter by `group_id` using `WHERE n.group_id IN $group_ids`
- Multiple group_ids can be queried simultaneously
- The MCP server's `QueueService` processes episodes sequentially per group_id to prevent race conditions
- FalkorDB default group_id: `'_'` (underscore)

**Source:** `graphiti_core/graphiti.py`, `graphiti_core/driver/falkordb_driver.py`

### Episode-Entity Relationship

- Each episode creates `MENTIONS` edges to every entity it references
- Each `EntityEdge` maintains an `episodes` list tracking which episodes contributed to that fact
- This bidirectional linkage enables provenance tracking (which episode produced which fact)

---

## 5. Entity Type System

### How Entity Types Work

Entity types are **Pydantic BaseModel subclasses** passed to `add_episode()`:

```python
class Person(BaseModel):
    age: Optional[int] = Field(None, description="Age of the person")
    occupation: Optional[str] = Field(None, description="Current occupation")

class Company(BaseModel):
    industry: Optional[str] = Field(None, description="Business sector")
    employee_count: Optional[int] = Field(None, description="Number of employees")

entity_types = {"Person": Person, "Company": Company}

await graphiti.add_episode(
    name="episode_1",
    episode_body="John is a 35-year-old software engineer at Acme Corp.",
    entity_types=entity_types,
    ...
)
```

### Entity Type Flow

1. **Extraction**: LLM extracts entity names and tentative types from episode text
2. **Classification**: A separate LLM call classifies each entity into one of the provided types (or `None` if no type fits)
3. **Attribute extraction**: Another LLM call populates the Pydantic model fields from context
4. **Storage**: Type name becomes a FalkorDB label; model fields go into `attributes` dict

### What Gets Stored

For the example above, the resulting EntityNode for "John" would have:
- `labels: ["Entity", "Person"]` -- "Entity" is always present, custom type appended
- `attributes: {"age": 35, "occupation": "software engineer"}`
- `name: "John"`
- `summary: "John is a 35-year-old software engineer..."`

### Entity Type Constraints

**Reserved field names** that CANNOT be used in custom entity type models:
- `uuid`, `name`, `group_id`, `labels`, `created_at`, `summary`, `attributes`, `name_embedding`
- Using any of these raises `EntityTypeValidationError`

**All custom fields MUST be Optional** -- the LLM may not extract all fields from every episode.

**Entity types are per-episode, not per-graph.** You pass entity types to each `add_episode()` call. Different episodes can use different entity type definitions. There is no persistent schema registry in Graphiti.

**Entity types are LLM-driven, not enforced.** The LLM classifies entities into types using its judgment. There is no hard constraint preventing misclassification. The type system is "soft" -- it guides extraction but does not enforce it.

**Source:** `graphiti_core/utils/ontology_utils/entity_types_utils.py`, `graphiti_core/prompts/extract_nodes.py`, official Zep docs

### Default MCP Server Entity Types

The MCP server ships with 9 default types:
- `Requirement`, `Preference`, `Procedure`, `Location`, `Event`, `Object`, `Topic`, `Organization`, `Document`

These are configured at server startup, not per-episode.

**Source:** `mcp_server/src/models/entity_types.py`

---

## 6. Edge Type System

### Custom Edge Types

Similar to entity types, edge types are Pydantic models:

```python
class Employment(BaseModel):
    position: Optional[str] = Field(None, description="Job title")
    start_date: Optional[datetime] = Field(None, description="Employment start date")

edge_types = {"Employment": Employment}
```

### Edge Type Map

You can constrain which edge types connect which entity types:

```python
edge_type_map = {
    ("Person", "Company"): ["Employment"],
    ("Company", "Company"): ["Partnership", "Investment"],
    ("Entity", "Entity"): ["Investment"]  # Fallback for untyped entities
}
```

### How Edge Types Are Stored

- The edge type name goes into the `name` field of the EntityEdge (e.g., `"EMPLOYMENT"`)
- Custom attributes from the Pydantic model go into the `attributes` dict
- The FalkorDB relationship type is ALWAYS `RELATES_TO` regardless of edge type

### Relation Name Format

When no predefined edge types are provided, the LLM derives relation names from the relationship predicate in **SCREAMING_SNAKE_CASE** format (e.g., `"WORKS_AT"`, `"LOCATED_IN"`, `"HAS_MEMBER"`).

When edge types ARE provided, the system matches extracted facts to provided types. Unmatched facts still get SCREAMING_SNAKE_CASE names.

**Source:** `graphiti_core/prompts/extract_edges.py`, official Zep docs

---

## 7. Bi-Temporal Model

### Four Timestamps on EntityEdge

Graphiti tracks two independent timelines on every fact edge:

**Event Timeline (T) -- when facts are true in the real world:**
- `valid_at: datetime | None` -- When the fact became true
- `invalid_at: datetime | None` -- When the fact ceased being true

**Transaction Timeline (T') -- when facts are recorded/invalidated in the system:**
- `created_at: datetime` -- When the edge was created in the graph
- `expired_at: datetime | None` -- When the system invalidated this edge

### How Invalidation Works

When a new fact contradicts an existing fact:
1. The deduplication LLM identifies the contradiction
2. The old edge's `invalid_at` is set to the new edge's `valid_at`
3. The old edge's `expired_at` is set to the current system time
4. The old edge is NOT deleted -- it remains in the graph for historical queries
5. The new edge is created with its own `valid_at`

### Temporal Resolution Rules

From the edge extraction prompt:
- Present-tense facts default `valid_at` to the reference timestamp
- Completed actions receive end timestamps
- Ambiguous dates assume midnight
- Ambiguous years default to January 1st
- All timestamps are ISO 8601 with UTC ("Z" suffix)

### Practical Impact

This means the graph contains both current AND historical facts. To query only current facts:
```cypher
WHERE e.expired_at IS NULL AND e.invalid_at IS NULL
```

**Source:** `graphiti_core/edges.py`, `graphiti_core/prompts/extract_edges.py`, arxiv paper Section 3

---

## 8. Entity Resolution and Deduplication

### Entity Resolution Algorithm

When a new entity is extracted from an episode:

1. **Embed** the entity name into a 1024-dimensional vector
2. **Hybrid search** existing entities using both:
   - Cosine similarity on name embeddings
   - Full-text search (BM25) on entity names
3. **LLM resolution**: Present candidate matches to LLM with prompt asking if they refer to "the same real-world object or concept"
4. **Merge or create**: If duplicate found, merge into existing node (update summary); otherwise create new node

### Deduplication Criteria

From the deduplication prompt:
- Only mark as duplicate when entities refer to "the same real-world object or concept"
- Do NOT mark as duplicate if entities are "related but distinct"
- Do NOT mark as duplicate if entities have "similar names or purposes but refer to separate instances or concepts"

### Edge Deduplication

For edges between the same entity pair:
1. Search for existing edges between the same source and target nodes
2. LLM evaluates if the new fact is:
   - **Duplicate**: Identical factual information (skip creation)
   - **Contradictory**: Conflicting claims (invalidate old edge, create new)
   - **Novel**: New information (create new edge)

### Known Issue: Duplicate Nodes

From our live Graphiti instance, a known fact states: "As the graph grows, Graphiti may produce duplicate nodes leading to entity resolution noise." This is confirmed by the entity resolution being LLM-dependent -- it can fail if the LLM doesn't recognize two differently-named entities as the same thing.

**Source:** `graphiti_core/prompts/dedupe_nodes.py`, `graphiti_core/prompts/dedupe_edges.py`

---

## 9. Community Detection

### Algorithm

- Uses **label propagation** (not Leiden algorithm)
- Dynamic extension: new nodes assigned to "community held by the plurality of its neighbors"
- Periodic full refresh maintains accuracy
- Communities have LLM-generated summaries

### Community Structure

- `CommunityNode` with name, summary, and name embedding
- `HAS_MEMBER` edges from community to member entities
- Communities can nest (community -> community via HAS_MEMBER)

### Triggering

Community building is optional and triggered by:
- `update_communities=True` on `add_episode()`
- Explicit `build_communities()` call

**Source:** `graphiti_core/graphiti.py`, arxiv paper

---

## 10. Search Capabilities

### Search Methods

| Method | Nodes | Edges | Episodes | Communities |
|---|---|---|---|---|
| Cosine similarity (vector) | Yes | Yes | No | Yes |
| BM25 (full-text) | Yes | Yes | Yes | Yes |
| Breadth-first search (graph traversal) | Yes | Yes | No | No |

### Reranking Strategies

- **Reciprocal Rank Fusion (RRF)**: Combines results from multiple search methods
- **Node distance**: Reranks by graph proximity to a center node
- **Episode mentions**: Reranks by how many episodes reference the result
- **MMR (Maximal Marginal Relevance)**: Diversity-promoting reranker
- **Cross-encoder**: Neural reranking model

### Search Filters

```python
class SearchFilters:
    node_labels: list[str] | None     # Filter by entity type labels
    edge_types: list[str] | None      # Filter by edge name
    valid_at: datetime | None
    invalid_at: datetime | None
    created_at: datetime | None
    expired_at: datetime | None
    property_filters: list[PropertyFilter] | None  # Generic property filters
```

Node label filtering in Cypher:
```cypher
MATCH (n:Entity:Person)  -- filters to nodes with both Entity AND Person labels
```

**Source:** `graphiti_core/search/search_config.py`, `graphiti_core/search/search_filters.py`

---

## 11. FalkorDB Underlying Schema

### Node Labels in FalkorDB

| Label | Purpose |
|---|---|
| `Entity` | All entity nodes (always present) |
| `Episodic` | Episode nodes |
| `Community` | Community cluster nodes |
| `Saga` | Episode sequence grouping nodes |
| Custom labels | Entity type names (e.g., `Person`, `Company`) |

Entity nodes can have MULTIPLE labels: `[:Entity:Person]`, `[:Entity:Organization]`

### Relationship Types in FalkorDB

| Relationship Type | Connects | Purpose |
|---|---|---|
| `RELATES_TO` | Entity -> Entity | All semantic facts/relationships |
| `MENTIONS` | Episodic -> Entity | Episode references entity |
| `HAS_MEMBER` | Community -> Entity/Community | Community membership |
| `HAS_EPISODE` | Saga -> Episodic | Saga contains episode |
| `NEXT_EPISODE` | Episodic -> Episodic | Temporal episode ordering |

### Indices Created by Graphiti

**Range Indices (FalkorDB):**
- Entity nodes: `uuid, group_id, name, created_at`
- Episodic nodes: `uuid, group_id, created_at, valid_at`
- Community nodes: `uuid`
- Saga nodes: `uuid, group_id, name`
- RELATES_TO edges: `uuid, group_id, name, created_at, expired_at, valid_at, invalid_at`
- MENTIONS edges: `uuid, group_id`
- HAS_MEMBER edges: `uuid, group_id`
- HAS_EPISODE edges: `uuid, group_id`
- NEXT_EPISODE edges: `uuid, group_id`

**Full-Text Indices (with stopword filtering):**
- Episodic nodes: `content, source, source_description, group_id`
- Entity nodes: `name, summary, group_id`
- Community nodes: `name, group_id`
- RELATES_TO edges: `name, fact, group_id`

**Vector Indices:**
- Entity nodes: `name_embedding` (vecf32)
- Community nodes: `name_embedding` (vecf32)
- RELATES_TO edges: `fact_embedding` (vecf32)

### FalkorDB-Specific Behaviors

- **No native datetime type in older versions**: Graphiti converts datetimes to ISO strings before storing
- **Vector storage**: Uses `vecf32()` function to store float arrays
- **Text sanitization**: Special characters `(,.<>{}[]"':;!@#$%^&*()-+=~?|/\)` replaced with whitespace for full-text queries
- **Default group_id**: `'_'` (underscore string)
- **Connection**: Redis protocol on port 6379 (`falkor://localhost:6379`)
- **Graph naming**: Multi-tenant via `database` parameter (default: `'default_db'`)

### FalkorDB Data Type Support

Storable as node/edge properties:
- Strings, Booleans (stored as 0/1), 64-bit Integers, 64-bit Doubles
- Date, Time, DateTime, Duration (temporal types)
- Arrays (if elements are serializable, no nulls)
- Geospatial Points (lat/long as 32-bit float pairs)

NOT storable:
- `null` (cannot be persisted as a property value)
- Maps/dicts (not storable as properties -- Graphiti serializes `attributes` dict somehow)

### FalkorDB Constraint Support

- **UNIQUE constraints**: Prevent duplicate property combinations (requires pre-existing index)
- **MANDATORY constraints**: Require specific properties on all nodes with a label
- Constraints are created asynchronously (return `PENDING`)
- Unique constraints only enforced when ALL constrained properties are non-null
- Array-valued properties cannot have unique constraints
- 1-255 properties per constraint

**Note:** Graphiti does NOT create any FalkorDB constraints by default -- only indices.

**Source:** `graphiti_core/graph_queries.py`, `graphiti_core/driver/falkordb_driver.py`, FalkorDB documentation

---

## 12. Constraints and Limitations

### Schema Limitations

1. **No persistent schema registry.** Entity types and edge types are passed per `add_episode()` call. The graph itself has no awareness of which types are "valid." You could pass different type definitions in different calls and the graph would happily accept all of them.

2. **ALL entity relationships use `RELATES_TO`.** You cannot leverage FalkorDB's native relationship type system for semantic differentiation. The actual relationship semantics are in the `name` string property.

3. **Entity type classification is LLM-driven, not enforced.** The LLM may misclassify entities. There is no validation that an entity actually matches its assigned type schema.

4. **No unique constraints on entity names.** Two nodes with the same `name` and `group_id` can coexist. Deduplication relies on LLM judgment, which can fail.

5. **Attributes dict is a flat key-value store.** FalkorDB cannot store maps as properties, so the `attributes` field may be serialized. Nested data structures are not well-supported.

6. **No schema evolution tracking.** If you change an entity type definition between episodes, old entities retain their original attributes. New attributes appear only on new/updated entities.

### Data Model Limitations

7. **Single relationship type between entity pairs.** While multiple `RELATES_TO` edges can exist between the same pair of entities (with different `uuid`s and `name`s), they all share the same FalkorDB relationship type.

8. **Community detection is basic.** Label propagation is simpler than Leiden but may produce lower-quality clusters for complex graphs.

9. **Episode context window is small.** Entity extraction uses only 4 prior episodes as context, which may miss longer-range entity references.

10. **No native support for hierarchical type systems.** You cannot define type inheritance (e.g., "Software" is a subtype of "Product").

### Operational Limitations

11. **LLM dependency for all intelligence.** Entity extraction, classification, deduplication, edge extraction, and contradiction detection ALL require LLM calls. This creates latency and cost.

12. **Sequential processing per group_id.** Episodes within the same group are processed one at a time to prevent race conditions. Bulk ingestion can be slow.

13. **Entity resolution degrades with scale.** As the graph grows, the candidate set for deduplication grows, and the LLM may struggle with increasingly similar entities.

14. **No transactions in FalkorDB.** While Graphiti has a `transaction()` method, FalkorDB's transaction support may be limited compared to Neo4j.

---

## 13. Recommendations for Ontology Schema Design

Based on this research, here are specific recommendations for representing Palantir's Ontology in Graphiti:

### Use Entity Types for Ontology Concepts

Define Pydantic models for each Palantir Ontology concept type:

```python
class ObjectType(BaseModel):
    """Represents a Palantir Object Type definition"""
    api_name: Optional[str] = Field(None, description="API name of the object type")
    primary_key: Optional[str] = Field(None, description="Primary key property")
    visibility: Optional[str] = Field(None, description="Visibility level")

class LinkType(BaseModel):
    """Represents a Palantir Link Type definition"""
    api_name: Optional[str] = Field(None, description="API name of the link type")
    cardinality: Optional[str] = Field(None, description="Many-to-many, one-to-many, etc.")
    source_object_type: Optional[str] = Field(None, description="Source object type")
    target_object_type: Optional[str] = Field(None, description="Target object type")

class ActionType(BaseModel):
    """Represents a Palantir Action Type definition"""
    api_name: Optional[str] = Field(None, description="API name of the action type")
    parameters: Optional[str] = Field(None, description="JSON string of parameter definitions")
```

### Use Edge Types with Edge Type Map

Define constrained relationships:

```python
edge_types = {
    "HAS_PROPERTY": HasProperty,
    "LINKS_TO": LinksTo,
    "IMPLEMENTS": Implements,
    "EXTENDS": Extends,
}

edge_type_map = {
    ("ObjectType", "PropertyType"): ["HAS_PROPERTY"],
    ("ObjectType", "ObjectType"): ["LINKS_TO"],
    ("ActionType", "ObjectType"): ["MODIFIES"],
}
```

### Leverage group_id for Multi-Tenancy

Use `group_id` to separate:
- Different Palantir stack instances
- Different ontology versions
- Dev vs. production environments

### Work Around the `RELATES_TO` Limitation

Since all relationships are `RELATES_TO` in FalkorDB, use the `name` field and `edge_types` filter in SearchFilters to differentiate relationship semantics. Example search:

```python
search_filter = SearchFilters(edge_types=["HAS_PROPERTY"])
results = await graphiti.search("properties of Aircraft", search_filter=search_filter)
```

### Use Structured JSON Episodes for Bulk Ingestion

When ingesting Palantir SDK examples or documentation, use `EpisodeType.json` for structured data and `EpisodeType.text` for documentation. JSON episodes provide more reliable entity extraction for structured content.

### Custom Extraction Instructions

The `add_episode()` method accepts `custom_extraction_instructions: str` for domain-specific guidance. Use this to teach the LLM about Palantir-specific concepts:

```python
custom_instructions = """
When extracting entities from Palantir Ontology documentation:
- Object Types are the primary entity types (like database tables)
- Link Types define relationships between Object Types
- Action Types define mutations/operations on Object Types
- Properties are typed fields on Object Types
"""
```

### Handle the Attributes Dict Carefully

Since `attributes` is a flat dict and FalkorDB cannot store nested maps:
- Keep attribute values as primitives (strings, numbers, booleans)
- For complex nested data, serialize to JSON strings
- Use description fields on the Pydantic models to guide LLM extraction

### Plan for Entity Resolution Noise

Given that entity resolution is LLM-driven and can produce duplicates:
- Use very specific, unambiguous entity names
- Consider prefixing entity names with type (e.g., "ObjectType:Aircraft" vs "Aircraft")
- Periodically audit the graph for duplicate entities
- Use the `node_list` deduplication prompt for batch cleanup

### Do NOT Rely on FalkorDB Constraints

Graphiti creates no constraints by default. If you need uniqueness guarantees (e.g., one node per Object Type API name), you must:
- Either add FalkorDB constraints manually via raw Cypher
- Or implement application-level checks before ingestion
- Consider using the `add_triplet()` API for precise manual graph construction instead of LLM-driven extraction

### Consider Direct `add_triplet()` for Precise Data

For well-structured Palantir Ontology data where you already know the entities and relationships, bypass LLM extraction entirely:

```python
source_node = EntityNode(name="Aircraft", labels=["Entity", "ObjectType"], ...)
target_node = EntityNode(name="tailNumber", labels=["Entity", "PropertyType"], ...)
edge = EntityEdge(name="HAS_PROPERTY", fact="Aircraft has property tailNumber", ...)

await graphiti.add_triplet(source_node, edge, target_node)
```

This avoids LLM extraction errors, misclassification, and deduplication issues.

---

## Appendix A: MCP Tool API Surface

The following MCP tools are available (as confirmed by our live Graphiti instance):

| Tool | Parameters | Returns |
|---|---|---|
| `add_memory` | name, episode_body, group_id, source, source_description, uuid | Queued episode for async processing |
| `search_nodes` | query, group_ids, max_nodes, entity_types | Nodes with uuid, name, labels, summary, attributes |
| `search_memory_facts` | query, group_ids, max_facts, center_node_uuid | EntityEdges with fact, name, timestamps, attributes |
| `get_episodes` | group_ids, max_episodes | EpisodicNodes with content, source, timestamps |
| `delete_episode` | uuid | Deletes episode and orphaned entities |
| `delete_entity_edge` | uuid | Deletes a specific fact/relationship |
| `get_entity_edge` | uuid | Single EntityEdge by UUID |
| `get_status` | none | Server health and DB connectivity |
| `clear_graph` | group_ids | Wipes all data for specified groups |

### MCP Response Shapes (from live instance)

**Node shape:**
```json
{
  "uuid": "5caa8bfc-...",
  "name": "object type",
  "labels": ["Entity"],
  "created_at": "2026-02-20T20:55:44.584539+00:00",
  "summary": "Object type (Palantir Ontology concept)...",
  "group_id": "beep-dev",
  "attributes": {}
}
```

**Fact/Edge shape:**
```json
{
  "uuid": "3109452d-...",
  "group_id": "beep-dev",
  "source_node_uuid": "bae87c83-...",
  "target_node_uuid": "2556e904-...",
  "created_at": "2026-02-20T20:55:12.141925Z",
  "name": "STORES_KNOWLEDGE_IN",
  "fact": "The Knowledge Graph stores extracted Palantir Ontology concepts in Graphiti.",
  "episodes": ["636f499c-..."],
  "expired_at": "2026-02-20T20:56:13.451601Z",
  "valid_at": "2026-02-20T20:54:52Z",
  "invalid_at": "2026-02-20T20:55:38.871271Z",
  "attributes": {}
}
```

**Episode shape:**
```json
{
  "uuid": "fedcc7f2-...",
  "name": "Changesets-turborepo spec moved to completed",
  "content": "Per maintainer request, specs/pending/...",
  "created_at": "2026-02-20T01:49:56.342861+00:00",
  "source": "text",
  "source_description": "codex-cli session",
  "group_id": "beep-dev"
}
```

---

## Appendix B: Key Source File Locations

| File | Purpose |
|---|---|
| `graphiti_core/nodes.py` | Node class definitions (EntityNode, EpisodicNode, etc.) |
| `graphiti_core/edges.py` | Edge class definitions (EntityEdge, EpisodicEdge, etc.) |
| `graphiti_core/graphiti.py` | Main API: add_episode, search, add_triplet, etc. |
| `graphiti_core/graphiti_types.py` | GraphitiClients container model |
| `graphiti_core/graph_queries.py` | Index and constraint creation queries |
| `graphiti_core/models/nodes/node_db_queries.py` | Cypher queries for node CRUD |
| `graphiti_core/models/edges/edge_db_queries.py` | Cypher queries for edge CRUD |
| `graphiti_core/prompts/extract_nodes.py` | LLM prompts for entity extraction and classification |
| `graphiti_core/prompts/extract_edges.py` | LLM prompts for fact/relationship extraction |
| `graphiti_core/prompts/dedupe_nodes.py` | LLM prompts for entity deduplication |
| `graphiti_core/prompts/dedupe_edges.py` | LLM prompts for edge dedup and contradiction detection |
| `graphiti_core/search/search_config.py` | Search method and reranker configurations |
| `graphiti_core/search/search_filters.py` | SearchFilters model with node_labels, edge_types |
| `graphiti_core/utils/ontology_utils/entity_types_utils.py` | Entity type validation |
| `graphiti_core/driver/falkordb_driver.py` | FalkorDB driver with connection and query handling |
| `mcp_server/src/graphiti_mcp_server.py` | MCP server tool definitions |
| `mcp_server/src/models/entity_types.py` | Default MCP entity type definitions |
