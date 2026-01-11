# FlexLayout Type Safety — Rubrics

> Evaluation criteria for identifying and prioritizing unsafe patterns.

---

## Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| **Critical** | Breaks type safety guarantees, potential runtime errors | Must fix immediately |
| **High** | Violates Effect patterns, reduces maintainability | Fix in current batch |
| **Medium** | Inconsistent with codebase conventions | Fix when touching file |
| **Low** | Style preference, minor improvement | Optional |

---

## Pattern Categories

### 1. Type Assertions & Casts

#### 1.1 `any` Type Usage
**Severity**: Critical

```typescript
// VIOLATION
function process(data: any) { ... }
const result = value as any;
```

**Detection**:
- Search: `\bany\b` (word boundary)
- Exclude: JSDoc comments, type guards

**Fix Agent**: effect-schema-expert

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No `any` types in file |
| 1 | 1-2 `any` types, isolated |
| 3 | 3-5 `any` types, spreads |
| 5 | 6+ `any` types, systemic |

---

#### 1.2 Non-null Assertion (`!`)
**Severity**: High

```typescript
// VIOLATION
const name = user!.name;
const first = items[0]!;
```

**Detection**: Search `!\.|!\[`

**Fix Agent**: effect-predicate-master

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No non-null assertions |
| 1 | 1-2 in edge cases |
| 2 | 3-5 assertions |
| 3 | 6+ assertions |

---

#### 1.3 Type Assertion (`as`)
**Severity**: High (context-dependent)

```typescript
// VIOLATION (unsafe)
const data = response as UserData;

// ACCEPTABLE (after validation)
const data = S.decodeUnknownSync(UserSchema)(response);
return data as UserData; // Schema validated
```

**Detection**: Search `\bas\s+[A-Z]`

**Fix Agent**: effect-schema-expert

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No unsafe assertions |
| 1 | Assertions after validation only |
| 2 | Some unvalidated assertions |
| 3 | Many unvalidated assertions |

---

### 2. Native Method Violations

#### 2.1 Native Array Methods
**Severity**: Critical (per codebase rules)

```typescript
// VIOLATION
items.map(x => x.id)
items.filter(x => x.active)
items.find(x => x.id === id)
items.reduce((acc, x) => acc + x, 0)
items.forEach(x => process(x))
```

**Detection**: Search `\.\s*(map|filter|find|findIndex|some|every|reduce|forEach|includes|indexOf|concat|flat|flatMap)\s*\(`

**Fix Agent**: effect-predicate-master

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No native array methods |
| 2 | 1-5 occurrences |
| 4 | 6-15 occurrences |
| 5 | 16+ occurrences |

---

#### 2.2 Native String Methods
**Severity**: Critical (per codebase rules)

```typescript
// VIOLATION
str.split(",")
str.includes("test")
str.startsWith("prefix")
str.trim()
```

**Detection**: Search `\.\s*(split|includes|startsWith|endsWith|trim|toLowerCase|toUpperCase|replace|replaceAll|slice|substring)\s*\(`

**Fix Agent**: effect-predicate-master

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No native string methods |
| 2 | 1-5 occurrences |
| 4 | 6-15 occurrences |
| 5 | 16+ occurrences |

---

### 3. Null/Undefined Handling

#### 3.1 Unchecked Optional Access
**Severity**: High

```typescript
// VIOLATION
const name = obj.profile.name; // profile may be undefined
const first = items[0].value;  // items[0] may be undefined
```

**Detection**: Manual review of property access chains

**Fix Agent**: effect-predicate-master

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | All optional access guarded |
| 1 | Most access guarded |
| 2 | Some unguarded access |
| 3 | Many unguarded access patterns |

---

#### 3.2 Optional Chaining Without Option
**Severity**: Medium

```typescript
// ACCEPTABLE but not idiomatic
const value = obj?.nested?.value ?? "default";

// PREFERRED
const value = pipe(
  O.fromNullable(obj),
  O.flatMap(o => O.fromNullable(o.nested)),
  O.map(n => n.value),
  O.getOrElse(() => "default")
);
```

**Detection**: Search `\?\.|$\?\[`

**Fix Agent**: effect-predicate-master

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | Uses Option consistently |
| 1 | Mix of optional chaining and Option |
| 2 | Primarily optional chaining |

---

### 4. Serialization Safety

#### 4.1 toJson() Without Validation
**Severity**: Critical

```typescript
// VIOLATION
toJson(): IJsonNode {
  return {
    type: this.type,
    children: this.children.map(c => c.toJson())
  } as IJsonNode;
}

// REQUIRED
toJson(): JsonNode {
  const json: Record<string, unknown> = {
    type: this.type,
    children: A.map(this.children, c => c.toJson())
  };
  return S.decodeUnknownSync(JsonNode)(json);
}
```

**Detection**: Search for `toJson` methods, verify Schema validation

**Fix Agent**: effect-schema-expert

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | All toJson() use Schema validation |
| 3 | Some toJson() lack validation |
| 5 | No toJson() use Schema validation |

---

#### 4.2 JSON.parse Without Validation
**Severity**: Critical

```typescript
// VIOLATION
const data = JSON.parse(input) as Config;

// REQUIRED
const data = pipe(
  S.decodeUnknownEither(ConfigSchema)(JSON.parse(input)),
  Either.getOrThrow
);
```

**Detection**: Search `JSON\.parse`

**Fix Agent**: effect-schema-expert

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | All JSON.parse validated |
| 3 | Some unvalidated |
| 5 | No validation |

---

### 5. Exhaustiveness

#### 5.1 Non-exhaustive Switch
**Severity**: High

```typescript
// VIOLATION
switch (action.type) {
  case "ADD": return handleAdd();
  case "REMOVE": return handleRemove();
  default: return state; // Silently ignores new cases
}

// REQUIRED
switch (action.type) {
  case "ADD": return handleAdd();
  case "REMOVE": return handleRemove();
  default: assertNever(action.type);
}
```

**Detection**: Search for switch statements, verify exhaustiveness

**Fix Agent**: effect-predicate-master

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | All switches exhaustive |
| 2 | Some non-exhaustive with safe defaults |
| 4 | Non-exhaustive with silent failures |

---

#### 5.2 Discriminated Union Without Match
**Severity**: Medium

```typescript
// ACCEPTABLE but less safe
if (node.type === "tab") {
  // handle tab
} else if (node.type === "tabset") {
  // handle tabset
}

// PREFERRED
pipe(
  Match.value(node),
  Match.when({ type: "tab" }, handleTab),
  Match.when({ type: "tabset" }, handleTabset),
  Match.exhaustive
);
```

**Detection**: Manual review of union type handling

**Fix Agent**: effect-predicate-master

---

### 6. Mutation Safety

#### 6.1 Mutation of Readonly Properties
**Severity**: Critical

```typescript
// VIOLATION
const obj: Readonly<Config> = getConfig();
obj.value = "new"; // TypeScript error, but may be cast away

// Detection
(obj as any).value = "new"; // Bypassing readonly
```

**Detection**: Search for mutations to readonly types, especially after casts

**Fix Agent**: effect-schema-expert

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No readonly violations |
| 3 | Isolated mutations with casts |
| 5 | Systemic readonly bypassing |

---

### 7. Error Handling

#### 7.1 Empty Catch Blocks
**Severity**: High

```typescript
// VIOLATION
try {
  doSomething();
} catch (e) {
  // Silent failure
}

// REQUIRED
try {
  doSomething();
} catch (e) {
  Effect.logError("Operation failed", { error: e });
  throw e; // or handle appropriately
}
```

**Detection**: Search `catch\s*\([^)]*\)\s*\{\s*\}`

**Fix Agent**: effect-researcher (for appropriate handling pattern)

**Evaluation**:
| Score | Criteria |
|-------|----------|
| 0 | No empty catch blocks |
| 2 | Some empty catches in non-critical paths |
| 4 | Empty catches in critical paths |

---

## File-Level Scoring

### Aggregate Score Calculation

```
File Score = (Critical × 5) + (High × 3) + (Medium × 1) + (Low × 0.5)
```

### Priority Classification

| Score Range | Priority | Action |
|-------------|----------|--------|
| 0-5 | Low | Fix when convenient |
| 6-15 | Medium | Include in batch |
| 16-30 | High | Prioritize in batch |
| 31+ | Critical | Fix immediately |

---

## Verification Criteria

After fixing a file, verify:

1. **Type Check**: `bun run check` passes
2. **Build**: `bun run build` passes
3. **No Regressions**: Existing functionality preserved
4. **Pattern Compliance**:
   - [ ] No `any` remaining
   - [ ] No native array/string methods
   - [ ] All optional access guarded
   - [ ] Serialization validated

---

## Architectural Observations

> **Purpose**: While auditing for type safety, agents should also identify opportunities for architectural improvements. These observations feed into a future refactoring spec.

### Observation Categories

#### A1. Composition Over Inheritance
**Description**: Identify class hierarchies that could benefit from composition patterns.

**Signals**:
- Deep inheritance chains (3+ levels)
- Classes that inherit primarily to reuse code, not for polymorphism
- Protected methods that suggest tight coupling
- Classes overriding many parent methods

**Example Observation**:
```markdown
File: model/TabNode.ts:15
Pattern: Extends Node which extends BaseNode
Issue: 3-level inheritance chain for code reuse
Opportunity: Extract shared behavior into composable utilities/services
Complexity: High (affects many files)
```

#### A2. Discriminated Unions for Exhaustiveness
**Description**: Identify places where discriminated unions + pattern matching would improve type safety.

**Signals**:
- String literal type checks (`if (type === "tab")`)
- `instanceof` checks for polymorphism
- Switch statements on type fields without exhaustive checks
- Union types without discriminant properties

**Example Observation**:
```markdown
File: model/Model.ts:142
Pattern: switch(node.getType()) with string comparison
Issue: No compile-time exhaustiveness guarantee
Opportunity: Define NodeType as discriminated union, use Match.exhaustive
Complexity: Medium (localized change)
```

#### A3. Effect for Operations
**Description**: Identify opportunities to leverage Effect for better operations handling.

**Subcategories**:
| Area | Signals | Effect Pattern |
|------|---------|----------------|
| Error Handling | try/catch, error swallowing, error codes | `Effect.try`, `Effect.catchTag`, typed errors |
| Debugging | console.log, manual logging | `Effect.log*`, spans, annotations |
| Tracing | Ad-hoc timing, performance marks | `Effect.withSpan`, OpenTelemetry integration |
| Telemetry | Manual metrics, counters | Effect metrics, gauges |
| Concurrency | Promises, async/await, race conditions | `Effect.fork`, `Fiber`, `Deferred`, `Semaphore` |

**Example Observation**:
```markdown
File: view/Layout.tsx:89
Pattern: try { await doLayout() } catch (e) { console.error(e) }
Issue: Error swallowed, no structured logging, no context
Opportunity: Effect.tryPromise with typed error, Effect.logError with context
Complexity: Medium
```

#### A4. Performance Opportunities
**Description**: Identify performance improvements possible during refactoring.

**Signals**:
- Repeated computations in render/hot paths
- Missing memoization opportunities
- Synchronous operations that could be lazy/deferred
- Large object copying that could use structural sharing
- N+1 patterns in loops

**Example Observation**:
```markdown
File: model/Model.ts:256
Pattern: children.map(c => c.toJson()).filter(c => c !== null)
Issue: Two iterations over children array
Opportunity: Use A.filterMap for single pass
Complexity: Low (localized optimization)
```

---

### Observation Logging

When analyzing each file, agents MUST log architectural observations to:
`specs/flexlayout-type-safety/outputs/ARCHITECTURAL_OBSERVATIONS.md`

**Entry Format**:
```markdown
### [FILE_NAME]

#### [Category]: [Brief Title]
- **Line(s)**: [LINE_NUMBERS]
- **Current Pattern**: [Description of current approach]
- **Issue**: [Why this is suboptimal]
- **Opportunity**: [What could be done instead]
- **Complexity**: Low / Medium / High
- **Dependencies**: [Other files/patterns affected]
- **Notes**: [Any additional context for synthesis]
```

**Scoring (for prioritization)**:
| Complexity | Impact | Priority |
|------------|--------|----------|
| Low | High | P1 - Quick wins |
| Medium | High | P2 - Strategic |
| High | High | P3 - Major refactor |
| Low | Low | P4 - Opportunistic |
| High | Low | P5 - Defer |

---

## False Positive Guidelines

### Acceptable Exceptions

1. **External library types**: When interfacing with external libraries that use `any`
2. **Type guards**: `any` in type guard implementations
3. **Test files**: More lenient in test code
4. **Generated code**: Skip auto-generated files

### Documentation Required

When an exception is made, add comment:

```typescript
// TYPE_SAFETY_EXCEPTION: [Reason]
// See: specs/flexlayout-type-safety/REFLECTION_LOG.md#[entry-id]
```
