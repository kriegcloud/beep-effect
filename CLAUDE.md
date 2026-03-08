<!-- effect-solutions:start -->
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `.reference/effect/` for real implementations (run `effect-solutions setup` first)

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
<!-- effect-solutions:end -->

## Domain Ontology

The Personal Agent Ontology (PAO) is the source of truth for the domain model. It lives at `.reference/ontology/` (symlinked from the ontology_skill project).

- **Main ontology**: `.reference/ontology/personal_agent_ontology.ttl` — OWL classes, properties, and relationships
- **Instance data**: `.reference/ontology/pao-data.ttl` — example data
- **Reference individuals**: `.reference/ontology/pao-reference-individuals.ttl`
- **Documentation**: `.reference/ontology/docs/` — per-class/property docs
- **SHACL shapes**: `.reference/ontology/shapes/` — validation constraints

All Effect data models, services, and APIs in this project should align with the ontology. When implementing domain types, consult the `.ttl` files to ensure classes, properties, and relationships match.
