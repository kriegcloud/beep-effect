# FlexLayout Schema Migration: Rubrics

> Evaluation criteria for assessing schema migration quality.

---

## Scoring Scale

| Score | Label | Meaning |
|-------|-------|---------|
| 5 | Excellent | Exceeds requirements, exemplary implementation |
| 4 | Good | Meets all requirements with minor improvements possible |
| 3 | Acceptable | Meets core requirements, some gaps |
| 2 | Needs Work | Significant gaps, requires revision |
| 1 | Unacceptable | Does not meet requirements |

---

## Dimension 1: Schema Structure (Weight: 25%)

### 5 - Excellent
- Data struct uses `S.Struct({...}).pipe(S.mutable)` correctly
- All optional fields use `S.OptionFromUndefinedOr(S.Type)`
- Arrays use `S.mutable(S.Array(...))`
- Maps use `S.mutable(S.Map({key, value}))` or Effect HashMap
- Schema annotations include identifier and description
- Namespace exports declared (`Type`, `Encoded`)

### 4 - Good
- Core pattern followed correctly
- Minor annotation gaps (missing descriptions)
- All types compile correctly

### 3 - Acceptable
- Basic pattern followed
- Some fields not properly typed as Option
- Missing namespace exports

### 2 - Needs Work
- Pattern partially implemented
- Type errors present
- Mixing schema and non-schema patterns

### 1 - Unacceptable
- Schema pattern not followed
- Major type errors
- Using native types instead of Effect schemas

### Evidence Required
```typescript
// Check for correct struct pattern
S.Struct({...}).pipe(S.mutable).annotations(...)

// Check for Option usage on nullable fields
field: S.OptionFromUndefinedOr(S.String)

// Check for mutable collections
items: S.mutable(S.Array(ItemSchema))
```

---

## Dimension 2: API Preservation (Weight: 30%)

### 5 - Excellent
- All public methods from legacy class exist in schema class
- Method signatures identical (same params, same return types)
- Static methods and factories preserved
- Fluent API maintained (methods returning `this`)

### 4 - Good
- All methods present
- Minor signature changes justified and documented
- Behavior identical

### 3 - Acceptable
- Most methods present
- Some signature changes without documentation
- Core behavior preserved

### 2 - Needs Work
- Missing methods
- Significant signature changes
- Behavior differences

### 1 - Unacceptable
- Major API changes
- Missing critical methods
- Breaking behavior changes

### Evidence Required
```typescript
// Compare method counts
Legacy class methods: N
Schema class methods: M
// M should equal N

// Check method signatures match
// Legacy: getName(): string
// Schema: readonly getName = (): string => this.data.name
```

---

## Dimension 3: Effect Patterns (Weight: 25%)

### 5 - Excellent
- All array operations use `A.*` (map, filter, forEach, etc.)
- All string operations use `Str.*` where applicable
- Sorting uses `Order.mapInput(Order.*, fn)`
- Option handling uses `O.Option`, `O.some`, `O.none`, `O.getOrElse`
- No native JavaScript array/string methods

### 4 - Good
- Effect patterns used consistently
- Rare exceptions justified

### 3 - Acceptable
- Mostly uses Effect patterns
- Some native methods remain

### 2 - Needs Work
- Mixed usage of Effect and native methods
- Inconsistent Option handling

### 1 - Unacceptable
- Primarily native methods
- Effect patterns ignored

### Evidence Required
```typescript
// GOOD: Effect patterns
A.map(items, fn)
A.filter(items, predicate)
A.sort(items, Order.mapInput(Order.string, getter))
O.getOrElse(option, () => default)

// BAD: Native patterns (should not appear)
items.map(fn)
items.filter(predicate)
items.sort((a, b) => ...)
option ?? default
```

---

## Dimension 4: Type Safety (Weight: 15%)

### 5 - Excellent
- No `any` types
- No `@ts-ignore` comments
- All types explicitly declared
- Generic types properly constrained
- Type check passes with zero errors

### 4 - Good
- Minimal type issues
- Type check passes
- Clear type annotations

### 3 - Acceptable
- Type check passes with warnings
- Some implicit any usage

### 2 - Needs Work
- Type errors present
- Using `as any` casts

### 1 - Unacceptable
- Many type errors
- Widespread `any` usage
- `@ts-ignore` comments

### Verification Command
```bash
turbo run check --filter=@beep/ui
# Should exit with code 0
```

---

## Dimension 5: Documentation & Maintainability (Weight: 5%)

### 5 - Excellent
- JSDoc on public methods
- `/** @internal */` on legacy class
- Clear method names
- Schema annotations with descriptions
- Self-documenting code structure

### 4 - Good
- Key methods documented
- Internal markers present
- Readable code

### 3 - Acceptable
- Minimal documentation
- Code is understandable

### 2 - Needs Work
- Missing internal markers
- Confusing code structure

### 1 - Unacceptable
- No documentation
- Legacy class not marked
- Unclear code

---

## Per-File Evaluation Template

```markdown
## [FileName].ts Migration Evaluation

### Schema Structure: [1-5]
- [ ] Mutable struct pattern used
- [ ] Optional fields use OptionFromUndefinedOr
- [ ] Collections properly typed
- [ ] Annotations present
Evidence: [code snippets]

### API Preservation: [1-5]
- [ ] All public methods migrated
- [ ] Signatures preserved
- [ ] Static methods present
Evidence: [method count comparison]

### Effect Patterns: [1-5]
- [ ] A.* for array operations
- [ ] O.* for Option handling
- [ ] Order.* for sorting
- [ ] No native methods
Evidence: [grep for native methods]

### Type Safety: [1-5]
- [ ] Type check passes
- [ ] No any types
- [ ] No ts-ignore
Evidence: [turbo run check output]

### Documentation: [1-5]
- [ ] Internal markers
- [ ] Schema annotations
Evidence: [JSDoc presence]

### Overall Score: [weighted average]
```

---

## Aggregate Scoring

After all 9 files migrated:

| Metric | Target | Actual |
|--------|--------|--------|
| Files migrated | 9 | |
| Type check | Pass | |
| Average schema structure | ≥4.0 | |
| Average API preservation | ≥4.5 | |
| Average Effect patterns | ≥4.0 | |
| Average type safety | ≥4.5 | |
| Average documentation | ≥3.5 | |
| **Overall weighted average** | **≥4.0** | |

---

## Acceptance Criteria

Migration is **COMPLETE** when:

1. All 9 files have schema versions
2. Type check passes: `turbo run check --filter=@beep/ui`
3. Lint passes: `turbo run lint --filter=@beep/ui`
4. Overall weighted score ≥ 4.0
5. No individual dimension below 3.0
6. REFLECTION_LOG.md updated with learnings

Migration is **BLOCKED** if:

1. Type check fails
2. Any dimension scores 1 (Unacceptable)
3. Critical methods missing (doAction, fromJson, toJson)
4. Circular dependency errors

---

## Quick Evaluation Checklist

Per file, verify:

- [ ] `const $I = $UiId.create("flexlayout-react/FileName")`
- [ ] `class FileNameData extends S.Struct({...}).pipe(S.mutable)`
- [ ] `class IFileName extends S.Class<IFileName>($I\`IFileName\`)({data: FileNameData})`
- [ ] `static readonly new = (...) => new IFileName({data: {...}})`
- [ ] All methods use `this.data.fieldName` not `this.fieldName`
- [ ] Legacy class has `/** @internal */`
- [ ] No native array/string methods
- [ ] Type check passes
