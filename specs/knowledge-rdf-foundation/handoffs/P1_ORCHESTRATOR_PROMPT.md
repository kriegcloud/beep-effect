# Phase 1 Orchestrator Prompt

> Copy-paste this prompt to start Phase 1 implementation of the RDF Foundation spec.

---

## Prompt

You are implementing Phase 1 of the `knowledge-rdf-foundation` spec, which establishes the core RdfStore service wrapping N3.Store.

### Context

Phase -1 (Architectural Foundation) is complete. Package allocation, EntityId standards, and RPC patterns are established. You are now building the foundational RDF abstraction that will enable SPARQL queries and reasoning in Phase 1.

### Your Mission

Create the core RdfStore service with:
1. **Quad schema** - RDF quad value object (subject, predicate, object, graph)
2. **QuadPattern schema** - Pattern matching with Option wildcards
3. **RdfStoreService** - Effect.Service wrapping N3.Store
4. **Unit tests** - Test all operations using @beep/testkit

**Deliverables**:
- `packages/knowledge/domain/src/value-objects/rdf/Quad.ts`
- `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts`
- `packages/knowledge/server/src/Rdf/RdfStoreService.ts`
- `packages/knowledge/server/test/Rdf/RdfStoreService.test.ts`
- `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P2.md` (Phase 2 context)
- `specs/knowledge-rdf-foundation/handoffs/P2_ORCHESTRATOR_PROMPT.md` (Phase 2 prompt)

### Critical Patterns

#### 1. Schema Definition (REQUIRED)

```typescript
// Use S.Class for Quad (structural identity)
import * as S from "effect/Schema";

export class Quad extends S.Class<Quad>("Quad")({
  subject: S.String,
  predicate: S.String,
  object: S.String,
  graph: S.optional(S.String, { default: () => "" }),
}) {}

// Use Option for wildcards in QuadPattern
export class QuadPattern extends S.Class<QuadPattern>("QuadPattern")({
  subject: S.OptionFromNullOr(S.String),
  predicate: S.OptionFromNullOr(S.String),
  object: S.OptionFromNullOr(S.String),
  graph: S.OptionFromNullOr(S.String),
}) {}
```

#### 2. Effect.Service Pattern (REQUIRED)

```typescript
import * as Effect from "effect/Effect";

export class RdfStore extends Effect.Service<RdfStore>()("@beep/knowledge-server/RdfStore", {
  accessors: true,
  effect: Effect.gen(function* () {
    const store = new N3.Store();

    return {
      addQuad: (quad: Quad): Effect.Effect<void> =>
        Effect.gen(function* () {
          store.addQuad(quad.subject, quad.predicate, quad.object, quad.graph || "");
        }).pipe(Effect.withSpan("RdfStore.addQuad")),

      // ... other methods
    };
  }),
}) {}
```

#### 3. Testing Pattern (REQUIRED)

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("RdfStore.addQuad adds a quad", () =>
  Effect.gen(function* () {
    const store = yield* RdfStore;
    const quad = new Quad({ subject: "...", predicate: "...", object: "..." });

    yield* store.addQuad(quad);
    const hasQuad = yield* store.hasQuad(quad);

    strictEqual(hasQuad, true);
  }).pipe(Effect.provide(RdfStore.Default))
);
```

### Reference Files

**Read these before starting**:
- `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P1.md` - Full context document
- `.claude/rules/effect-patterns.md` - Mandatory Effect patterns
- `packages/knowledge/server/src/services/OntologyParser.ts` - Existing N3.js usage

**Pattern references**:
- `packages/documents/domain/src/entities/Document/Document.model.ts` - S.Class pattern
- `packages/documents/server/src/DocumentService.ts` - Effect.Service pattern

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

- [ ] Quad and QuadPattern schemas compile
- [ ] RdfStore service compiles and type-checks
- [ ] All tests pass (addQuad, removeQuad, hasQuad, match)
- [ ] Pattern matching with wildcards works correctly
- [ ] No lint errors
- [ ] Exports added to domain and server index files
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] **HANDOFF_P2.md created** (full context for Phase 2)
- [ ] **P2_ORCHESTRATOR_PROMPT.md created** (copy-paste prompt for Phase 2)

### Known Issues

1. **N3.Quad conversion** - N3.js uses `{ subject: { value: "..." } }`, domain uses flat `{ subject: "..." }`. Map in `match()` method.
2. **Default graph** - N3.Store uses `""` for default graph. Convert `Option<string>` via `O.getOrNull()`.
3. **Import extensions** - Tests must use `.js` extension for imports even though source is `.ts`.

### Implementation Order

1. Create `Quad.ts` and `QuadPattern.ts` schemas (30 min)
2. Create `RdfStoreService.ts` with all operations (2 hours)
3. Type-check both packages (15 min)
4. Create unit tests (1.5 hours)
5. Verify all tests pass (15 min)
6. Update REFLECTION_LOG.md (15 min)
7. **Create HANDOFF_P2.md and P2_ORCHESTRATOR_PROMPT.md** (30 min)

**Estimated time**: 5-6 hours

### Handoff Document

Read the full context in: `specs/knowledge-rdf-foundation/handoffs/HANDOFF_P1.md`

This document contains detailed implementation specifications, N3.Quad conversion patterns, and test examples.

### CRITICAL: Phase Completion Requirements

**A phase is NOT complete until handoff documents for the next phase exist.**

Before marking Phase 1 complete:
1. All implementation tasks done
2. All tests pass
3. REFLECTION_LOG.md updated
4. HANDOFF_P2.md created with full context
5. P2_ORCHESTRATOR_PROMPT.md created for easy continuation

---

**Start by reading HANDOFF_P1.md, then implement the schemas, service, and tests in order. Create Phase 2 handoff documents as the final step.**
