# Comparison Matrix

> This document will be populated by the comparison agent.
> See AGENT_PROMPT.md for instructions.

## Status: PENDING

---

## Expected Contents

This document will contain a feature-by-feature comparison table with:

1. **Summary Statistics**
   - Total capabilities cataloged
   - Count by gap type (Equivalent, Partial, Different, Missing)

2. **Comparison Tables by Area**
   - Query & Reasoning
   - Entity Resolution
   - GraphRAG
   - Workflow Orchestration
   - RDF Infrastructure
   - Service Architecture

3. **Column Definitions**
   - Capability name
   - effect-ontology file reference
   - knowledge-slice file reference (or "Missing")
   - Gap type classification
   - Priority (P0-P3)
   - Complexity (S/M/L/XL)

---

## Template

When populated, this document will follow this structure:

```markdown
## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Capabilities | ? |
| Equivalent | ? |
| Partial | ? |
| Different | ? |
| Missing | ? |

## Query & Reasoning

| Capability | effect-ontology | knowledge-slice | Gap | Priority | Complexity |
|------------|-----------------|-----------------|-----|----------|------------|
| SPARQL queries | Service/Sparql.ts | ? | ? | ? | ? |
| RDFS reasoning | Service/Reasoner.ts | ? | ? | ? | ? |
| SHACL validation | Service/Shacl.ts | ? | ? | ? | ? |
| N3 rules | Service/N3Rules.ts | ? | ? | ? | ? |

## Entity Resolution

| Capability | effect-ontology | knowledge-slice | Gap | Priority | Complexity |
|------------|-----------------|-----------------|-----|----------|------------|
| Two-tier architecture | Domain/Model/MentionRecord.ts | ? | ? | ? | ? |
| EntityLinker service | Service/EntityLinker.ts | ? | ? | ? | ? |
| Cross-batch resolution | ? | ? | ? | ? | ? |
| Same-as links | ? | ? | ? | ? | ? |

[...additional sections...]
```

---

## Completion Criteria

This document is complete when:
- [ ] All 60+ effect-ontology services cataloged
- [ ] All knowledge-slice packages audited
- [ ] Every row has all columns filled
- [ ] Summary statistics are accurate
- [ ] File paths verified as accurate
