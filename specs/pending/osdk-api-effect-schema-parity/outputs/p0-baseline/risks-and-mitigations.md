# P0 Risks and Mitigations

## Risk Register

| ID | Risk | Likelihood | Impact | Trigger / Signal | Mitigation | Phase owner |
|---|---|---|---|---|---|---|
| R1 | Baseline drift between prior locked numbers and current source snapshot | Medium | High | Current evidence differs from README locked table | Treat `outputs/p0-baseline/parity-matrix.md` as phase-locked source of truth; reference exact generation method in P1 | P1 |
| R2 | Ontology core SCC introduces sequencing deadlock | High | High | Partial implementation of `SimplePropertyDef`/`ObjectTypeDefinition`/`ObjectOrInterface`/`InterfaceDefinition` fails compile | Deliver SCC as one coordinated unit with shared fixtures and compile gate | P3 |
| R3 | Aggregate/objectSet/derivedProperties coupling causes churn | High | High | Repeated type regressions when P4 and P5 are split too finely | Bundle interdependent modules by cluster and keep integration tests at phase boundary | P4/P5 |
| R4 | Public export drift from upstream parity | Medium | High | `index.ts` / package exports miss required stable modules | Enforce P6 export parity matrix as hard gate before P7 | P6 |
| R5 | Alias compatibility regressions (`Ontology*`/`LinkDefinition`) | Medium | Medium | Existing consumers break while migrating to `Osdk*` names | Keep explicit alias bridge files and verify with compatibility tests | P6/P7 |
| R6 | Unstable surface scope creep before stable closure | Medium | Medium | Experimental modules start landing before stable parity closure | Keep unstable implementation gated to P6 only | P6 |
| R7 | Placeholder stubs are mistaken as complete implementations | High | Medium | Files exist but contain only headers/minimal content | Keep stub criterion explicit (`<=15` non-empty lines) and track in parity matrix | P1-P6 |
| R8 | Graphiti proxy instability during fan-out analysis | Low | Medium | Proxy health/metrics failures or `rejected > 0` | Continue work with explicit fallback note and reduce parallelism when queue pressure rises | Cross-phase |

## Immediate Mitigation Actions (Completed in P0)

1. Captured evidence-backed stable/unstable matrix with explicit classification logic.
2. Produced dependency order with SCC notes for the highest-risk clusters.
3. Preserved no-implementation-edit constraint by writing only P0 planning artifacts.
4. Recorded Graphiti proxy health/metrics checks during analysis fan-out.

## Carry-Forward Controls

1. P1 must freeze acceptance contracts (`TBD=0`) for parity counting, alias handling, and export gates.
2. P2-P5 should use cluster-based implementation batches to reduce SCC churn.
3. P6 must include explicit stable/unstable parity matrix as release gate input to P7 verification.
