# Rubrics: Knowledge Server Test Shared Fixtures Dedup

## Completion Rubric

| Area | Weight | Pass Condition |
|---|---:|---|
| Dedup Coverage | 35% | Core duplicate families extracted to `_shared` |
| Behavioral Safety | 35% | Existing test behavior unchanged; validations pass |
| API Quality | 20% | Shared helpers are cohesive and typed |
| Process Hygiene | 10% | Outputs/handoffs/reflection updated |

## Detailed Checks

### Dedup Coverage

- [ ] Layer-building duplication reduced across target files
- [ ] Fixture-factory duplication reduced across target files
- [ ] Service-mock duplication reduced where behavior is equivalent

### Behavioral Safety

- [ ] No assertion logic changed unintentionally
- [ ] `bun run check` passes
- [ ] `bun run test packages/knowledge/server/test` passes (or fallback documented)

### API Quality

- [ ] Helper modules have clear intent boundaries
- [ ] Helper names reflect behavior, not implementation detail
- [ ] No broad utility dumping ground introduced

### Process Hygiene

- [ ] Phase artifacts created under `outputs/`
- [ ] Reflection log updated with phase learnings
- [ ] Next handoff pair created when phase boundary is crossed
