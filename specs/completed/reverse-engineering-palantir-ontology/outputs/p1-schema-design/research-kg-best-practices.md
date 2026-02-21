# Knowledge Graph Schema Design Best Practices

**Date:** 2026-02-20
**Source:** Web research -- Stanford CS 520, Meta-Property Graphs (arxiv 2410.13813), Zep/Graphiti documentation, FalkorDB docs
**Purpose:** Inform KG schema design patterns for meta-ontology use case

---

## 1. Property Graph Schema Design Patterns

### Entity Type Hierarchies vs Flat Lists

**Flat entity types** (recommended for Graphiti):
- Simpler to reason about, no inheritance ambiguity
- Each entity gets exactly one primary type label
- Filtering is straightforward: `MATCH (n:Entity:ObjectType)`
- Best when types are well-defined and non-overlapping

**Hierarchical types** (not natively supported in Graphiti):
- Useful when entities have natural is-a relationships
- Can be simulated with multiple labels: `[:Entity:OntologyConcept:ObjectType]`
- Risk: label explosion, unclear which label to filter on
- Better to model hierarchies as explicit EXTENDS/IS_A relationships between type-defining nodes

### Naming Conventions

- **Entity type names**: PascalCase (`ObjectType`, `LinkType`, `SecurityMechanism`)
- **Relationship names**: SCREAMING_SNAKE_CASE (`HAS_PROPERTY`, `IMPLEMENTS_INTERFACE`)
- **Attribute names**: snake_case (`api_name`, `is_primitive`, `concept_category`)
- Source: Graphiti Zep documentation conventions

### Schema Evolution

From Stanford CS 520 (Knowledge Graph Evolution):
- Schema changes must address both social (stakeholder buy-in) and technical challenges
- Relaxing constraints is safe; tightening may invalidate existing data
- New superclass relationships must preserve acyclicity
- Property removal/rename requires propagation tracking
- Key insight: "Most large-scale KGs have inconsistencies that persist because they don't affect critical business functionality"

---

## 2. Temporal Knowledge Graph Patterns

### Graphiti's Bi-Temporal Model

Every fact/edge carries four timestamps:

| Timestamp | Timeline | Meaning |
|-----------|----------|---------|
| `valid_at` | Event (T) | When the fact became true in reality |
| `invalid_at` | Event (T) | When the fact ceased being true |
| `created_at` | Transaction (T') | When recorded in the system |
| `expired_at` | Transaction (T') | When system invalidated this record |

**Key behavior**: Contradicted facts are invalidated, NOT deleted. Historical queries reconstruct past states.

### Implications for Our Schema

For Palantir Ontology knowledge, most facts are **non-temporal** (conceptual definitions don't change frequently). However:
- Product version information DOES change over time
- API deprecation status changes
- Documentation content evolves

Recommendation: Use `valid_at` = episode timestamp for most facts. Let Graphiti handle contradiction detection naturally.

---

## 3. Meta-Ontology Design Patterns

### The Core Challenge

We're building an **ontology about an ontology** -- a meta-ontology. This creates a conceptual recursion:
- Palantir's Ontology has "Object Types" (like Customer, Transaction)
- In OUR KG, "Object Type" is itself an entity representing the CONCEPT
- We're NOT modeling Palantir's data; we're modeling Palantir's DATA MODEL

### Reification Approach (from Meta-Property Graphs paper, arxiv 2410.13813)

Reification treats schema elements as first-class entities. This is exactly what we need:
- "Object Type" becomes a queryable entity node, not just a label
- "Property" becomes a queryable entity node with its own attributes
- Relationships between concepts (e.g., "Object Type HAS Property") become explicit edges

### Levels of Abstraction

| Level | What It Contains | Examples |
|-------|-----------------|----------|
| **Meta-schema** | Our entity type definitions | `OntologyConcept`, `Product`, `Pattern` |
| **Schema** | Palantir's concept definitions | "Object Type is a schema definition of a real-world entity" |
| **Instance** | Specific examples of concepts | "Employee Object Type has firstName Property" |

Our KG primarily operates at the **Schema** level -- describing Palantir's concepts and how they relate. Some **Instance** level data may also appear (e.g., example Object Types from OSDK).

### Meta-Ontology Best Practices

1. **Clear entity type naming**: Avoid naming conflicts between our KG types and Palantir's concept names. Use descriptive names like `OntologyConcept` rather than generic `Concept`.

2. **Concept categorization**: Use a `concept_category` attribute to classify entities within the ontology (rather than creating dozens of entity types).

3. **Relationship specificity**: Use specific relationship names (`HAS_PROPERTY`, `IMPLEMENTS_INTERFACE`) rather than generic ones (`RELATED_TO`, `CONTAINS`).

4. **Cross-reference preservation**: When entities reference external resources (docs URLs, GitHub files), store these as attributes for provenance.

---

## 4. Graphiti-Specific Design Recommendations

### Custom Entity Types via Pydantic Models

From Zep documentation on custom entity and edge types:

```python
class MyEntity(BaseModel):
    field: Optional[str] = Field(None, description="Clear description for LLM guidance")
```

Key rules:
- ALL fields must be `Optional` (LLM may not extract all)
- Field descriptions guide LLM extraction quality
- Atomic design: small, specific fields rather than compound ones
- Reserved names: `uuid`, `name`, `labels`, `created_at`, `summary`, `attributes`, `name_embedding`

### Edge Type Maps

Constrain which entity types can connect:
```python
edge_type_map = {
    ("OntologyConcept", "OntologyConcept"): ["HAS_PROPERTY", "IMPLEMENTS", "EXTENDS"],
    ("OntologyConcept", "Product"): ["PART_OF", "EXPOSED_BY"],
    ("Entity", "Entity"): ["RELATES_TO"]  # Fallback
}
```

Fallback mapping `("Entity", "Entity")` catches unexpected relationships.

### MCP Tool Constraints

The Graphiti MCP server (`add_memory`) uses LLM-driven extraction with default entity types. For precise data, the Python `add_triplet()` API is preferred but NOT available via MCP.

**Recommendation**: For structured, well-known data (like concept definitions), craft episode text that maximizes extraction accuracy. Use specific, unambiguous entity names.

---

## 5. Domain-Specific KG Design for Software Platforms

### Representing SDK/API Structures

For documenting a software platform's data model:
- Model each TYPE DEFINITION as an entity (not instances of the type)
- Capture the RELATIONSHIP BETWEEN TYPES as edges
- Store TYPE PROPERTIES as entity attributes
- Link types to their SDK/API representations

### Capturing Conceptual AND Technical Knowledge

| Knowledge Type | Entity Type | Example |
|---------------|-------------|---------|
| Conceptual | OntologyConcept | "Object Type is the foundation of domain modeling" |
| Technical | APIElement | "ObjectTypeV2 API returns type definitions" |
| Architectural | Pattern | "Interface polymorphism enables type-safe querying" |
| Product | Product | "OSDK is the TypeScript client for the Ontology" |

### Evidence-Based Knowledge

Every fact should trace to a source:
- Blog posts → episode with blog URL
- Documentation → episode with docs URL
- Source code → episode with GitHub file reference
- API specs → episode with API endpoint details

---

## 6. Key Recommendations Summary

1. **Use flat entity types** -- no inheritance hierarchy in Graphiti labels
2. **Use specific relationship names** -- `HAS_PROPERTY` not `RELATES_TO`
3. **Model concepts as entities** -- "Object Type" is a node, not just a label
4. **Categorize within entity types** -- use `concept_category` attribute for sub-classification
5. **Keep attributes atomic and optional** -- follows Graphiti's Pydantic model requirements
6. **Include fallback entity/edge types** -- `("Entity", "Entity")` catch-all mapping
7. **Use `palantir-ontology` group_id** -- isolate from `beep-dev` development data
8. **Craft episode text carefully** -- structured narratives extract better than raw JSON
9. **Store source URLs as attributes** -- enable provenance tracking
10. **Design for extensibility** -- new concepts should fit naturally into existing types
