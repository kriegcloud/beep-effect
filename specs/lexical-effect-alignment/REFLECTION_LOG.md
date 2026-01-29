# Reflection Log

> Cumulative learnings from the lexical-effect-alignment spec execution.

---

## Entry Template

```json
{
  "phase": "P[N]",
  "timestamp": "YYYY-MM-DD",
  "category": "discovery|execution|verification|handoff",
  "insight": "What was learned",
  "evidence": "Specific example or data",
  "action": "How to apply this learning"
}
```

---

## Phase Entries

### Phase 0: Scaffolding (Complete)

```json
{
  "phase": "P0",
  "timestamp": "2025-01-28",
  "category": "scaffolding",
  "insight": "Comprehensive dual handoff files required for all 11 phases at spec creation time",
  "evidence": "Initial spec-reviewer audit scored 3.2/5 due to missing handoff files for P2-P11",
  "action": "Always create complete handoff infrastructure during spec scaffolding, not incrementally"
}
```

```json
{
  "phase": "P0",
  "timestamp": "2025-01-28",
  "category": "scaffolding",
  "insight": "Templates directory with migration-checklist and verification-report templates improves agent output consistency",
  "evidence": "Spec guide requires outputs/ and templates/ directories for artifact storage",
  "action": "Include standardized templates for discovery outputs and verification reports"
}
```

```json
{
  "phase": "P0",
  "timestamp": "2025-01-28",
  "category": "scaffolding",
  "insight": "Measurable success criteria with zero-count targets enable automated verification",
  "evidence": "Vague criteria like 'appropriate Option usage' are not objectively verifiable",
  "action": "Define success as grep-verifiable zero counts for banned patterns"
}
```

### Phase 1: Array Migration

_Entries will be added after phase execution._

### Phase 2: String Methods Migration (Complete)

```json
{
  "phase": "P2",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Parallel discovery agents with targeted search patterns efficiently locate violations across large codebases",
  "evidence": "4 discovery agents found 41 violations across 18 files in apps/todox/src/app/lexical/ in first pass",
  "action": "Continue pattern of splitting discovery by method categories (case, slice, split, trimming) for parallelization"
}
```

```json
{
  "phase": "P2",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Effect String API uses data-last curried functions, not direct multi-argument calls",
  "evidence": "Code-writer agents generated Str.slice(str, 0, 5) causing 28 type errors. Correct pattern is Str.slice(0, 5)(str)",
  "action": "Add explicit Effect String API pattern examples to code-writer prompts: 'Use data-last curried style: Str.slice(start, end)(string) NOT Str.slice(string, start, end)'"
}
```

```json
{
  "phase": "P2",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Batch execution with 4-5 files per code-writer agent balances parallelism with context management",
  "evidence": "4 batches handled 18 files efficiently: Batch 1 (5 files), Batch 2 (5 files), Batch 3 (4 files), Batch 4 (4 files)",
  "action": "Maintain 4-5 files per agent batch for similar migration tasks"
}
```

```json
{
  "phase": "P2",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Type errors post-migration reveal API pattern misunderstandings that discovery phase cannot detect",
  "evidence": "28 type errors across 9 files after initial migration, all stemming from incorrect curried function usage",
  "action": "Always run 'bun run check --filter' immediately after code-writer execution, before marking phase complete"
}
```

```json
{
  "phase": "P2",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Dedicated package-error-fixer agent with access to type errors enables systematic remediation",
  "evidence": "Single package-error-fixer agent resolved all 28 errors by applying correct data-last curried patterns",
  "action": "Include error-fixer agent in workflow for migration tasks: Discovery → Execute → Check → Fix → Verify"
}
```

```json
{
  "phase": "P2",
  "timestamp": "2025-01-29",
  "category": "handoff",
  "insight": "Capturing API pattern misunderstandings prevents repeat failures in subsequent phases",
  "evidence": "Phase 2 learned data-last currying; Phase 3 (Object methods) can avoid same mistake",
  "action": "Update Phase 3 handoff to include: 'Effect Object/Struct API uses data-last currying: Struct.pick(keys)(obj) NOT Struct.pick(obj, keys)'"
}
```

### Phase 3: Set → HashSet/MutableHashSet Migration (Complete)

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Parallel discovery agents remain effective for targeted pattern searches even with smaller violation counts",
  "evidence": "4 discovery agents found 9 Set instances across 7 files in apps/todox/src/app/lexical/plugins/",
  "action": "Continue using parallel discovery pattern for all collection migrations regardless of expected count"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashSet.empty<T>() creates empty sets; MutableHashSet.make() requires at least one value argument",
  "evidence": "7 type errors from MutableHashSet.make<T>() calls without arguments. Correct: MutableHashSet.empty<T>()",
  "action": "Add to code-writer prompts: 'For empty MutableHashSets use .empty<T>(), NOT .make<T>()'"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashSet is directly iterable; no separate values() method exists",
  "evidence": "Migration attempted MutableHashSet.values(set) causing type errors. Correct pattern: for (const item of set)",
  "action": "Document iteration pattern: 'MutableHashSet implements Iterable protocol; use for...of directly, NOT .values()'"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "HashSet.make() for immutable constant sets requires direct value arguments, not array spread",
  "evidence": "HashSet.make('a', 'b', 'c') for DEPRECATED_TAGS lookup set works correctly",
  "action": "Use HashSet for immutable lookup tables; pass values directly to make()"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashSet mutation methods use data-first argument order unlike Effect's typical data-last style",
  "evidence": "Correct: MutableHashSet.add(set, value), MutableHashSet.remove(set, value), MutableHashSet.has(set, value)",
  "action": "Note exception to data-last pattern: MutableHashSet mutation API is data-first"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashSet.size is a function, not a property accessor",
  "evidence": "Must use MutableHashSet.size(set), NOT set.size",
  "action": "Include in migration checklist: 'Replace set.size with MutableHashSet.size(set)'"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Phase 3 Fix workflow validated: package-error-fixer agent resolved all 7 type errors in single pass",
  "evidence": "All empty<T>() API corrections applied successfully without manual intervention",
  "action": "Discovery → Execute → Check → Fix → Verify workflow is now standard pattern for collection migrations"
}
```

```json
{
  "phase": "P3",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Phase 3 completed faster than Phase 2 due to fewer files (7 vs 18) and clearer API patterns",
  "evidence": "Total time: ~9 minutes (Discovery: 2min, Migration: 5min, Fix: 2min) vs P2's longer duration",
  "action": "Smaller scopes with well-documented APIs reduce remediation cycles"
}
```

---

## Sub-Agent Performance Insights

Track agent performance patterns to improve prompts:

| Agent Type | Phase | Performance Notes | Prompt Improvements |
|------------|-------|-------------------|---------------------|
| Discovery (codebase-researcher) | P2 | 4 parallel agents found 41 violations efficiently; targeted grep patterns worked well | Continue splitting by method categories for parallelization |
| Code-writer | P2 | Generated incorrect Effect String API patterns (non-curried calls); 28 type errors resulted | Add explicit data-last curried examples: `Str.slice(0, 5)(str)` NOT `Str.slice(str, 0, 5)` |
| Package-error-fixer | P2 | Successfully resolved all 28 type errors by applying curried patterns | Well-suited for post-migration remediation; include in standard workflow |
| Discovery (codebase-researcher) | P3 | 4 parallel agents found 9 Set instances across 7 files; pattern remains effective for smaller scopes | Discovery agent parallelization scales down efficiently |
| Code-writer | P3 | Generated MutableHashSet.make<T>() without arguments causing 7 type errors; missed empty() API | Add: 'Empty MutableHashSets: use .empty<T>() NOT .make<T>()' and 'Iteration: for (const x of set) NOT .values()' |
| Package-error-fixer | P3 | Resolved all 7 type errors in single pass by replacing make<T>() with empty<T>() | Consistent success pattern; validates as standard remediation agent |
| Discovery (Explore) | P5 | 4 parallel agents found 13 Error violations across 11 files; discovered shared error schema patterns | Categorize error patterns by domain (node registration, context, etc.) for schema reuse |
| Code-writer | P5 | 11 agents (5+5+1 batches) executed cleanly; reused existing error schemas from errors.ts | Check existing schema files before creating new ones; leverage existing TaggedError patterns |
| Code-writer | P5 | Successfully used TaggedError for synchronous throws in React hooks | TaggedError works as drop-in for native Error in sync throw contexts |
| Discovery (Explore) | P6 | 4 parallel agents found 11 JSON violations across 6 files; good categorization by data shape | Group by serialization pattern (DOM attributes, drag data, config parsing) |
| Code-writer | P6 | 6 agents migrated JSON patterns to Effect Schema; 2 required fixes for type compatibility | Add S.mutable() and type assertion guidance to prompts |
| Code-writer | P6 | S.parseJson(schema) pattern adopted consistently across all migrations | Combined parse+validate is cleaner than separate JSON.parse + decode |
| Discovery (Explore) | P7 | 4 parallel agents found Promise patterns concentrated in A-F plugins; G-Z already migrated | Focus discovery on early-alphabet plugins and nodes for Promise patterns |
| Code-writer | P7 | 9 agents (5+4 batches) executed cleanly; zero type errors post-migration | Effect.async, Effect.tryPromise patterns well-established in prompts |
| Code-writer | P7 | Successfully converted new Promise() to Effect.async() with cleanup | Include cleanup function pattern in Effect.async for setTimeout |
| Discovery (Explore) | P8 | 4 parallel agents found 18 regex patterns across 12 files; clear categorization by method type | Categorize by .match()/.test()/.exec() for targeted migration strategies |
| Code-writer | P8 | 12 agents (5+4+3 batches) executed cleanly; 1 API signature error | Emphasize curried data-last: Str.match(regex)(str) NOT Str.match(str, regex) |
| Code-writer | P8 | EmojiPickerPlugin also fixed pre-existing logic bug in filter | Code-writers may opportunistically fix adjacent issues |
| Code-writer | P8 | ColorPicker used Str.matchAll with A.fromIterable for global regex | Global regex pattern: Str.matchAll(regex)(str) with A.fromIterable() |
| Discovery (Explore) | P9 | 4 parallel agents scanned 100+ files; found 7 switches in 6 plugin files; nodes/utils clean | Switch patterns concentrate in plugins/; utility directories already compliant |
| Code-writer | P9 | 5 agents migrated 7 switches including nested switch(true) patterns; zero type errors | Match.value().pipe() with Match.when() handles all switch patterns |
| Code-writer | P9 | ToolbarPlugin complex nested switches converted to predicate Match.when | switch(true): use Match.when((val) => predicate(val), () => result) |
| Code-writer | P9 | AiAssistantPlugin used Match.exhaustive for compile-time exhaustiveness | Use Match.exhaustive when all discriminant values known |
| Discovery (Explore) | P10 | 4 parallel agents found ~45 Date patterns across 7 files; concentrated in DateTimeNode and date plugins | DateTime patterns cluster around date-focused features |
| Code-writer | P10 | Direct orchestrator migration handled complex interdependencies; UI library boundary conversions required | Complex migrations with UI library boundaries handled directly, not via parallel agents |
| Code-writer | P10 | DateTime.startOf("day") not startOfDay; curried API pattern continues | Check Effect API docs for exact function names; curried style applies to DateTime |
| Code-writer | P10 | react-day-picker requires JS Date at boundaries; convert DateTime.Utc ↔ Date with toJsDate/fromJsDate helpers | Create boundary conversion helpers for UI library integration |
| Code-writer | P10 | Lexical createState parse() receives unknown; O.getOrThrow on failed parse causes runtime crash | Use O.getOrElse with safe fallback for state parse functions; validate input with P.isString |

---

## Pattern Candidates

Patterns scoring 75+ should be promoted to registry:

| Pattern | Score | Status | Destination |
|---------|-------|--------|-------------|
| Parallel discovery with targeted grep patterns | 85 | Validated (P2, P3, P5) | `specs/_guide/PATTERN_REGISTRY.md` - Discovery Patterns |
| Discovery → Execute → Check → Fix → Verify workflow | 90 | Validated (P2, P3, P5) | `specs/_guide/PATTERN_REGISTRY.md` - Execution Patterns |
| Data-last curried API migration pattern | 80 | Validated (P2) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| MutableHashSet empty/make distinction pattern | 75 | Validated (P3) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| MutableHashSet data-first mutation API exception | 75 | Validated (P3) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| MutableHashMap empty/make/fromIterable distinction | 80 | Validated (P4) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| HashMap.fromIterable with as const for typed entries | 85 | Validated (P4) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| TaggedError for synchronous React hook throws | 80 | Validated (P5) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| SPECIAL CASE documentation for framework callbacks | 85 | Validated (P5) | `specs/_guide/PATTERN_REGISTRY.md` - Execution Patterns |
| Schema reuse via centralized errors.ts file | 75 | Validated (P5) | `documentation/patterns/` |
| S.parseJson(schema) for combined JSON parse+validate | 90 | Validated (P6) | `.claude/rules/effect-patterns.md` - Schema Type Selection |
| S.mutable() wrapper for mutable array/object schemas | 85 | Validated (P6) | `.claude/rules/effect-patterns.md` - Schema Type Selection |
| Type assertions after S.Unknown for external library types | 80 | Validated (P6) | `documentation/patterns/` |
| Effect.async() with cleanup function for timeouts | 90 | Validated (P7) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| Remove async wrapper around runPromise in React callbacks | 85 | Validated (P7) | `documentation/patterns/` |
| Dynamic import in useEffect with mounted flag cleanup | 85 | Validated (P7) | `documentation/patterns/` |
| Browser API Promise → Effect.tryPromise in Effect.gen | 80 | Validated (P7) | `documentation/patterns/` |
| Str.match(regex)(str) data-last curried for regex operations | 90 | Validated (P8) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| O.isSome(Str.match(regex)(str)) for boolean test replacement | 85 | Validated (P8) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| Str.matchAll(regex)(str) with A.fromIterable for global patterns | 80 | Validated (P8) | `.claude/rules/effect-patterns.md` - Effect Collections Quick Reference |
| Cache dynamic RegExp outside loops for performance | 75 | Validated (P8) | `documentation/patterns/` |
| Match.value().pipe(Match.when()) for switch replacement | 90 | Validated (P9) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| Match.when with predicate functions for switch(true) | 85 | Validated (P9) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| Match.exhaustive for complete discriminated unions | 80 | Validated (P9) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| Match.orElse(() => {}) for effectful default cases | 75 | Validated (P9) | `documentation/patterns/` |
| DateTime.unsafeNow() for synchronous current time in React | 85 | Validated (P10) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| DateTime.startOf("day")(dt) curried API for start-of-day | 80 | Validated (P10) | `.claude/rules/effect-patterns.md` - NEVER Patterns section |
| UI boundary conversion helpers for DateTime.Utc ↔ JS Date | 90 | Validated (P10) | `documentation/patterns/` |
| O.filter with P.isString for safe unknown→string validation | 85 | Validated (P10) | `.claude/rules/effect-patterns.md` - Option patterns |
| O.getOrElse over O.getOrThrow in Lexical state parse functions | 95 | Validated (P10) | `documentation/patterns/` - CRITICAL: prevents runtime crashes |
| --filter=@beep/todox for isolated quality checks | 90 | Validated (P10) | `.claude/rules/general.md` - Turborepo Verification |

---

## Phase 4: Map → HashMap/MutableHashMap Migration (Complete)

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Native Map usage concentrated in plugins/ directory; many other directories already Effect-compliant or use external library Maps",
  "evidence": "5 files required migration; 8 files excluded (Yjs YMap, WeakMap, URLSearchParams, framework-provided Maps)",
  "action": "During discovery, categorize exclusions (library integration, justified native usage) to reduce false positives"
}
```

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "HashMap.make() for immutable maps expects entry arguments directly, not type parameters with entries",
  "evidence": "HashMap.make<K, V>(entries...) caused 4 type errors. Correct: HashMap.fromIterable([entries]) with as const",
  "action": "Add to code-writer prompts: 'Immutable HashMap from entries: HashMap.fromIterable([...entries]) with as const tuples'"
}
```

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashMap.empty<K, V>() creates empty maps; same pattern as MutableHashSet.empty<T>()",
  "evidence": "Code-writers correctly applied empty<K, V>() pattern from P3 learnings",
  "action": "P3 learnings successfully transferred: empty() for empty collections is consistent across MutableHash* types"
}
```

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashMap.get() returns Option<V>; callers must use O.getOrUndefined() or O.match() for value extraction",
  "evidence": "All 5 migrations correctly wrapped get() calls with Option handling",
  "action": "Pattern established: MutableHashMap.get() always returns Option, never raw value"
}
```

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "MutableHashMap.remove() replaces native Map.delete(); no clear() method exists",
  "evidence": "TableScrollShadowPlugin required let binding to reassign empty map for clear behavior",
  "action": "Add to migration checklist: '.delete() → MutableHashMap.remove(); .clear() → reassign empty map'"
}
```

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "React useMemo with mutable Effect collections should be replaced with useRef",
  "evidence": "CommentPlugin markNodeMap changed from useMemo(() => new Map()) to useRef(MutableHashMap.empty())",
  "action": "Add to patterns: 'Mutable Effect collections in React: use useRef not useMemo for stable reference'"
}
```

```json
{
  "phase": "P4",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Package-error-fixer agent continues to excel at post-migration type error resolution",
  "evidence": "Resolved 5 type errors (4 HashMap API, 1 null-check) in single pass",
  "action": "Discovery → Execute → Check → Fix → Verify workflow validated for 3rd consecutive phase"
}
```

### Phase 5: Native Error → TaggedError Migration (Complete)

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Native Error patterns concentrate in plugin initialization (node registration) and React context hooks",
  "evidence": "13 violations found: 6 NodeNotRegisteredError patterns, 4 MissingContextError patterns, 2 EquationRenderError, 1 DragSelectionError",
  "action": "Group similar error patterns for shared schema design before migration"
}
```

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Lexical framework callbacks (onError in initialConfig) require native throws for framework compatibility",
  "evidence": "CommentPlugin/index.tsx line 137 rethrows for LexicalErrorBoundary - cannot use Effect.fail()",
  "action": "Document SPECIAL CASE callbacks that must preserve native throw for framework integration"
}
```

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Shared error schemas in lexical/schema/errors.ts already existed with Effect TaggedError patterns",
  "evidence": "Found NodeNotRegisteredError, MissingContextError pre-defined; only needed to add EquationRenderError, DragSelectionError",
  "action": "Check existing error schema files before creating new ones; extend existing patterns"
}
```

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "TaggedError schemas throw synchronously - preserves React hook error propagation behavior",
  "evidence": "All 11 effect-code-writer agents successfully replaced throw new Error() with throw new TaggedError()",
  "action": "For React hooks that must throw synchronously, TaggedError works as drop-in replacement"
}
```

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "11 parallel code-writer agents executed efficiently across two batches (5+5+1)",
  "evidence": "All agents completed within 2 minutes; no conflicts on shared errors.ts file",
  "action": "Batching 5 agents at a time prevents resource contention while maximizing parallelism"
}
```

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Pre-existing build errors (asChild prop types) do not indicate P5 regression",
  "evidence": "Build failed on AiToolbarButton.tsx asChild error - unmodified file with pre-existing issue",
  "action": "Filter verification output for P5-modified files specifically when pre-existing errors present"
}
```

```json
{
  "phase": "P5",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Zero type errors in P5-modified files validates clean migration",
  "evidence": "grep for modified files in tsc output returned empty - no errors in EquationComponent, EmojisPlugin, etc.",
  "action": "Target verification: grep tsc output for modified file names before declaring success"
}
```

### Phase 6: JSON.parse/stringify → Effect Schema Migration (Complete)

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "JSON.parse/stringify concentrated in node serialization and drag-drop data transfer",
  "evidence": "11 violations across 6 files: PollNode (3), ExcalidrawComponent (2), DateTimeNode (2), ExcalidrawPlugin (1), ImagesPlugin (2), setupEnv (1)",
  "action": "Focus discovery on DOM conversion methods, setData/getData patterns, and useMemo data parsing"
}
```

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "S.parseJson(schema) combines JSON parsing and schema validation into single operation",
  "evidence": "All migrations replaced Either.try(() => JSON.parse(x)) with S.decodeUnknownEither(S.parseJson(Schema))(x)",
  "action": "Add to code-writer prompts: 'Use S.parseJson(schema) with decodeUnknownEither for combined parse+validate'"
}
```

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "S.Unknown returns unknown type - requires type assertions for external library types",
  "evidence": "ExcalidrawComponent had 9 type errors from S.Unknown fields; fixed with explicit type assertions after schema decode",
  "action": "When integrating with external library types (Excalidraw, etc.), use type assertions after schema validation"
}
```

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "S.mutable() wrapper required for schemas that need to return mutable arrays/objects",
  "evidence": "PollNode had 2 type errors: 'readonly string[]' not assignable to 'string[]'. Fixed with S.mutable(S.Array(...))",
  "action": "Add to code-writer prompts: 'For mutable types, wrap with S.mutable(): S.mutable(S.Array(S.String))'"
}
```

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "JSON.stringify for equality comparison is anti-pattern; use structural comparison instead",
  "evidence": "PollNode line 87 used JSON.stringify(a) === JSON.stringify(b); replaced with explicit field comparison",
  "action": "Replace JSON.stringify equality with A.every(A.zip(...)) or Equal.equals() for structural comparison"
}
```

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Schema-based encoding via S.encodeUnknownEither replaces JSON.stringify with type validation",
  "evidence": "All stringify replacements use S.encodeUnknownEither(S.parseJson(Schema))(obj) with Either.getOrElse fallback",
  "action": "Encode pattern: S.encodeUnknownEither(S.parseJson(Schema))(obj) with appropriate fallback string"
}
```

```json
{
  "phase": "P6",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Type errors from S.Unknown and S.Array readonly are predictable and fixable with targeted patches",
  "evidence": "11 initial type errors resolved with 2 fix agents: ExcalidrawComponent (type assertions), PollNode (S.mutable)",
  "action": "Discovery → Execute → Check → Fix → Verify workflow validated for schema migrations"
}
```

### Phase 7: Promise-Based Code → Effect Runtime Migration (Complete)

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Promise patterns heavily concentrated in plugins/A-F range and nodes/; G-Z plugins already Effect-compliant",
  "evidence": "Batch 1 (nodes/, A-F): 11 files, 28 patterns. Batch 2 (G-M): 0 files. Batch 3 (N-Z): 0 files. Batch 4 (misc): 6 files",
  "action": "Early phases of Effect migration already covered most plugins; concentrate discovery on areas with external API integration"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "new Promise() constructor converts cleanly to Effect.async() with cleanup function for timeouts",
  "evidence": "AutocompletePlugin converted new Promise with setTimeout to Effect.async with clearTimeout cleanup",
  "action": "Pattern: Effect.async<T, E>((resume) => { const id = setTimeout(...); return Effect.sync(() => clearTimeout(id)); })"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": ".then() chains after Effect.runPromise should move inside Effect.gen or use Effect.tap",
  "evidence": "ActionsPlugin, ImageComponent: .then() callbacks moved inside Effect.gen or replaced with Effect.tap before runPromise",
  "action": "Keep all logic within Effect pipeline; avoid mixing .then() with runPromise"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Promise.resolve() wrapping sync values is anti-pattern; use Effect.succeed() directly",
  "evidence": "AutoEmbedPlugin used Effect.promise(() => Promise.resolve(result)); replaced with conditional Effect.succeed/tryPromise",
  "action": "Check if value is Promise before wrapping; use Effect.succeed for sync, Effect.tryPromise for async"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "async wrappers around runPromise in React callbacks are unnecessary overhead",
  "evidence": "CopyButton, PrettierButton, TweetNode: removed async/await wrappers around runPromise since callbacks don't need Promise return",
  "action": "React onClick handlers expect void, not Promise<void>; remove async wrapper when all error handling is inside Effect"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Dynamic imports in useEffect should use Effect.tryPromise with mounted flag for cleanup",
  "evidence": "EmojiPickerPlugin: added mounted flag and cleanup function to prevent state updates on unmounted component",
  "action": "Pattern: let mounted = true; F.pipe(Effect.tryPromise(...), Effect.tap(() => mounted && setState(...))); return () => mounted = false"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Browser clipboard API requires Effect.tryPromise with proper error mapping for ContextMenu handlers",
  "evidence": "ContextMenuPlugin: navigator.clipboard.read() chains converted to Effect.gen with yield* Effect.tryPromise",
  "action": "Clipboard API returns Promises; wrap in Effect.tryPromise inside Effect.gen for sequential operations"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Pre-existing unused import errors surface during check but don't indicate P7 regression",
  "evidence": "COLLABORATION_TAG unused in CommentPlugin - pre-existing issue fixed as part of verification",
  "action": "Fix unrelated errors during verification to maintain clean builds across phases"
}
```

```json
{
  "phase": "P7",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "P7 completed with zero new type errors; all migrations compiled cleanly",
  "evidence": "bun run check --filter @beep/todox passed after all 9 file migrations",
  "action": "Discovery → Execute → Verify workflow validated for Promise→Effect migrations without Fix phase"
}
```

### Phase 8: Raw Regex → effect/String Migration (Complete)

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Raw regex patterns distribute across match/test/exec usage types with clear migration paths",
  "evidence": "18 patterns found: 5 .match(), 6 .test(), 7 .exec() across 12 files",
  "action": "Categorize regex patterns by method type to determine appropriate Effect replacement"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Str.match() uses curried data-last signature: Str.match(regex)(string), NOT Str.match(string, regex)",
  "evidence": "TableHoverActionsPlugin generated with wrong argument order causing 2 type errors",
  "action": "Always use curried form: Str.match(/pattern/)(str), consistent with other Effect String APIs"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Str.match returns Option<RegExpMatchArray>; use O.isSome() for boolean test replacement",
  "evidence": "All /regex/.test(str) patterns converted to O.isSome(Str.match(/regex/)(str))",
  "action": "Pattern: /regex/.test(str) → O.isSome(Str.match(/regex/)(str))"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "regex.exec(str) and str.match(regex) both convert to Str.match(regex)(str) returning Option",
  "evidence": "7 .exec() patterns and 5 .match() patterns all converted to Str.match with Option handling",
  "action": "Both native regex methods map to single Effect pattern: Str.match(regex)(str)"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Str.matchAll for global regex with iteration; returns IterableIterator<RegExpMatchArray>",
  "evidence": "ColorPicker converted .match(/.{2}/g) to Str.matchAll with A.fromIterable for array conversion",
  "action": "Global regex patterns: Str.matchAll(/pattern/g)(str) with A.fromIterable() for Array"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Dynamic regex from new RegExp() works with Str.match; cache regex outside loops for performance",
  "evidence": "EmojiPickerPlugin cached RegExp creation outside filter loop for performance optimization",
  "action": "When using dynamic regex in loops, create once outside loop and pass to Str.match"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Single type error from incorrect curried call syntax; all other migrations compiled cleanly",
  "evidence": "1 error in TableHoverActionsPlugin fixed manually; 11 other files passed immediately",
  "action": "Post-execution check identified single API usage error; quick manual fix"
}
```

```json
{
  "phase": "P8",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "P8 completed with 12 files migrated, 18 patterns replaced; workflow validated",
  "evidence": "bun run check --filter @beep/todox passed; lint check on all 12 files passed",
  "action": "Discovery → Execute → Check → Fix → Verify workflow validated for regex migrations"
}
```

### Phase 9: Switch → Match Migration (Complete)

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Switch statements concentrated in plugins/; nodes/ and utility directories are switch-free",
  "evidence": "7 switches found in 6 plugin files; Batch 2 (G-M plugins) and Batch 4 (commenting/context/hooks/ui/utils) had zero switches",
  "action": "Focus switch discovery on plugins/ directory; other directories already Effect-compliant"
}
```

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Match.value().pipe() with Match.when() cleanly replaces switch statements with value discrimination",
  "evidence": "All 7 switches successfully converted: 4 simple string/number discriminants, 2 in TestRecorderPlugin, 1 complex nested",
  "action": "Pattern: switch(x) { case 'a': ... } → Match.value(x).pipe(Match.when('a', () => ...), Match.orElse(...))"
}
```

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "switch(true) anti-pattern with boolean predicates converts to Match.when with predicate functions",
  "evidence": "ToolbarPlugin/utils.ts had 2 nested switch(true) with range predicates; converted to Match.when((size) => size >= X, ...)",
  "action": "switch(true) patterns: use Match.when((val) => predicate(val), () => result)"
}
```

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Match.exhaustive provides compile-time exhaustiveness checking for known discriminated unions",
  "evidence": "AiAssistantPlugin/insertAiText.ts used Match.exhaustive since InsertionMode type has exactly 3 literals",
  "action": "Use Match.exhaustive when all cases are known; use Match.orElse() when default handler needed"
}
```

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Effectful switches (mutations, side effects) work naturally with Match; handler functions execute immediately",
  "evidence": "CodeActionMenuPlugin and TableHoverActionsPlugin mutation listeners converted with MutableHashSet.add/remove in handlers",
  "action": "Match works for both pure and effectful switches; no special handling needed"
}
```

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "P9 completed with zero type errors; 7 switches across 6 files migrated cleanly",
  "evidence": "bun run build passed; bun run check passed; lint:fix formatted 2 files",
  "action": "Discovery → Execute → Check → Verify workflow validated for switch migrations"
}
```

```json
{
  "phase": "P9",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "5 parallel code-writer agents with clear file assignments maximizes throughput",
  "evidence": "All 5 agents completed within 2 minutes; complex ToolbarPlugin and simple mutation listeners handled equally well",
  "action": "Continue parallel agent deployment for migration tasks; batch by complexity not just count"
}
```

### Phase 10: Native Date → effect/DateTime Migration (Complete)

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "discovery",
  "insight": "Native Date patterns concentrated in date-focused features: DateTimeNode, DateTimeComponent, date plugins",
  "evidence": "~45 violations found across 7 files; DateTimeNode/DateTimeComponent had majority; date picker plugins had insertion points",
  "action": "DateTime migration targets predictably cluster around date-related feature directories"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "DateTime.startOf('day') uses curried API, not DateTime.startOfDay; consistent with Effect's data-last style",
  "evidence": "Initial build failed with 'Export startOfDay doesn't exist'; replaced with DateTime.startOf('day')(dt)",
  "action": "Always verify Effect API names in documentation; curried pattern extends to DateTime module"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "UI libraries (react-day-picker) require JS Date at component boundaries; create explicit conversion helpers",
  "evidence": "DateTimeComponent needed toJsDate() and fromJsDate() wrappers for react-day-picker Calendar component",
  "action": "Pattern: const toJsDate = (dt: DateTime.Utc) => new Date(DateTime.toEpochMillis(dt))"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "DateTime.unsafeNow() provides synchronous current time for React callbacks; DateTime.now for Effect contexts",
  "evidence": "ComponentPickerPlugin and ToolbarPlugin use DateTime.unsafeNow() in onClick handlers",
  "action": "React event handlers: DateTime.unsafeNow(); Effect pipelines: DateTime.now"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "execution",
  "insight": "Lexical createState parse() receives unknown type; must validate with P.isString before DateTime.make",
  "evidence": "Runtime crash: O.getOrThrow called on None when parse received undefined during module initialization",
  "action": "CRITICAL: Use O.filter(O.some(v), P.isString) then DateTime.make(s), never cast unknown as string"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Quality checks should use --filter=@beep/todox to prevent failures from unrelated package errors",
  "evidence": "bun run lint:fix failed on @beep/ui-editor (unrelated); bun run check --filter=@beep/todox passed",
  "action": "Always filter quality checks to target package when other packages have pre-existing errors"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "verification",
  "insight": "Complex interdependent migrations (DateTimeNode/DateTimeComponent) benefit from orchestrator-direct handling",
  "evidence": "UI boundary conversions and state serialization tightly coupled; parallel agents would conflict",
  "action": "When files have mutual dependencies, handle directly rather than delegating to parallel agents"
}
```

```json
{
  "phase": "P10",
  "timestamp": "2025-01-29",
  "category": "handoff",
  "insight": "O.getOrElse provides graceful fallback for parse failures; O.getOrThrow causes runtime crashes",
  "evidence": "dateTimeState parse function crashed on module load until fixed with O.getOrElse fallback",
  "action": "CRITICAL: Never use O.getOrThrow in Lexical state parse functions; always O.getOrElse with safe default"
}
```
