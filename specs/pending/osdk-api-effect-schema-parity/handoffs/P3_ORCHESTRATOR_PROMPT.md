# P3 Orchestrator Prompt

## 1. Context
Foundation modules are in place. Core ontology SCC implementation begins.

## 2. Mission
Implement ontology core contracts and compile-time metadata with high generic fidelity.

## 3. Inputs
1. P1 contracts
2. P2 outputs
3. `handoffs/HANDOFF_P3.md`

## 4. Non-negotiable locks
1. Preserve recursion/discriminator contracts.
2. Preserve high-fidelity generic behavior.
3. Keep runtime schemas for data-bearing contracts.

## 5. Agent assignments
1. ontology core implementation owner
2. generic fidelity verification owner

## 6. Required outputs
1. `outputs/p3-ontology-core/implementation-log.md`
2. `outputs/p3-ontology-core/type-fidelity-notes.md`

Locked module scope for this phase:

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

## 7. Required checks
1. Discovery commands
2. Type fixture checks for core modules

## 8. Exit gate
Core SCC complete and fixtures pass; P4 handoff/prompt authored.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P3.md`
