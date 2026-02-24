# Handoff — Phase 5: Extended Module Coverage

> Context document for Phase 5 implementation.

---

## Context Budget Status

| Memory Type | Est. Tokens | Budget | Status |
|-------------|-------------|--------|--------|
| Working | ~600 | ≤2,000 | ✅ OK |
| Episodic | ~400 | ≤1,000 | ✅ OK |
| Semantic | ~200 | ≤500 | ✅ OK |
| Procedural | Links | N/A | ✅ OK |
| **Total** | **~1,200** | **≤4,000** | **✅ OK** |

> Phase 4 complete. Phase 5 extends coverage to remaining high-priority modules.

---

## Working Context (≤2K tokens)

### Phase 5 Mission

Generate context files for the 12 remaining high/medium-priority Effect modules identified in the Phase 4 gap analysis.

### Module Targets

| Priority | Module | Import Count | Purpose |
|----------|--------|--------------|---------|
| High | `ParseResult` | 45+ | Schema parsing results, validation errors |
| High | `SchemaAST` | 40+ | Schema AST manipulation, custom transformations |
| High | `Redacted` | 35+ | Sensitive data handling, credential protection |
| High | `HashMap` | 35+ | Immutable hash maps, dictionary patterns |
| Medium | `Order` | 30+ | Ordering, sorting, comparisons |
| Medium | `MutableHashMap` | 30+ | Mutable hash maps, caching patterns |
| Medium | `MutableHashSet` | 30+ | Mutable hash sets, deduplication |
| Medium | `HashSet` | 25+ | Immutable hash sets |
| Medium | `Number` | 25+ | Number utilities, safe operations |
| Medium | `Encoding` | 20+ | Base64, hex, encoding/decoding |
| Medium | `Config` | 20+ | Configuration, environment management |
| Medium | `Schedule` | 20+ | Retry policies, recurring effects |

### Success Criteria

- [ ] 12 new context files created
- [ ] All files follow established template
- [ ] INDEX.md updated with new modules
- [ ] AGENTS.md updated with new modules
- [ ] Total context files: 33 (21 + 12)
- [ ] `bun run check` passes

---

## Episodic Context (≤1K tokens)

### Phase 4 Summary

**Completed Successfully**:
- Generated 4 additional modules (Function, Duration, Data, Cause)
- Created maintenance documentation with automation scripts
- Final review: 8.5/10 for AGENTS.md
- Spec marked complete with 21 context files

**Current State**:
| Tier | Count | Modules |
|------|-------|---------|
| Tier 1 | 5 | Effect, Schema, Layer, Context, Function |
| Tier 2 | 7 | Array, Option, Stream, Either, Match, Duration, Data |
| Tier 3 | 6 | DateTime, String, Struct, Record, Predicate, Cause |
| Platform | 3 | FileSystem, HttpClient, Command |
| **Total** | **21** | — |

---

## Semantic Context (≤500 tokens)

### Tier Assignments for New Modules

| New Module | Tier | Rationale |
|------------|------|-----------|
| ParseResult | Tier 2 | Schema integration, frequently used with S.decode |
| SchemaAST | Tier 3 | Advanced usage, schema internals |
| Redacted | Tier 2 | Security-critical, common in auth flows |
| HashMap | Tier 2 | Core data structure, alternative to Record |
| Order | Tier 3 | Utility, used with Array sorting |
| MutableHashMap | Tier 3 | Performance patterns, caching |
| MutableHashSet | Tier 3 | Performance patterns, deduplication |
| HashSet | Tier 3 | Immutable sets, membership testing |
| Number | Tier 3 | Utility, safe number operations |
| Encoding | Tier 3 | Data serialization patterns |
| Config | Tier 2 | Environment management, service configuration |
| Schedule | Tier 2 | Retry policies, essential for resilience |

### Parallelization Strategy

Spawn 4 doc-writer agents in parallel, each generating 3 modules:
- Agent 1: ParseResult, SchemaAST, Redacted
- Agent 2: HashMap, Order, HashSet
- Agent 3: MutableHashMap, MutableHashSet, Number
- Agent 4: Encoding, Config, Schedule

---

## Procedural Context (Links only)

| Resource | Path | Purpose |
|----------|------|---------|
| Template | `context/effect/Effect.md` | Context file template |
| INDEX | `context/INDEX.md` | Index to update |
| AGENTS.md | `AGENTS.md` | Navigation to update |
| Gap Analysis | `outputs/final-review.md` | Module priorities |
