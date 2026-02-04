# Phase 2 Orchestrator Prompt

**Copy-paste this prompt to start Phase 2 implementation.**

---

## Prompt

I need you to implement Phase 2 of the Knowledge SPARQL Integration spec: SPARQL Service Implementation.

**Specification Location**: `specs/knowledge-sparql-integration/`

**Context Files to Read**:
1. `specs/knowledge-sparql-integration/README.md` - Full specification
2. `specs/knowledge-sparql-integration/handoffs/HANDOFF_P2.md` - Phase 2 detailed handoff
3. `specs/knowledge-sparql-integration/REFLECTION_LOG.md` - Phase 1 learnings
4. `.claude/rules/effect-patterns.md` - Effect import conventions and patterns

**IMPORTANT - Phase 1 is COMPLETE**:
- SparqlParser wraps sparqljs with 45 tests passing
- SparqlQuery value object exists in domain layer
- SparqlBindings ALREADY EXISTS in domain layer
- RdfStore provides `match(QuadPattern)` returning `ReadonlyArray<Quad>`

**Phase 2 Objective**: Execute SPARQL queries against RdfStore and return bindings.

**Deliverables**:
1. **SparqlService** (`@beep/knowledge-server`):
   - Effect.Service wrapping query execution
   - `query(queryString)` - parse and execute
   - `execute(ast)` - execute pre-parsed query

2. **QueryExecutor** (`@beep/knowledge-server`):
   - Translate sparqljs AST to RdfStore.match() calls
   - Join solutions across multiple triple patterns
   - Handle variable binding and solution mapping

3. **FilterEvaluator** (`@beep/knowledge-server`):
   - Evaluate FILTER expressions on candidate solutions
   - Support: equality, comparison, regex, bound, logical operators

4. **Tests** (`@beep/knowledge-server/test/Sparql/`):
   - SparqlService unit tests (SELECT, CONSTRUCT, ASK)
   - QueryExecutor tests (pattern matching, joining)
   - FilterEvaluator tests (all supported operators)

**Critical Requirements**:
- Use Effect.Service with `accessors: true`
- Layer dependencies: `SparqlParser.Default`, `RdfStore.Default`
- Use namespace imports: `import * as Effect from "effect/Effect"`
- Use `@beep/testkit` for tests (NEVER raw bun:test)
- NEVER use native JavaScript methods (use Effect utilities)
- Performance: < 100ms for queries on 10K triple store

**Workflow**:
1. Read specification files (README.md, HANDOFF_P2.md, REFLECTION_LOG.md)
2. Create SparqlService skeleton with Layer dependencies
3. Implement QueryExecutor for triple pattern matching
4. Implement FilterEvaluator for FILTER expressions
5. Integrate components in SparqlService
6. Write comprehensive tests
7. Verify with `bun run check --filter @beep/knowledge-server`
8. Run tests with `bun run test --filter @beep/knowledge-server`
9. Update REFLECTION_LOG.md with Phase 2 learnings
10. Create HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md

**Success Criteria**:
- [ ] SELECT queries return SparqlBindings with variable projections
- [ ] CONSTRUCT queries return ReadonlyArray<Quad>
- [ ] ASK queries return boolean
- [ ] FILTER equality works: `FILTER(?x = "value")`
- [ ] FILTER comparison works: `FILTER(?x > 10)`
- [ ] FILTER regex works: `FILTER(regex(?name, "pattern"))`
- [ ] Multi-pattern joins work correctly
- [ ] Performance: < 100ms for simple queries on 10K triples
- [ ] All tests pass
- [ ] Type checking passes
- [ ] HANDOFF_P3.md created
- [ ] P3_ORCHESTRATOR_PROMPT.md created

**PHASE COMPLETION REQUIREMENT**:
A phase is NOT complete until:
1. All deliverables pass type checking and tests
2. REFLECTION_LOG.md is updated with learnings
3. Next phase handoff documents (HANDOFF_P3.md, P3_ORCHESTRATOR_PROMPT.md) are created

**Agent Recommendations**:
- Use `effect-code-writer` for SparqlService and FilterEvaluator
- Use `codebase-researcher` for sparqljs AST traversal patterns
- Use `test-writer` for comprehensive test suite

**Verification Commands**:
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

**After Completion**:
1. Update `REFLECTION_LOG.md` with Phase 2 learnings
2. Create `handoffs/HANDOFF_P3.md` for Result Formatting phase
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`
4. Document any unsupported FILTER operations discovered

Begin implementation when ready.

---

## Example Session Start

**User**: [Paste prompt above]

**Expected AI Response**:
"I'll implement Phase 2 of the SPARQL Integration spec. Let me start by reading the specification files."

[AI reads README.md, HANDOFF_P2.md, REFLECTION_LOG.md, effect-patterns.md]

"Phase 2 focuses on:
1. Creating SparqlService that combines parsing and execution
2. Implementing QueryExecutor to translate SPARQL patterns to RdfStore queries
3. Implementing FilterEvaluator for FILTER expression support
4. Comprehensive testing of the execution pipeline

I'll proceed with the following approach:
1. Create SparqlService skeleton with Layer dependencies
2. Implement QueryExecutor with pattern-to-QuadPattern translation
3. Implement variable binding and solution joining
4. Add FilterEvaluator for supported operators
5. Write comprehensive tests

Starting with SparqlService skeleton..."

---

## Troubleshooting

### Layer Composition Issues
If service dependencies fail:
```typescript
// Correct Layer composition
export class SparqlService extends Effect.Service<SparqlService>()("...", {
  accessors: true,
  effect: Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const store = yield* RdfStore;
    // ... implementation
  }),
}) {}

// Test Layer
const TestLayer = SparqlService.Default.pipe(
  Layer.provideMerge(SparqlParser.Default),
  Layer.provideMerge(RdfStore.Default)
);
```

### sparqljs AST Traversal
```typescript
// Accessing WHERE patterns from SELECT query
if (ast.type === "query" && ast.queryType === "SELECT") {
  const selectQuery = ast as sparqljs.SelectQuery;
  const wherePatterns = selectQuery.where;  // Pattern[]
  // Handle bgp (basic graph pattern)
  // Handle filter
  // Handle optional
}
```

### Type Checking Failures
1. Verify all imports use namespace convention
2. Check for missing `.$type<>()` on entity ID columns
3. Ensure no native JavaScript methods used
4. Verify Effect.Service pattern with accessors

---

## Next Phase Trigger

After Phase 2 completion, Phase 3 focuses on:
- ResultFormatter utility (JSON bindings, RDF graphs, boolean)
- W3C SPARQL JSON format compliance
- Integration tests (ExtractionPipeline → RdfStore → SPARQL query)
- Performance benchmarks

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-04 | Claude Code | Initial Phase 2 orchestrator prompt |
