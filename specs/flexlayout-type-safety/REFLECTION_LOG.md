# FlexLayout Type Safety — Reflection Log

> Accumulated learnings from audit execution. Update after each batch or significant discovery.

---

## Reflection Protocol

After each batch or phase, answer:

1. **What worked well?** (Keep doing)
2. **What didn't work?** (Stop doing)
3. **What to add?** (Start doing)
4. **Prompt refinements?** (Update AGENT_PROMPTS.md)
5. **Rubric adjustments?** (Update RUBRICS.md)

---

## Reflection Entries

### 2025-01-10 — Phase 0: Initial Refactoring (Prior Context)

#### Context
Initial refactoring of `IJsonModel.ts` from plain TypeScript interfaces to Effect Schema classes with opaque types.

#### What Worked
- **Schema class pattern**: Using `S.Class` with `extend` provided proper opaque types
- **$UiId.create()**: Annotation helper maintained consistency
- **S.decodeUnknownSync**: Provided runtime validation for serialization methods

#### What Didn't Work
- **Direct mutations**: Schema classes have readonly properties, causing build errors when existing code mutated `Partial<IJsonXxx>` objects
- **Return type changes**: Changing from interface to Schema class required updating return types throughout

#### Methodology Improvements
- When refactoring to Schema classes, audit all call sites for mutation patterns BEFORE changing types
- Use `Record<string, unknown>` as intermediate mutable object, then decode

#### Prompt Refinements
- Added explicit instruction about `Record<string, unknown>` intermediate pattern to Schema Expert prompts

#### Codebase-Specific Insights
- `AttributeDefinitions.toJson(json)` mutates the passed object — design assumes mutable intermediate
- `toJson()` methods follow consistent pattern: create empty object, populate via AttributeDefinitions, add structural fields, return

#### Files Completed
| File | Issues Fixed | Agent | Notes |
|------|--------------|-------|-------|
| IJsonModel.ts | Schema class definitions | effect-schema-expert | Replaced interfaces with Schema classes |
| BorderNode.ts | toJson() mutation, Schema decode | effect-schema-expert | Used decodeUnknownSync |
| TabNode.ts | toJson() mutation, Schema decode | effect-schema-expert | Used decodeUnknownSync |

#### Decisions Made
- **decodeUnknownSync vs Either/Option**: Chose `decodeUnknownSync` (fail-fast) because:
  - No existing error handling around `toJson()` calls
  - Data comes from already-validated internal model state
  - Early error detection helps catch bugs during development
- User preference was for Either/Option for safety — may revisit

---

## Accumulated Improvements

### MASTER_ORCHESTRATION.md Updates
- None yet (initial scaffolding)

### RUBRICS.md Updates
- None yet (initial scaffolding)

### AGENT_PROMPTS.md Updates
- Added `Record<string, unknown>` intermediate pattern to Schema Expert prompts
- Emphasized mutation avoidance with Schema classes

---

## Lessons Learned Summary

### Top Techniques (Keep Using)
1. **Schema class with extend()** — Clean inheritance for JSON node types
2. **Intermediate mutable object** — Work around readonly Schema properties
3. **decodeUnknownSync for internal data** — Fail-fast catches bugs early

### Wasted Efforts (Avoid)
1. Attempting to mutate Schema class instances directly
2. Trying to use `Partial<SchemaClass>` (readonly properties persist)

### Open Questions
1. Should we switch to `decodeUnknownEither` with logging for production resilience?
2. How to handle the ~44 remaining files efficiently without context exhaustion?
3. Are there files that can be processed in parallel?

---

## Pattern Library

### Pattern: Schema Class toJson() Serialization

```typescript
// Before (unsafe, mutable interface)
toJson(): IJsonBorderNode {
  const json: Partial<IJsonBorderNode> = {};
  json.location = this._location;
  json.children = this._children.map(c => c.toJson());
  this._attributes.toJson(json);
  return json as IJsonBorderNode;
}

// After (safe, Schema validated)
toJson(): JsonBorderNode {
  const json: Record<string, unknown> = {};
  json.location = this._location;
  json.children = A.map(this._children, c => c.toJson());
  this._attributes.toJson(json);
  return S.decodeUnknownSync(JsonBorderNode)(json);
}
```

**Key Points**:
- Return type changes from interface to Schema class
- Intermediate object is `Record<string, unknown>` (fully mutable)
- Use `A.map` instead of native `.map()`
- Final decode validates structure

---

## Metrics

| Metric | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|---------|
| Files completed | 3 | — | — | — |
| Issues fixed | ~8 | — | — | — |
| Build status | Pass | — | — | — |
| Prompt refinements | 1 | — | — | — |

---

## Next Entry Template

```markdown
### YYYY-MM-DD — Phase X.Y: [Description]

#### Context
[What was being done]

#### What Worked
- [Item]

#### What Didn't Work
- [Item] → [Adjustment made]

#### Methodology Improvements
- [Improvement]

#### Prompt Refinements
- [Refinement added to AGENT_PROMPTS.md]

#### Codebase-Specific Insights
- [Insight]

#### Files Completed
| File | Issues Fixed | Agent | Notes |
|------|--------------|-------|-------|

#### Decisions Made
- [Decision]: [Rationale]
```
