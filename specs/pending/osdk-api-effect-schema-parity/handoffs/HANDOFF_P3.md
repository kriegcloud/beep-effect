# Handoff P3

## Objective
Implement ontology core SCC and compile-time metadata contracts with high type fidelity.

## Inputs
1. P1 contract docs
2. P2 implementation outputs
3. Upstream ontology core modules

## Required Work
Implement this exact P3 scope and validate core type fixtures:

```text
src/ontology/SimplePropertyDef.ts
src/ontology/InterfaceDefinition.ts
src/ontology/ObjectTypeDefinition.ts
src/ontology/ObjectOrInterface.ts
src/ontology/ObjectSpecifier.ts
src/ontology/ActionDefinition.ts
src/ontology/QueryDefinition.ts
src/mapping/PropertyValueMapping.ts
src/OsdkObject.ts
src/Definitions.ts
src/object/FetchPageArgs.ts
```

## Deliverables
- `outputs/p3-ontology-core/implementation-log.md`
- `outputs/p3-ontology-core/type-fidelity-notes.md`

## Completion Checklist
- [ ] Core SCC modules complete.
- [ ] Core generics compile as contracted.
- [ ] Type fixtures for `SimplePropertyDef` and `ObjectSpecifier` pass.
- [ ] P4 handoff + prompt authored.

## Memory Protocol
Proxy-only routing and fallback text are mandatory.

## Exit Gate
P3 closes when aggregate/query primitives can start without core-model blockers.
