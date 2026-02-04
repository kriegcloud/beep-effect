---
path: packages/customization/domain
summary: Effect SQL domain models for user preferences - hotkeys, personalization settings with typed IDs
tags: [customization, domain, effect-sql, model, user-preferences, hotkeys]
---

# @beep/customization-domain

Domain layer providing Effect SQL model definitions for user customization entities. Centralizes schema definitions using `M.Class` with `makeFields` for consistent audit columns, serving as the single source of truth for repositories and tables.

## Architecture

```
|----------------------|     |---------------------|
|   @beep/shared-domain| --> | makeFields factory  |
|----------------------|     |---------------------|
                                      |
                                      v
|----------------------|     |---------------------|
| CustomizationEntityIds| --> |  Entities.UserHotkey|
|----------------------|     |---------------------|
                                      |
              +---------------+-------+-------+
              |               |               |
              v               v               v
        |---------| |---------------| |--------------|
        | Tables  | | Repositories  | | Integration  |
        |---------| |---------------| | Tests        |
                                      |--------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Entities` | Namespace re-exporting all customization entity models |
| `Entities.UserHotkey.Model` | User keyboard shortcuts with `userId` and `shortcuts` JSON record |

## Usage Patterns

### Create UserHotkey Insert Payload

```typescript
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import { Entities } from "@beep/customization-domain";
import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";

const createHotkey = Effect.gen(function* () {
  const now = yield* DateTime.now;
  const nowDate = DateTime.toDate(now);

  return Entities.UserHotkey.Model.insert.make({
    id: CustomizationEntityIds.UserHotkeyId.create(),
    userId: SharedEntityIds.UserId.make("user_abc123"),
    shortcuts: { "ctrl+s": "save", "ctrl+z": "undo" },
    createdAt: nowDate,
    updatedAt: nowDate,
  });
});
```

### Access Model Utilities

```typescript
import { Entities } from "@beep/customization-domain";

// Static utilities via modelKit
const { decode, encode } = Entities.UserHotkey.Model.utils;
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `makeFields` for all entities | Ensures consistent audit columns (id, createdAt, updatedAt, version) across models |
| `Symbol.for` identifiers | Stable schema metadata across migrations and client serialization |
| `M.JsonFromString` for shortcuts | Type-safe JSON encoding/decoding with Effect Schema validation |
| `modelKit(Model)` pattern | Standardized utilities (.utils) for encode/decode operations |

## Dependencies

**Internal**: `@beep/shared-domain` (EntityIds, makeFields, modelKit)

**External**: `effect`, `@effect/sql`

## Related

- **AGENTS.md** - Detailed contributor guidance and testing patterns
- **@beep/customization-tables** - Drizzle table definitions derived from these models
- **@beep/customization-server** - Repository implementations using these entities
