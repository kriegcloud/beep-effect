# Knowledge Graph Schema Design: Palantir Ontology

**Date:** 2026-02-20
**Status:** DRAFT -- Awaiting user review
**group_id:** `palantir-ontology`

---

## Table of Contents

1. [Design Rationale](#1-design-rationale)
2. [Entity Type Catalog](#2-entity-type-catalog)
3. [Relationship Type Catalog](#3-relationship-type-catalog)
4. [Concept Mapping Table](#4-concept-mapping-table)
5. [Edge Type Map](#5-edge-type-map)
6. [group_id Strategy](#6-group_id-strategy)
7. [Episode Design Guide](#7-episode-design-guide)
8. [Ingestion Strategy](#8-ingestion-strategy)
9. [Query Patterns](#9-query-patterns)
10. [Schema Extensibility](#10-schema-extensibility)

---

## 1. Design Rationale

### The Meta-Ontology Challenge

We are building a **knowledge graph about Palantir's Ontology system** -- a meta-ontology. This means:

- **Our entities** represent Palantir's CONCEPTS (e.g., "Object Type", "Link Type"), not instances of those concepts (e.g., "Employee", "Flight")
- **Our relationships** capture how Palantir's concepts relate to each other (e.g., "Object Type HAS_PROPERTY Property")
- **Our knowledge** comes from documentation, blog posts, SDK source code, and API specs

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entity type granularity | 6 entity types | Balance between specificity and Graphiti's LLM classification accuracy |
| Relationship naming | SCREAMING_SNAKE_CASE | Graphiti convention; LLM extracts these naturally |
| Flat vs hierarchical types | Flat with `concept_category` attribute | Graphiti doesn't support type inheritance natively |
| Data ingestion method | `add_memory` (MCP) with structured narrative episodes | MCP is our available interface; narratives extract better than raw JSON |
| group_id | `palantir-ontology` | Isolate from `beep-dev` development memories |
| Concept sub-classification | Via attributes, not entity types | Keeps entity type count manageable for LLM classification |

### Graphiti Constraints Informing Design

From our Graphiti internals research:

1. **All relationships are `RELATES_TO` in FalkorDB** -- semantic type is in the `name` property, not the relationship type
2. **Entity types are Pydantic models** with Optional fields, passed per episode or configured at MCP server startup
3. **The MCP `add_memory` tool** uses LLM-driven extraction -- we cannot use `add_triplet()` for precise manual insertion
4. **Entity type classification is soft** -- the LLM classifies entities into types using its judgment, not hard constraints
5. **Reserved field names**: `uuid`, `name`, `labels`, `created_at`, `summary`, `attributes`, `name_embedding`
6. **Attributes must be flat key-value** -- no nested objects (FalkorDB limitation)

---

## 2. Entity Type Catalog

### Overview

| # | Entity Type | FalkorDB Label | Description | Expected Count |
|---|------------|----------------|-------------|----------------|
| 1 | **OntologyConcept** | `[:Entity:OntologyConcept]` | A concept in Palantir's Ontology system | 50-150 |
| 2 | **Product** | `[:Entity:Product]` | A Palantir product, SDK, or tool | 15-30 |
| 3 | **Pattern** | `[:Entity:Pattern]` | An architectural, design, or usage pattern | 30-80 |
| 4 | **TechnicalDetail** | `[:Entity:TechnicalDetail]` | A specific technical implementation detail (API, wire type, data type) | 40-100 |
| 5 | **SecurityConcept** | `[:Entity:SecurityConcept]` | A security, access control, or governance mechanism | 15-40 |
| 6 | **UseCase** | `[:Entity:UseCase]` | A real-world application, scenario, or example | 20-60 |

### Entity Type Definitions (Pydantic-style)

#### 1. OntologyConcept

Represents any concept that is part of Palantir's Ontology system -- the 9 core concepts plus additional discovered concepts.

```python
class OntologyConcept(BaseModel):
    """A concept within Palantir's Ontology type system."""
    concept_category: Optional[str] = Field(
        None,
        description="Which Ontology category: object_type, property, shared_property, "
                    "link_type, action_type, role, function, interface, object_view, "
                    "value_type, objectset, struct, type_class, derived_property, "
                    "ontology_container, branching, compute_module, aip_agent"
    )
    is_core_concept: Optional[bool] = Field(
        None,
        description="True if this is one of the 9 original core Ontology concepts "
                    "(Object Type, Property, Shared Property, Link Type, Action Type, "
                    "Roles, Functions, Interfaces, Object Views)"
    )
    palantir_api_name: Optional[str] = Field(
        None,
        description="The API name used in Palantir's codebase, e.g., 'ObjectTypeV2', "
                    "'PropertyApiName', 'LinkTypeSideV2'"
    )
    source_url: Optional[str] = Field(
        None,
        description="URL to primary documentation or source code for this concept"
    )
```

**Examples of OntologyConcept entities:**
- "Object Type" (concept_category: "object_type", is_core_concept: True)
- "Property" (concept_category: "property", is_core_concept: True)
- "ObjectSet" (concept_category: "objectset", is_core_concept: False)
- "Value Type" (concept_category: "value_type", is_core_concept: False)
- "Branching" (concept_category: "branching", is_core_concept: False)

#### 2. Product

Represents a Palantir product, SDK, framework, or tool.

```python
class Product(BaseModel):
    """A Palantir product, SDK, or tool in the ecosystem."""
    product_type: Optional[str] = Field(
        None,
        description="Type of product: platform, sdk, tool, framework, service, api, cli"
    )
    is_open_source: Optional[bool] = Field(
        None,
        description="Whether this product has an open-source release"
    )
    github_url: Optional[str] = Field(
        None,
        description="GitHub repository URL if open source"
    )
    language: Optional[str] = Field(
        None,
        description="Primary programming language: typescript, python, java, go"
    )
```

**Examples of Product entities:**
- "Foundry" (product_type: "platform")
- "OSDK" (product_type: "sdk", is_open_source: True, language: "typescript")
- "AIP" (product_type: "platform")
- "Ontology Manager" (product_type: "tool")

#### 3. Pattern

Represents an architectural pattern, design pattern, usage pattern, or best practice found in the Ontology system.

```python
class Pattern(BaseModel):
    """A design pattern, architectural pattern, or best practice."""
    pattern_type: Optional[str] = Field(
        None,
        description="Type of pattern: architectural, design, security, usage, "
                    "data_modeling, integration, code_generation"
    )
    applies_to: Optional[str] = Field(
        None,
        description="What this pattern applies to, e.g., 'Object Type definition', "
                    "'Action validation', 'Interface polymorphism'"
    )
```

**Examples of Pattern entities:**
- "Interface Polymorphism" (pattern_type: "architectural")
- "__DefinitionMetadata Phantom Type" (pattern_type: "design", applies_to: "TypeScript OSDK code generation")
- "Purpose-Based Access Control" (pattern_type: "security")
- "ObjectSet Fluent API" (pattern_type: "design", applies_to: "Ontology querying")

#### 4. TechnicalDetail

Represents a specific technical implementation detail -- an API type, wire format, data type, or SDK method.

```python
class TechnicalDetail(BaseModel):
    """A specific technical implementation detail in the Ontology system."""
    detail_type: Optional[str] = Field(
        None,
        description="Type of detail: wire_type, api_type, sdk_method, data_type, "
                    "enum_value, branded_string, endpoint"
    )
    code_reference: Optional[str] = Field(
        None,
        description="File path or GitHub URL where this is defined, e.g., "
                    "'osdk-ts/packages/api/src/ontology/ObjectTypeDefinition.ts'"
    )
    type_signature: Optional[str] = Field(
        None,
        description="TypeScript type signature or definition, e.g., "
                    "'interface ObjectTypeDefinition { type: \"object\"; apiName: string; }'"
    )
```

**Examples of TechnicalDetail entities:**
- "ObjectTypeV2" (detail_type: "api_type")
- "LooselyBrandedString" (detail_type: "branded_string")
- "WirePropertyTypes" (detail_type: "wire_type")
- "fetchPage" (detail_type: "sdk_method")

#### 5. SecurityConcept

Represents a security, access control, or governance mechanism in the Ontology.

```python
class SecurityConcept(BaseModel):
    """A security or access control mechanism in the Ontology."""
    mechanism_type: Optional[str] = Field(
        None,
        description="Type of mechanism: role, marking, scope, constraint, "
                    "validation, permission, policy"
    )
    enforcement_level: Optional[str] = Field(
        None,
        description="Where this is enforced: platform, ontology, object_type, "
                    "property, action, api"
    )
```

**Examples of SecurityConcept entities:**
- "PBAC" (mechanism_type: "policy", enforcement_level: "platform")
- "Conjunctive Markings" (mechanism_type: "marking", enforcement_level: "property")
- "OAuth Scopes" (mechanism_type: "scope", enforcement_level: "api")
- "Submission Criteria" (mechanism_type: "validation", enforcement_level: "action")

#### 6. UseCase

Represents a real-world application, scenario, customer story, or concrete example of Ontology usage.

```python
class UseCase(BaseModel):
    """A real-world application or example of Ontology usage."""
    domain: Optional[str] = Field(
        None,
        description="Application domain: defense, healthcare, finance, logistics, "
                    "energy, government, manufacturing, general"
    )
    use_case_type: Optional[str] = Field(
        None,
        description="Type: customer_story, demo_app, tutorial, reference_architecture, "
                    "aip_application"
    )
    source_url: Optional[str] = Field(
        None,
        description="URL to the use case documentation or blog post"
    )
```

**Examples of UseCase entities:**
- "JADC2 Defense Ontology" (domain: "defense", use_case_type: "reference_architecture")
- "Expense Reporting App" (domain: "general", use_case_type: "demo_app")
- "Ontology-Oriented Development" (domain: "general", use_case_type: "tutorial")

---

## 3. Relationship Type Catalog

### Overview

| # | Relationship Name | Source Entity | Target Entity | Description |
|---|------------------|---------------|---------------|-------------|
| 1 | `HAS_PROPERTY` | OntologyConcept | OntologyConcept | A concept owns/contains a property-like sub-concept |
| 2 | `IMPLEMENTS` | OntologyConcept | OntologyConcept | A concept implements/satisfies an abstract contract |
| 3 | `EXTENDS` | OntologyConcept | OntologyConcept | A concept extends/inherits from another |
| 4 | `CONNECTS` | OntologyConcept | OntologyConcept | A link/relationship concept connects two other concepts |
| 5 | `OPERATES_ON` | OntologyConcept | OntologyConcept | A concept operates on / modifies / queries another |
| 6 | `REFERENCES` | OntologyConcept | OntologyConcept | A concept references or depends on another |
| 7 | `CONTAINS` | OntologyConcept | OntologyConcept | A container concept includes sub-concepts |
| 8 | `PART_OF` | OntologyConcept | Product | A concept belongs to or is exposed by a product |
| 9 | `EXPOSED_BY` | OntologyConcept | Product | A concept is surfaced/accessible through a product |
| 10 | `USES_PATTERN` | OntologyConcept | Pattern | A concept employs a specific design pattern |
| 11 | `DEFINED_BY` | OntologyConcept | TechnicalDetail | A concept is defined by a specific type/API |
| 12 | `SECURES` | SecurityConcept | OntologyConcept | A security mechanism protects/governs a concept |
| 13 | `DEMONSTRATES` | UseCase | OntologyConcept | A use case shows a concept in practice |
| 14 | `BUILT_ON` | Product | Product | A product is built on / depends on another product |
| 15 | `INTEGRATES_WITH` | Product | Product | Products that work together |
| 16 | `ENABLES` | Pattern | OntologyConcept | A pattern enables or supports a concept |
| 17 | `DOCUMENTED_AT` | * | * | Points to documentation URL (generic provenance) |
| 18 | `EXAMPLE_OF` | TechnicalDetail | OntologyConcept | A technical detail is an example/implementation of a concept |

### Relationship Details

#### Core Ontology Relationships (OntologyConcept <-> OntologyConcept)

These capture the structure of Palantir's Ontology system:

| Relationship | Typical Usage | Example |
|-------------|---------------|---------|
| `HAS_PROPERTY` | Object Type -> Property | "Object Type HAS_PROPERTY Property" |
| `IMPLEMENTS` | Object Type -> Interface | "Object Type IMPLEMENTS Interface" |
| `EXTENDS` | Interface -> Interface | "Interface EXTENDS Interface" |
| `CONNECTS` | Link Type -> Object Type | "Link Type CONNECTS Object Types" |
| `OPERATES_ON` | Action Type -> Object Type | "Action Type OPERATES_ON Object Type" |
| `REFERENCES` | Function -> Object Type | "Function REFERENCES Object Type in parameters" |
| `CONTAINS` | Ontology -> Object Type | "Ontology CONTAINS Object Types" |

#### Cross-Type Relationships

| Relationship | Typical Usage | Example |
|-------------|---------------|---------|
| `PART_OF` | Concept -> Product | "Object Type PART_OF Foundry" |
| `EXPOSED_BY` | Concept -> Product | "ObjectSet EXPOSED_BY OSDK" |
| `USES_PATTERN` | Concept -> Pattern | "OSDK USES_PATTERN __DefinitionMetadata Phantom Type" |
| `DEFINED_BY` | Concept -> TechnicalDetail | "Object Type DEFINED_BY ObjectTypeV2 API type" |
| `SECURES` | SecurityConcept -> Concept | "PBAC SECURES Object Type" |
| `DEMONSTRATES` | UseCase -> Concept | "JADC2 DEMONSTRATES Action Type" |

---

## 4. Concept Mapping Table

How each of the 9 core Palantir Ontology concepts maps to our KG schema:

| # | Palantir Concept | Entity Type | concept_category | Key Relationships |
|---|-----------------|-------------|------------------|-------------------|
| 1 | **Object Type** | OntologyConcept | `object_type` | HAS_PROPERTY -> Property, IMPLEMENTS -> Interface, target of CONNECTS from Link Type, target of OPERATES_ON from Action Type |
| 2 | **Property** | OntologyConcept | `property` | target of HAS_PROPERTY from Object Type, REFERENCES -> Value Type, REFERENCES -> Data Type |
| 3 | **Shared Property** | OntologyConcept | `shared_property` | REFERENCES -> Property (mapping), target of HAS_PROPERTY from Interface |
| 4 | **Link Type** | OntologyConcept | `link_type` | CONNECTS -> Object Type (bidirectional), target of OPERATES_ON from Action Type |
| 5 | **Action Type** | OntologyConcept | `action_type` | OPERATES_ON -> Object Type, OPERATES_ON -> Link Type, CONTAINS -> Logic Rules |
| 6 | **Roles** | SecurityConcept | `role` | SECURES -> Object Type, SECURES -> Action Type, SECURES -> Function |
| 7 | **Functions** | OntologyConcept | `function` | REFERENCES -> Object Type (params/output), REFERENCES -> Interface, PART_OF -> Compute Module |
| 8 | **Interfaces** | OntologyConcept | `interface` | EXTENDS -> Interface, HAS_PROPERTY -> Shared Property, target of IMPLEMENTS from Object Type |
| 9 | **Object Views** | OntologyConcept | `object_view` | REFERENCES -> Object Type, REFERENCES -> Property |

### Additional Concept Mappings

| Palantir Concept | Entity Type | concept_category |
|-----------------|-------------|------------------|
| ObjectSet | OntologyConcept | `objectset` |
| Value Type | OntologyConcept | `value_type` |
| Struct | OntologyConcept | `struct` |
| TypeClass | OntologyConcept | `type_class` |
| Derived Property | OntologyConcept | `derived_property` |
| Ontology (container) | OntologyConcept | `ontology_container` |
| Branching | OntologyConcept | `branching` |
| AIP Agents | OntologyConcept | `aip_agent` |
| Compute Modules | OntologyConcept | `compute_module` |
| Edit History | OntologyConcept | `edit_history` |

---

## 5. Edge Type Map

Constrains which entity type pairs can have which relationship types:

```python
edge_type_map = {
    # Core Ontology structure
    ("OntologyConcept", "OntologyConcept"): [
        "HAS_PROPERTY",
        "IMPLEMENTS",
        "EXTENDS",
        "CONNECTS",
        "OPERATES_ON",
        "REFERENCES",
        "CONTAINS",
    ],

    # Cross-type relationships
    ("OntologyConcept", "Product"): ["PART_OF", "EXPOSED_BY"],
    ("OntologyConcept", "Pattern"): ["USES_PATTERN"],
    ("OntologyConcept", "TechnicalDetail"): ["DEFINED_BY"],
    ("SecurityConcept", "OntologyConcept"): ["SECURES"],
    ("UseCase", "OntologyConcept"): ["DEMONSTRATES"],
    ("Product", "Product"): ["BUILT_ON", "INTEGRATES_WITH"],
    ("Pattern", "OntologyConcept"): ["ENABLES"],
    ("TechnicalDetail", "OntologyConcept"): ["EXAMPLE_OF"],

    # Fallback for unexpected relationships
    ("Entity", "Entity"): ["RELATES_TO", "DOCUMENTED_AT"],
}
```

---

## 6. group_id Strategy

| group_id | Purpose | Used By |
|----------|---------|---------|
| `palantir-ontology` | All Palantir Ontology knowledge | This spec (P1-P7) |
| `beep-dev` | Development memories, project conventions | Other beep specs (DO NOT USE) |

### Isolation Guarantees

- All `add_memory` calls MUST specify `group_id: "palantir-ontology"`
- All search queries MUST filter by `group_ids: ["palantir-ontology"]`
- The `beep-dev` group contains unrelated project knowledge and MUST NOT be polluted
- To query BOTH groups (e.g., for cross-referencing), pass both in `group_ids` array

---

## 7. Episode Design Guide

### Episode Structure for Maximum Extraction Quality

Graphiti's LLM extraction works best with structured narrative text. Each episode should follow this template:

```
## [Title of the knowledge unit]

[Concept Name] is a [Entity Type] in Palantir's Ontology system.

### Definition
[Clear, concise definition of the concept]

### Key Properties
- [property_name]: [description] ([data type])
- [property_name]: [description] ([data type])

### Relationships
- [Concept Name] [RELATIONSHIP] [Target Concept Name]: [description]
- [Concept Name] [RELATIONSHIP] [Target Concept Name]: [description]

### Key Insights
- [Factual statement about the concept]
- [Another factual statement]

### Source
[URL or reference to the source material]
```

### Episode Naming Convention

Episodes should be named descriptively:
- `"Palantir Ontology: Object Type Definition and Properties"`
- `"OSDK TypeScript: Interface Polymorphism Pattern"`
- `"Blog: Ontology-Oriented Development Overview"`

### Episode Source Types

| source | source_description | When to Use |
|--------|-------------------|-------------|
| `text` | `"palantir-docs"` | Content from palantir.com/docs |
| `text` | `"palantir-blog"` | Content from blog.palantir.com |
| `text` | `"osdk-source"` | Extracted from osdk-ts source code |
| `text` | `"foundry-api"` | Extracted from foundry-platform-typescript |
| `text` | `"repo-analysis"` | Repository structural analysis |
| `text` | `"schema-seed"` | Initial concept definitions (P1 seed data) |

---

## 8. Ingestion Strategy

### Phase 1 Seed: Core Concept Definitions

Before bulk ingestion in P6, create a seed episode defining all 9 core concepts and their relationships. This improves entity resolution for subsequent episodes.

**Seed Episode Content:**

```
The Palantir Ontology is a comprehensive data modeling system that forms
the foundation of the Foundry platform. It consists of 9 core concepts:

Object Type is the primary schema definition of a real-world entity or
event, analogous to a database table. Object Types have Properties,
participate in Link Types, and implement Interfaces.

Property is a typed attribute on an Object Type, analogous to a column.
Properties have data types, nullability, and presentation metadata.

Shared Property Type is a reusable property definition that can be
implemented across multiple Object Types and referenced by Interfaces.

Link Type is the schema definition of a typed, directed relationship
between two Object Types, with cardinality of ONE or MANY on each side.

Action Type is the schema definition of a set of atomic mutations to
objects, property values, and links, with validation and authorization.

Roles are the permissioning mechanism granting access to ontological
resources at both the ontology level and individual resource level.

Functions (also called Queries) are the computation layer over the
Ontology, accepting typed parameters and returning typed outputs.

Interfaces are abstract Ontology types that describe the shape and
capabilities of Object Types, enabling polymorphism and type-safe querying.

Object Views are presentation-layer and security-scoped projections of
Objects, defining how object data is displayed to users.

The Ontology also includes supporting concepts: ObjectSet (query
mechanism), Value Types (semantic type wrappers), Structs (composite
types), Derived Properties (computed fields), and Branching (parallel
development). The OSDK (Ontology SDK) is the TypeScript/Python client
for interacting with the Ontology.
```

### Ingestion Order (P6 Batches)

1. **Batch 1: Seed episode** (above) -- establishes core entities
2. **Batch 2: High-quality web entries** (quality 4+) -- enriched blog/docs content
3. **Batch 3: Medium-quality web entries** (quality 2-3) -- additional content
4. **Batch 4: Repository analysis results** -- structured SDK/API analysis

### Processing Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `group_id` | `"palantir-ontology"` | Data isolation |
| `source` | `"text"` | Narrative text extracts better than JSON |
| Delay between episodes | 2-5 seconds | Prevent overwhelming Graphiti's LLM calls |
| Batch verification | After every 10 episodes | Spot-check with `search_nodes` and `search_memory_facts` |

---

## 9. Query Patterns

### Common Queries Against the Completed KG

#### "What concepts does Object Type relate to?"

```python
# Search for facts involving Object Type
search_memory_facts(
    query="Object Type relationships and connections",
    group_ids=["palantir-ontology"],
    max_facts=20
)
```

#### "How does security work in the Ontology?"

```python
# Search for security-related nodes
search_nodes(
    query="security access control permissions roles markings",
    group_ids=["palantir-ontology"],
    entity_types=["SecurityConcept"],
    max_nodes=15
)
```

#### "What patterns does the OSDK use?"

```python
# Search for patterns related to OSDK
search_memory_facts(
    query="OSDK design patterns architectural patterns",
    group_ids=["palantir-ontology"],
    max_facts=15
)
```

#### "What are all the Ontology concepts?"

```python
# List all OntologyConcept entities
search_nodes(
    query="Palantir Ontology concept definition type system",
    group_ids=["palantir-ontology"],
    entity_types=["OntologyConcept"],
    max_nodes=50
)
```

---

## 10. Schema Extensibility

### Adding New Concepts

When P2-P5 research discovers concepts not in the current schema:

1. **If it's an Ontology concept**: Add as `OntologyConcept` with appropriate `concept_category`
2. **If it's a product/tool**: Add as `Product` with appropriate `product_type`
3. **If it's a pattern**: Add as `Pattern` with appropriate `pattern_type`
4. **If it's a technical detail**: Add as `TechnicalDetail` with appropriate `detail_type`
5. **If it doesn't fit any type**: Add as generic `Entity` -- the fallback catch-all

### Adding New Relationships

New relationship names can be created freely -- Graphiti's `name` field on `RELATES_TO` edges accepts any string. Best practice:
- Use SCREAMING_SNAKE_CASE
- Be specific: `VALIDATES_PARAMETERS` not `RELATED_TO`
- Keep names action-oriented: verb + object pattern

### Adding New Entity Types

If a fundamentally new category of knowledge emerges that doesn't fit the 6 types:
1. Define a new Pydantic model following the patterns above
2. Add to the entity_types dictionary
3. Add appropriate entries to the edge_type_map
4. Document in this schema design

### Adding New Attributes

New Optional fields can be added to existing entity types at any time. Existing entities will simply have `None` for the new fields. This is safe because:
- All Graphiti entity attributes are Optional
- Graphiti has no persistent schema registry
- New attributes only populate on new/updated entities

---

## Appendix A: Entity Type Summary Diagram

```
                    ┌──────────────────┐
                    │  OntologyConcept │ ← Core schema type
                    │                  │   9 core + 10 additional
                    │  concept_category│   Palantir concepts
                    │  is_core_concept │
                    │  palantir_api_name│
                    │  source_url      │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
   ┌─────▼─────┐     ┌──────▼──────┐    ┌───────▼───────┐
   │  Product   │     │   Pattern   │    │TechnicalDetail│
   │            │     │             │    │               │
   │product_type│     │pattern_type │    │detail_type    │
   │is_open_src │     │applies_to   │    │code_reference │
   │github_url  │     │             │    │type_signature │
   │language    │     │             │    │               │
   └────────────┘     └─────────────┘    └───────────────┘

   ┌────────────────┐    ┌─────────────┐
   │SecurityConcept │    │   UseCase   │
   │                │    │             │
   │mechanism_type  │    │domain       │
   │enforcement_lvl │    │use_case_type│
   │                │    │source_url   │
   └────────────────┘    └─────────────┘
```

## Appendix B: Relationship Diagram

```
  OntologyConcept ──HAS_PROPERTY──► OntologyConcept
  OntologyConcept ──IMPLEMENTS────► OntologyConcept
  OntologyConcept ──EXTENDS───────► OntologyConcept
  OntologyConcept ──CONNECTS──────► OntologyConcept
  OntologyConcept ──OPERATES_ON───► OntologyConcept
  OntologyConcept ──REFERENCES────► OntologyConcept
  OntologyConcept ──CONTAINS──────► OntologyConcept

  OntologyConcept ──PART_OF───────► Product
  OntologyConcept ──EXPOSED_BY────► Product
  OntologyConcept ──USES_PATTERN──► Pattern
  OntologyConcept ──DEFINED_BY────► TechnicalDetail

  SecurityConcept ──SECURES───────► OntologyConcept
  UseCase ─────────DEMONSTRATES──► OntologyConcept
  Product ─────────BUILT_ON──────► Product
  Pattern ─────────ENABLES───────► OntologyConcept
  TechnicalDetail ─EXAMPLE_OF────► OntologyConcept
```

## Appendix C: MCP Server Entity Type Configuration

If we need to configure custom entity types on the Graphiti MCP server, the types are defined in `mcp_server/src/models/entity_types.py`. The current default types (Requirement, Preference, Procedure, Location, Event, Object, Topic, Organization, Document) would need to be replaced with our 6 custom types.

**Option A: Use default MCP types** -- Accept that LLM will classify into the 9 default types. This is simpler but loses our custom attributes.

**Option B: Modify MCP server config** -- Replace default entity types with our 6 custom types. Requires access to modify and restart the Graphiti MCP server.

**Option C: Use structured episode text** -- Craft episodes so that the LLM naturally identifies our concepts without custom types. The `name` and `summary` fields on entities will still capture the right information even with default types.

**Recommendation: Option C for initial ingestion**, with Option B as a future enhancement. The entity `name` and `summary` fields capture the most important information regardless of entity type classification. Custom types improve search filtering but aren't strictly required.

---

## Appendix D: Verification Queries

After schema deployment and initial ingestion, verify with:

```bash
# 1. Check seed entities were created
# Expected: 9+ nodes for core concepts
search_nodes(query="Palantir Ontology core concepts", group_ids=["palantir-ontology"], max_nodes=20)

# 2. Check relationships between core concepts
# Expected: edges like HAS_PROPERTY, IMPLEMENTS, CONNECTS
search_memory_facts(query="Object Type relationships", group_ids=["palantir-ontology"], max_facts=20)

# 3. Verify group isolation
# Expected: no palantir-ontology nodes in beep-dev
search_nodes(query="Object Type", group_ids=["beep-dev"], max_nodes=5)

# 4. Check concept coverage
# Expected: all 9 core concepts represented
search_nodes(query="Ontology concept definition", group_ids=["palantir-ontology"], max_nodes=20)
```
