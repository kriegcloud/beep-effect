# Agent Context Index

> Navigation hub for AI agents working with Effect in the beep-effect codebase.

---

## Quick Start

New to this codebase? Start with these essential modules:

| Priority | Module | Context File | Purpose |
|----------|--------|--------------|---------|
| 1 | Effect | [effect/Effect.md](effect/Effect.md) | Core Effect type, generators, error handling |
| 2 | Schema | [effect/Schema.md](effect/Schema.md) | Domain modeling, validation, EntityIds |
| 3 | Layer | [effect/Layer.md](effect/Layer.md) | Service composition, dependency injection |
| 4 | Context | [effect/Context.md](effect/Context.md) | Service tags, capability patterns |

---

## Effect Core Modules

### Tier 1 — Critical (Every file uses these)

| Module | Context | Import Convention | Primary Uses |
|--------|---------|-------------------|--------------|
| Effect | [Effect.md](effect/Effect.md) | `import * as Effect from "effect/Effect"` | Effect.gen, Effect.map, Effect.flatMap, Effect.catchTag |
| Schema | [Schema.md](effect/Schema.md) | `import * as S from "effect/Schema"` | S.Struct, S.TaggedError, domain models |
| Layer | [Layer.md](effect/Layer.md) | `import * as Layer from "effect/Layer"` | Layer.effect, Layer.mergeAll, Layer.provide |
| Context | [Context.md](effect/Context.md) | `import * as Context from "effect/Context"` | Context.Tag, service definitions |
| Function | [Function.md](effect/Function.md) | `import * as F from "effect/Function"` | F.pipe, F.flow, F.identity, F.dual |

### Tier 2 — Important (Most features use these)

| Module | Context | Import Convention | Primary Uses |
|--------|---------|-------------------|--------------|
| Array | [Array.md](effect/Array.md) | `import * as A from "effect/Array"` | A.map, A.filter, A.reduce, A.head |
| Option | [Option.md](effect/Option.md) | `import * as O from "effect/Option"` | O.fromNullable, O.map, O.getOrElse |
| Stream | [Stream.md](effect/Stream.md) | `import * as Stream from "effect/Stream"` | Streaming, async iteration |
| Either | [Either.md](effect/Either.md) | `import * as Either from "effect/Either"` | Result handling, validation |
| Match | [Match.md](effect/Match.md) | `import * as Match from "effect/Match"` | Pattern matching discriminated unions |
| Duration | [Duration.md](effect/Duration.md) | `import * as Duration from "effect/Duration"` | Duration.seconds, timeouts, scheduling |
| Data | [Data.md](effect/Data.md) | `import * as Data from "effect/Data"` | Data.TaggedError, Data.Class, structural equality |
| ParseResult | [ParseResult.md](effect/ParseResult.md) | `import * as ParseResult from "effect/ParseResult"` | Schema parsing, validation errors |
| Redacted | [Redacted.md](effect/Redacted.md) | `import * as Redacted from "effect/Redacted"` | Sensitive data, credential protection |
| HashMap | [HashMap.md](effect/HashMap.md) | `import * as HashMap from "effect/HashMap"` | Immutable hash maps, dictionary patterns |
| Config | [Config.md](effect/Config.md) | `import * as Config from "effect/Config"` | Configuration management, environment |
| Schedule | [Schedule.md](effect/Schedule.md) | `import * as Schedule from "effect/Schedule"` | Retry policies, recurring effects |

### Tier 3 — Common (Frequently used utilities)

| Module | Context | Import Convention | Primary Uses |
|--------|---------|-------------------|--------------|
| DateTime | [DateTime.md](effect/DateTime.md) | `import * as DateTime from "effect/DateTime"` | DateTime.now, time handling |
| String | [String.md](effect/String.md) | `import * as Str from "effect/String"` | Str.toLowerCase, Str.split |
| Struct | [Struct.md](effect/Struct.md) | `import * as Struct from "effect/Struct"` | Struct.entries, Struct.keys |
| Record | [Record.md](effect/Record.md) | `import * as Record from "effect/Record"` | Dictionary operations |
| Predicate | [Predicate.md](effect/Predicate.md) | `import * as P from "effect/Predicate"` | P.isString, P.isNullable, type guards |
| Cause | [Cause.md](effect/Cause.md) | `import * as Cause from "effect/Cause"` | Cause.pretty, error introspection |
| SchemaAST | [SchemaAST.md](effect/SchemaAST.md) | `import * as AST from "effect/SchemaAST"` | Schema internals, custom transformations |
| Order | [Order.md](effect/Order.md) | `import * as Order from "effect/Order"` | Ordering, sorting, comparisons |
| HashSet | [HashSet.md](effect/HashSet.md) | `import * as HashSet from "effect/HashSet"` | Immutable sets, membership testing |
| MutableHashMap | [MutableHashMap.md](effect/MutableHashMap.md) | `import * as MutableHashMap from "effect/MutableHashMap"` | Mutable maps, caching patterns |
| MutableHashSet | [MutableHashSet.md](effect/MutableHashSet.md) | `import * as MutableHashSet from "effect/MutableHashSet"` | Mutable sets, deduplication |
| Number | [Number.md](effect/Number.md) | `import * as Num from "effect/Number"` | Number utilities, safe operations |
| Encoding | [Encoding.md](effect/Encoding.md) | `import * as Encoding from "effect/Encoding"` | Base64, hex encoding/decoding |

---

## Platform Modules

Cross-platform services from `@effect/platform`.

| Service | Context | Purpose |
|---------|---------|---------|
| FileSystem | [platform/FileSystem.md](platform/FileSystem.md) | File/directory operations |
| HttpClient | [platform/HttpClient.md](platform/HttpClient.md) | HTTP requests |
| Command | [platform/Command.md](platform/Command.md) | Process execution |

---

## By Task

### "I need to..."

| Task | Start Here | Related |
|------|------------|---------|
| Create a domain model | [Schema.md](effect/Schema.md) | Context.md (service), Layer.md (composition) |
| Handle nullable values | [Option.md](effect/Option.md) | Array.md (A.head returns Option) |
| Match on discriminated unions | [Match.md](effect/Match.md) | Schema.md (TaggedError) |
| Transform arrays | [Array.md](effect/Array.md) | Stream.md (for large datasets) |
| Read/write files | [platform/FileSystem.md](platform/FileSystem.md) | Layer.md (providing FileSystem) |
| Make HTTP requests | [platform/HttpClient.md](platform/HttpClient.md) | Schema.md (response validation) |
| Execute shell commands | [platform/Command.md](platform/Command.md) | FileSystem.md (file operations) |
| Handle errors | [Effect.md](effect/Effect.md) | Schema.md (TaggedError) |
| Compose services | [Layer.md](effect/Layer.md) | Context.md (service tags) |
| Stream data | [Stream.md](effect/Stream.md) | Array.md (small datasets) |
| Handle validation errors | [ParseResult.md](effect/ParseResult.md) | Schema.md (S.decode) |
| Protect sensitive data | [Redacted.md](effect/Redacted.md) | Config.md (secrets) |
| Sort arrays | [Order.md](effect/Order.md) | Array.md (A.sort) |
| Implement retry logic | [Schedule.md](effect/Schedule.md) | Effect.md (Effect.retry) |
| Load configuration | [Config.md](effect/Config.md) | Layer.md (ConfigProvider) |
| Encode/decode data | [Encoding.md](effect/Encoding.md) | Schema.md (transformations) |
| Use immutable maps | [HashMap.md](effect/HashMap.md) | MutableHashMap.md (mutable variant) |
| Use immutable sets | [HashSet.md](effect/HashSet.md) | MutableHashSet.md (mutable variant) |

---

## Critical Codebase Rules

These rules are MANDATORY in beep-effect:

### NEVER Use Native JavaScript

| Native | Effect Replacement | Context File |
|--------|-------------------|--------------|
| `array.map()` | `A.map(array, fn)` | [Array.md](effect/Array.md) |
| `array.filter()` | `A.filter(array, fn)` | [Array.md](effect/Array.md) |
| `array.sort()` | `A.sort(array, Order.x)` | [Order.md](effect/Order.md) |
| `new Date()` | `DateTime.now` | [DateTime.md](effect/DateTime.md) |
| `string.toLowerCase()` | `Str.toLowerCase(string)` | [String.md](effect/String.md) |
| `Object.entries()` | `Struct.entries()` | [Struct.md](effect/Struct.md) |
| `typeof x === "string"` | `P.isString(x)` | [Predicate.md](effect/Predicate.md) |
| `switch (x)` | `Match.value(x)` | [Match.md](effect/Match.md) |
| `fs.readFileSync()` | `yield* fs.readFileString()` | [FileSystem.md](platform/FileSystem.md) |
| `fetch()` | `yield* client.get()` | [HttpClient.md](platform/HttpClient.md) |
| `new Map()` | `HashMap.make()` | [HashMap.md](effect/HashMap.md) |
| `new Set()` | `HashSet.make()` | [HashSet.md](effect/HashSet.md) |
| `btoa()`/`atob()` | `Encoding.encodeBase64()` | [Encoding.md](effect/Encoding.md) |
| `process.env.X` | `Config.string("X")` | [Config.md](effect/Config.md) |

### ALWAYS Use Branded EntityIds

```typescript
// FORBIDDEN
id: S.String

// REQUIRED
id: SharedEntityIds.UserId
```

See [Schema.md](effect/Schema.md) for EntityId patterns.

---

## Source Reference

Reference repositories are available at `.repos/`:

| Repository | Location | Purpose |
|------------|----------|---------|
| **Effect Core** | `.repos/effect/packages/effect/src/` | Core Effect library |
| **Effect Platform** | `.repos/effect/packages/platform/src/` | Cross-platform services |
| **Effect AI** | `.repos/effect/packages/ai/` | AI/LLM integrations |
| **better-auth** | `.repos/better-auth/` | Authentication patterns |
| **drizzle-orm** | `.repos/drizzle-orm/` | ORM and SQL patterns |
| **effect-ontology** | `.repos/effect-ontology/` | Knowledge graph patterns |
| **effect-claude-agent-sdk** | `.repos/effect-claude-agent-sdk/` | Claude agent SDK |

See [documentation/subtree-workflow.md](../documentation/subtree-workflow.md) for update procedures.

---

## Related Documentation

| Resource | Location | Purpose |
|----------|----------|---------|
| Effect Rules | `.claude/rules/effect-patterns.md` | Enforcement rules |
| Effect Patterns | `documentation/EFFECT_PATTERNS.md` | Pattern reference |
| Effect Skills | `.claude/skills/` | Interactive learning |
| Testing Patterns | `.claude/commands/patterns/effect-testing-patterns.md` | Test patterns |

---

## File Count Summary

| Category | Count | Files |
|----------|-------|-------|
| Tier 1 (Critical) | 5 | Effect, Schema, Layer, Context, Function |
| Tier 2 (Important) | 12 | Array, Option, Stream, Either, Match, Duration, Data, ParseResult, Redacted, HashMap, Config, Schedule |
| Tier 3 (Common) | 13 | DateTime, String, Struct, Record, Predicate, Cause, SchemaAST, Order, HashSet, MutableHashMap, MutableHashSet, Number, Encoding |
| Platform | 3 | FileSystem, HttpClient, Command |
| **Total** | **33** | — |
