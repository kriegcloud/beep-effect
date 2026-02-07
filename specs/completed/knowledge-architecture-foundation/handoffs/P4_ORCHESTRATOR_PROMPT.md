# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 (final phase) of the knowledge-architecture-foundation spec.

### Context

Phases 1-3 implemented the architectural foundation:
- Phase 1: RDF value objects and tagged errors
- Phase 2: RPC contracts for Entity, Relation, GraphRAG, Extraction, Ontology
- Phase 3: Server handlers connecting contracts to services

This phase finalizes documentation and verifies all deliverables.

### Your Mission

Verify ADRs against implementation and complete final documentation.

**Tasks**:
1. Verify each ADR in ARCHITECTURE_DECISIONS.md matches implementation
2. Update implementation checklist with completion status
3. Add "Implementation Notes" section with learnings from Phases 1-3
4. Run full verification commands
5. Update README.md success criteria
6. Update REFLECTION_LOG.md with comprehensive learnings

### Verification Commands

```bash
# Type checking
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint --filter @beep/knowledge-domain
bun run lint --filter @beep/knowledge-server
```

### ADRs to Verify

| ADR | Decision | Verify |
|-----|----------|--------|
| ADR-001 | `@effect/rpc` with slice-specific contracts | Check domain RPC files |
| ADR-002 | Value objects in domain, implementations in server | Check package boundaries |
| ADR-003 | Strict dependency direction | Check no reverse imports |
| ADR-004 | Entity, Relation, GraphRAG, SPARQL, Extraction, Resolution exposed | Check RPC exports |
| ADR-005 | Hybrid handler organization | Check server rpc/v1/ structure |
| ADR-006 | Universal auth middleware | Check all _rpcs.ts files |

### Reference Files

- ADRs: `specs/knowledge-architecture-foundation/outputs/ARCHITECTURE_DECISIONS.md`
- Checklist: Same file, Appendix section
- README: `specs/knowledge-architecture-foundation/README.md`

### Success Criteria

- [ ] All 6 ADRs verified
- [ ] Implementation checklist updated
- [ ] Implementation notes added
- [ ] All type checks pass
- [ ] All tests pass
- [ ] README.md status updated to COMPLETE
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Read full context in: `specs/knowledge-architecture-foundation/handoffs/HANDOFF_P4.md`

### Spec Completion

After Phase 4:
1. Change spec status in README.md from ACTIVE to COMPLETE
2. Add final entry to REFLECTION_LOG.md
3. Communicate completion
