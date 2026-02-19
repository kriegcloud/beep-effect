# Phase 1 Orchestrator Prompt

**Copy-paste this prompt to start Phase 1 implementation.**

> **UPDATED**: Based on lessons learned from implementing RDF foundation spec (Phase 1-3 complete).

---

## Prompt

I need you to implement Phase 1 of the Knowledge SPARQL Integration spec: SPARQL Value Objects & Parser.

**Specification Location**: `specs/knowledge-sparql-integration/`

**Context Files to Read**:
1. `specs/knowledge-sparql-integration/README.md` - Full specification
2. `specs/knowledge-sparql-integration/handoffs/HANDOFF_P1.md` - Phase 1 detailed handoff (UPDATED)
3. `.claude/rules/effect-patterns.md` - Effect import conventions and patterns
4. `specs/knowledge-rdf-foundation/REFLECTION_LOG.md` - Lessons learned from RDF implementation

**IMPORTANT - RDF Foundation is COMPLETE**:
- RdfStore, Serializer, RdfBuilder are all implemented and tested (179 tests)
- SparqlBindings ALREADY EXISTS in domain layer
- Use patterns from `packages/knowledge/server/src/Rdf/` as reference

**Phase 1 Objective**: Create SparqlQuery value object and SparqlParser service wrapping sparqljs.

**Deliverables**:
1. **Value Objects** (`@beep/knowledge-domain`):
   - `SparqlQuery` - Represents parsed SPARQL query (NEW)
   - Note: `SparqlBindings` ALREADY EXISTS - do not recreate

2. **Error Classes** (`@beep/knowledge-domain/errors`):
   - `SparqlParseError` - Parse failure with location info
   - `SparqlUnsupportedFeatureError` - Unsupported SPARQL feature

3. **Parser Service** (`@beep/knowledge-server`):
   - `SparqlParser` - Effect.Service wrapping sparqljs (use `accessors: true`)

4. **Tests** (`@beep/knowledge-server/test/Sparql/`):
   - Parser unit tests (valid/invalid queries)
   - Test coverage for SELECT, CONSTRUCT, ASK query types

**Critical Requirements**:
- Install sparqljs: `bun add sparqljs @types/sparqljs -w`
- Use namespace imports: `import * as Effect from "effect/Effect"`
- Use `Effect.Service` with `accessors: true` (NOT Context.Tag)
- Use `@beep/testkit` for tests (NEVER raw bun:test)
- Value objects must use `S.Class` from `effect/Schema`
- Errors go in DOMAIN layer (like RdfTermConversionError, SerializerError)
- NEVER use native JavaScript methods (use Effect utilities)

**Workflow**:
1. Read specification files (README.md, HANDOFF_P1.md)
2. Create domain value objects (`SparqlQuery`, `SparqlBindings`)
3. Install sparqljs dependency
4. Implement `SparqlParser` service wrapping sparqljs
5. Create tagged error classes
6. Write parser unit tests (valid/invalid queries)
7. Verify with `bun run check --filter @beep/knowledge-domain`
8. Verify with `bun run check --filter @beep/knowledge-server`
9. Run tests with `bun run test --filter @beep/knowledge-server`

**Success Criteria**:
- [ ] Parser handles SELECT queries with WHERE clause
- [ ] Parser handles CONSTRUCT queries
- [ ] Parser handles ASK queries
- [ ] Parser handles PREFIX declarations
- [ ] Parser rejects malformed queries with `ParseError`
- [ ] Parser rejects unsupported features with `UnsupportedFeatureError`
- [ ] All tests pass
- [ ] Type checking passes for both packages

**Agent Recommendations**:
- Use `effect-code-writer` for domain value objects
- Use `codebase-researcher` for sparqljs integration
- Use `test-writer` for unit test creation

**Verification Commands**:
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

**After Completion**:
1. Update `REFLECTION_LOG.md` with Phase 1 learnings
2. Create `handoffs/HANDOFF_P2.md` for SparqlService implementation phase
3. Document any unsupported SPARQL features discovered during testing

**Questions Before Starting**:
- Have you read the specification README.md and HANDOFF_P1.md?
- Do you understand the distinction between domain value objects and server services?
- Are you familiar with the sparqljs library API?

Begin implementation when ready.

---

## Example Session Start

**User**: [Paste prompt above]

**Expected AI Response**:
"I'll implement Phase 1 of the SPARQL Integration spec. Let me start by reading the specification files to understand the requirements."

[AI reads README.md, HANDOFF_P1.md, effect-patterns.md]

"I understand the requirements. Phase 1 focuses on:
1. Creating immutable value objects for SPARQL queries and results
2. Wrapping the sparqljs parser in an Effect service
3. Defining tagged errors for parse failures
4. Writing comprehensive unit tests

I'll proceed with the following steps:
1. Create domain value objects (SparqlQuery, SparqlBindings)
2. Install sparqljs dependency
3. Implement SparqlParser service
4. Create error classes
5. Write unit tests

Starting with domain value objects..."

---

## Troubleshooting

### Parser Installation Issues
If sparqljs installation fails:
```bash
# Check package exists
bun pm ls sparqljs

# Try explicit version
bun add sparqljs@2.3.2 @types/sparqljs -w
```

### Type Checking Failures
If `bun run check` fails:
1. Verify all imports use namespace convention
2. Check for missing `.$type<>()` on entity ID columns
3. Ensure no native JavaScript methods used
4. Verify Schema.Class usage (not plain interfaces)

### Test Failures
If tests fail:
1. Ensure using `@beep/testkit` runners (not raw bun:test)
2. Check test file location (`./test` directory, not `./src`)
3. Verify Layer composition for services
4. Check error tag matching in assertions

---

## Next Phase Trigger

After Phase 1 completion, trigger Phase 2 with:

```
I've completed Phase 1 (SPARQL Value Objects & Parser). Ready to proceed to Phase 2 (SPARQL Service Implementation).

Please create handoffs/HANDOFF_P2.md with:
- SparqlService interface and implementation details
- Query execution strategy (translating AST to RdfStore queries)
- Variable binding engine design
- FILTER evaluation patterns
- Integration with RdfStore Layer

Use the same 4-tier memory structure as HANDOFF_P1.md.
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-03 | Claude Code | Initial orchestrator prompt |
