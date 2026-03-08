---
paths:
  - "ontologies/**/*.ttl"
  - "ontologies/**/*.owl"
  - "ontologies/**/*.rdf"
---

# Ontology Safety Rules (Non-Negotiable)

These rules apply to ALL ontology file modifications. Violations are never acceptable.

1. **Never hand-edit structural axioms** (SubClassOf, EquivalentClass, DisjointClasses,
   property assertions) in `.owl`, `.ttl`, or `.rdf` files — always use ROBOT, oaklib,
   rdflib, or Python build scripts
2. **Always run the reasoner** (`robot reason`) after any structural change
3. **Always run quality report** (`robot report`) before committing ontology changes
4. **Never delete terms** — deprecate with `owl:deprecated true` and provide a
   replacement pointer (`obo:IAO_0100001`)
5. **Propose KGCL patches** for human review before applying changes to shared ontologies
6. **Validate SPARQL syntax** before execution
7. **Check for existing terms** (via `runoak search`) before creating new ones
8. **Read before modifying** — always read the existing ontology file before making changes
9. **Back up before bulk operations** — create a checkpoint before ROBOT template or
   batch KGCL application

## Tool Priority

Always try primary tools first:
1. **ROBOT CLI** — build operations (merge, reason, report, template, verify, diff)
2. **oaklib** (`uv run runoak`) — navigation, search, KGCL changes, lexmatch
3. **KGCL** — human-reviewable change proposals
4. **rdflib** — programmatic triple manipulation (as in build scripts)

Escalate to secondary tools (OWLAPY, owlready2, LinkML) only when primary tools
lack the required expressivity.

## Serialization Standards

- Default format: Turtle (`.ttl`)
- CamelCase for class names, camelCase for properties
- All new classes require: `rdfs:label`, `skos:definition`, `rdfs:subClassOf`
- Follow genus-differentia pattern for definitions: "A [parent] that [differentia]"
- Use standard namespace prefixes (see `.claude/skills/_shared/namespaces.json`)
