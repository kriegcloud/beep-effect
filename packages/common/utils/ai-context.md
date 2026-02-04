---
path: packages/common/utils
summary: Pure runtime helpers for data manipulation, guards, and factories - Effect-friendly
tags: [utils, common, helpers, effect, pure-functions]
---

# @beep/utils

Pure, deterministic runtime helpers shared across slices. Provides string normalization, record transforms, guards, and factories that run identically in Node, Bun, or browser environments.

## Architecture

```
@beep/utils
    |
    +-- data/           DataUtils namespace (Array, Model, Object, Record, Str, Struct, Tuple)
    |
    +-- guards/         Type-narrowing predicates
    |
    +-- factories/      Enum derivation helpers
    |
    +-- transformations/  Higher-level transforms
    |
    +-- timing/         Debounce, throttle
    |
    +-- equality/       Deep equality checks
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `ArrayUtils` | Array operations: `orderBy`, `collect`, sorting |
| `RecordUtils` | Record transforms: `recordKeys`, `recordStringValues`, `reverseRecord` |
| `StrUtils` | String normalization, `getNameInitials`, nested value access |
| `ObjectUtils` | Deep merge, clone, omit operations |
| `TupleUtils` | Tuple utilities, `makeMappedEnum` |
| `guards/` | `isUnsafeProperty`, `isNonEmptyRecord` predicates |
| `noOps` | Canonical `noOp`, `nullOp`, `nullOpE` placeholders |
| `timing/` | `debounce`, `throttle` helpers |

## Usage Patterns

### String Normalization
```typescript
import { StrUtils, RecordUtils } from "@beep/utils";
import * as F from "effect/Function";
import * as Str from "effect/String";

const normalized = StrUtils.normalizeString("Cafe de Flore");
const slug = F.pipe(normalized, Str.replace(/ /g, "-"));
```

### Schema Literal Extraction
```typescript
import { RecordUtils } from "@beep/utils";

const mimeTypes = RecordUtils.recordStringValues({
  json: "application/json",
  zip: "application/zip",
} as const);
```

### Safe Nested Access
```typescript
import { StrUtils } from "@beep/utils";

const value = StrUtils.getNestedValue(
  { items: [{ product: { name: "Widget" } }] },
  "items.[0].product.name"
);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Pure functions only | Ensures identical behavior across Node, Bun, browser |
| Effect namespace imports | Bans native `.map`, `.filter` for consistency |
| Domain-neutral helpers | Business logic belongs in owning slice |
| `Option`/`Either` returns | Avoids throwing; `@beep/invariant` for programming errors |

## Dependencies

**Internal**: `@beep/identity`, `@beep/invariant`, `@beep/types`
**External**: `effect`, `@effect/platform`, `mutative`

## Related

- **AGENTS.md** - Detailed contributor guidance and module map
- **@beep/types** - Compile-time type utilities
- **@beep/invariant** - Runtime assertions
