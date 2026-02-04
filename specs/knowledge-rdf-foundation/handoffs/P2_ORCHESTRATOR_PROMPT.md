# Phase 2 Orchestrator Prompt

> Copy-paste this prompt to start Phase 2 implementation of the RDF Foundation spec.

---

## Prompt

You are implementing Phase 2 of the `knowledge-rdf-foundation` spec, which adds named graph support and RDF serialization to the existing RdfStore service.

### Context

Phase 1 is complete. The RdfStore service exists with:
- Quad operations (addQuad, removeQuad, hasQuad, match, countMatches, clear)
- Accessor methods (getSubjects, getPredicates, getObjects, getGraphs)
- Type-safe conversions between domain types (IRI, BlankNode, Literal) and N3.js

You are now adding named graph management and Turtle/N-Triples serialization.

### Your Mission

Create the serialization layer with:
1. **RdfFormat enum** - Turtle, NTriples, JSONLD format literals
2. **Serializer service** - Parse Turtle, serialize to Turtle/N-Triples
3. **Named graph operations** - createGraph, dropGraph, listGraphs
4. **Unit tests** - Test all operations using @beep/testkit
5. **Phase 3 handoff documents** - HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md

**Deliverables**:
- `packages/knowledge/domain/src/value-objects/rdf/RdfFormat.ts`
- `packages/knowledge/server/src/Rdf/Serializer.ts`
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts` (add graph ops)
- `packages/knowledge/server/test/Rdf/Serializer.test.ts`
- `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P3.md`
- `specs/knowledge-rdf-foundation/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Critical Patterns

#### 1. RdfFormat Enum (S.Literal Pattern)

```typescript
import * as S from "effect/Schema";

export const RdfFormat = S.Literal("Turtle", "NTriples", "JSONLD").annotations({
  title: "RDF Format",
  description: "Supported RDF serialization formats",
});

export type RdfFormat = typeof RdfFormat.Type;
```

#### 2. Effect.async for Callback APIs

N3.js uses callback-style APIs. Wrap with `Effect.async`:

```typescript
parseTurtle: (content: string): Effect.Effect<number, SerializerError> =>
  Effect.async<number, SerializerError>((resume) => {
    const parser = new N3.Parser();
    let count = 0;

    parser.parse(content, (error, quad, _prefixes) => {
      if (error) {
        resume(Effect.fail(new SerializerError({
          operation: "parseTurtle",
          message: error.message,
        })));
      } else if (quad) {
        // Add quad to store
        count++;
      } else {
        // null quad means parsing complete
        resume(Effect.succeed(count));
      }
    });
  }).pipe(Effect.withSpan("Serializer.parseTurtle")),
```

#### 3. Serializer Service with Dependency

```typescript
export class Serializer extends Effect.Service<Serializer>()("@beep/knowledge-server/Serializer", {
  accessors: true,
  dependencies: [RdfStore.Default],
  effect: Effect.gen(function* () {
    const store = yield* RdfStore;

    return {
      parseTurtle: (content: string, graph?: IRI.Type) => ...,
      serialize: (format: RdfFormat, graph?: IRI.Type) => ...,
    };
  }),
}) {}
```

#### 4. Error Schema

```typescript
export class SerializerError extends S.TaggedError<SerializerError>()(
  "SerializerError",
  {
    operation: S.String,
    format: S.optional(RdfFormat),
    message: S.String,
    cause: S.optional(S.String),
  }
) {}
```

### Reference Files

**Read these before starting**:
- `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P2.md` - Full context document
- `.claude/rules/effect-patterns.md` - Mandatory Effect patterns
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts` - Phase 1 implementation
- `packages/knowledge/server/src/Ontology/OntologyParser.ts` - Existing N3.js parsing patterns

### Verification

After each step, run:

```bash
# Type-check
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server

# Tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-domain
bun run lint:fix --filter @beep/knowledge-server
```

### Success Criteria

- [ ] RdfFormat enum compiles with Turtle, NTriples, JSONLD
- [ ] Serializer.parseTurtle loads Turtle into RdfStore
- [ ] Serializer.serialize exports to Turtle/N-Triples
- [ ] RdfStore.createGraph/dropGraph/listGraphs work
- [ ] Round-trip test: parse Turtle → serialize → identical output
- [ ] All tests pass
- [ ] No lint errors
- [ ] Exports added to domain and server index files
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] **HANDOFF_P3.md created** (full context for Phase 3)
- [ ] **P3_ORCHESTRATOR_PROMPT.md created** (copy-paste prompt for Phase 3)

### Implementation Order

1. Create `RdfFormat.ts` enum (15 min)
2. Add named graph operations to RdfStoreService (1 hour)
3. Create `Serializer.ts` service (2 hours)
4. Create Serializer tests (1.5 hours)
5. Update exports and verify (30 min)
6. Update REFLECTION_LOG.md (15 min)
7. **Create HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md** (30 min)

**Estimated time**: 6-7 hours

### Handoff Document

Read the full context in: `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P2.md`

This document contains detailed implementation specifications, N3.js callback patterns, and test examples.

### CRITICAL: Phase Completion Requirements

**A phase is NOT complete until handoff documents for the next phase exist.**

Before marking Phase 2 complete:
1. All implementation tasks done
2. All tests pass
3. REFLECTION_LOG.md updated
4. HANDOFF_P3.md created with full context
5. P3_ORCHESTRATOR_PROMPT.md created for easy continuation

---

**Start by reading HANDOFF_P2.md, then implement the enum, service, and tests in order. Create Phase 3 handoff documents as the final step.**
