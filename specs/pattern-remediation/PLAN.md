# Pattern Compliance Remediation Plan

> Generated: 2026-01-07
> Total Violations: ~285
> Estimated Effort: 25 packages, 80+ files

## Summary by Category

| Category | Count | Severity | Effort |
|----------|-------|----------|--------|
| Native Array Methods | ~95 | CRITICAL | High |
| Native String Methods | ~60 | CRITICAL | Medium |
| Native Date | ~35 | HIGH | Medium |
| Switch Statements | ~26 | HIGH | Medium |
| typeof/instanceof | ~85 | HIGH | Variable |
| Object Methods | ~15 | MEDIUM | Low |
| Inline No-ops | ~10 | MEDIUM | Low |
| Type Safety (`any`, `as any`) | ~45 | CRITICAL | High |

## Summary by Package

| Package | Violations | Priority |
|---------|------------|----------|
| @beep/ui-ui | ~60 | P1 |
| @beep/common-utils | ~45 | P1 |
| @beep/common-schema | ~40 | P1 |
| @beep/common-types | ~35 | P2 (documentation examples) |
| @beep/shared-server | ~25 | P1 |
| @beep/shared-domain | ~20 | P1 |
| @beep/common-contract | ~15 | P2 |
| @beep/shared-client | ~15 | P2 |
| @beep/common-errors | ~10 | P2 |
| @beep/common-mock | ~10 | P3 (mock data) |
| @beep/iam-server | ~8 | P2 |
| @beep/iam-client | ~8 | P2 |
| @beep/documents-server | ~6 | P2 |
| @beep/ui-core | ~8 | P2 |
| @beep/runtime-client | ~5 | P2 |
| Other packages | ~10 | P3 |

---

## Violations by Package

### @beep/ui-ui (packages/ui/ui)

#### Required Import Additions

Add these imports if not present:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as Match from "effect/Match"
import * as P from "effect/Predicate"
import * as DateTime from "effect/DateTime"
import { nullOp, noOp, nullOpE } from "@beep/utils"
```

#### Native Array Methods (~25 violations)

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:28` - `.map()` → `A.map`
  - Current: `.map(([block]) => block)`
  - Fix: `F.pipe(result, A.map(([block]) => block))`

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:49` - `.map()` → `A.map`
  - Current: `.map((index, i) => {...})`
  - Fix: `F.pipe(array, A.map((index, i) => {...}))`

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:46` - `Array.from(result).sort()` → `A.fromIterable` + `A.sort`
  - Current: `const indexes = Array.from(result).sort((a, b) => a - b)`
  - Fix: `const indexes = F.pipe(result, A.fromIterable, A.sort(Num.Order))`

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:66` - `.filter()` → `A.filter`
  - Current: `.filter((chunk) => chunk.length > 0)`
  - Fix: `F.pipe(chunks, A.filter((chunk) => chunk.length > 0))`

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:137` - `.find()` → `A.findFirst`
  - Current: `.parts.find((p: UnsafeTypes.UnsafeAny) => p.type === "text")`
  - Fix: `F.pipe(parts, A.findFirst((p) => p.type === "text"))`

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:284-294` - `Array.from({ length: ... })` → `A.makeBy`
  - Current: `Array.from({ length: chunkCount }, () => ({...}))`
  - Fix: `A.makeBy(chunkCount, () => ({...}))`

- [ ] `packages/ui/ui/src/services/zip.service.ts:19` - `.map()` → `A.map`
  - Current: `files.map((f) => ...)`
  - Fix: `F.pipe(files, A.map((f) => ...))`

- [ ] `packages/ui/ui/src/services/zip.service.ts:27` - `.map()` → `A.map`
  - Current: `A.chunksOf(fileFxs, 3).map((fxs) => ...)`
  - Fix: `F.pipe(A.chunksOf(fileFxs, 3), A.map((fxs) => ...))`

- [ ] `packages/ui/ui/src/organisms/table/use-table.ts:67-68` - `.includes()` / `.filter()` → Effect equivalents
  - Current: `selected.includes(inputValue)` / `selected.filter((value) => ...)`
  - Fix: `A.contains(selected, inputValue)` / `A.filter(selected, (value) => ...)`

- [ ] `packages/ui/ui/src/atoms/file-thumbnail/useFilePreview.ts:68` - `.map()` → `A.map`
  - Current: `files.map((file) => {...})`
  - Fix: `F.pipe(files, A.map((file) => {...}))`

- [ ] `packages/ui/ui/src/atoms/file-thumbnail/utils.ts:79` - `.flatMap()` / `.map()` → `A.flatMap` / `A.map`
  - Current: `Object.entries(FILE_FORMATS).flatMap(([format, exts]) => exts.map(...))`
  - Fix: `F.pipe(R.toEntries(FILE_FORMATS), A.flatMap(([format, exts]) => F.pipe(exts, A.map(...))))`

- [ ] `packages/ui/ui/src/inputs/otp-input/helpers.ts:3` - `Array.from()` → `A.makeBy`
  - Current: `Array.from({ length: range }, mapfn)`
  - Fix: `A.makeBy(range, mapfn)`

- [ ] `packages/ui/ui/src/inputs/otp-input/helpers.ts:7` - `.map()` → `A.map`
  - Current: `array.map((chipItem, index) => {...})`
  - Fix: `F.pipe(array, A.map((chipItem, index) => {...}))`

- [ ] `packages/ui/ui/src/inputs/otp-input/helpers.ts:63` - `.split()` → `Str.split`
  - Current: `string.split("")`
  - Fix: `Str.split("")(string)`

- [ ] `packages/ui/ui/src/layouts/component-layout/nav-config-components.ts:30,72,110` - `.map()` → `A.map`
  - Current: `["Colors", ...].map((name) => ...)`
  - Fix: `F.pipe(["Colors", ...], A.map((name) => ...))`

- [ ] `packages/ui/ui/src/layouts/components/searchbar/utils.ts:18` - `.forEach()` → `A.forEach`
  - Current: `navItems.forEach((navItem) => {...})`
  - Fix: `A.forEach(navItems, (navItem) => {...})`

- [ ] `packages/ui/ui/src/layouts/components/searchbar/utils.ts:20` - `.split()` → `Str.split`
  - Current: `currentGroup.split("-")`
  - Fix: `Str.split("-")(currentGroup)`

- [ ] `packages/ui/ui/src/layouts/components/searchbar/utils.ts:47-48` - `.filter()` / `.some()` / `.toLowerCase()` / `.includes()`
  - Current: `inputData.filter(... .some((field) => field?.toLowerCase().includes(query.toLowerCase())))`
  - Fix: Use Effect equivalents

- [ ] `packages/ui/ui/src/organisms/table/utils.ts:30` - `.split()` / `.reduce()` → Effect equivalents
  - Current: `key.split(".").reduce((acc, part) => acc?.[part], obj)`
  - Fix: Use `Str.split` and `A.reduce`

#### Native String Methods (~10 violations)

- [ ] `packages/ui/ui/src/lexical/mui/editor/utils/parseVideoUrl.ts:29` - `.split()` / `.map()` → `Str.split` / `A.map`
  - Current: `raw.split(":").map((p) => Number(p))`
  - Fix: `F.pipe(raw, Str.split(":"), A.map((p) => Number(p)))`

- [ ] `packages/ui/ui/src/lexical/mui/editor/utils/parseVideoUrl.ts:54-96` - Multiple `.split()` / `.filter()` / `.toLowerCase()`
  - Current: Various native string method calls
  - Fix: Use `Str.split`, `A.filter`, `Str.toLowerCase`

- [ ] `packages/ui/ui/src/lexical/mui/editor/utils/getThemeSelector.ts:12-13` - `.split()` / `.map()` → Effect equivalents
  - Current: `.split(/\s+/g).map((cls) => ...)`
  - Fix: `F.pipe(str, Str.split(/\s+/g), A.map((cls) => ...))`

- [ ] `packages/ui/ui/src/lexical/mui/editor/utils/joinClasses.ts:2` - `.filter()` / `.join()` → `A.filter` / `A.join`
  - Current: `args.filter(Boolean).join(" ")`
  - Fix: `F.pipe(args, A.filter(Boolean), A.join(" "))`

#### Native Date (~8 violations)

- [ ] `packages/ui/ui/src/components/editor/use-chat.ts:197,207` - `new Date()` → `DateTime.unsafeNow()`
  - Current: `createdAt: new Date()`
  - Fix: `createdAt: DateTime.unsafeNow()`

- [ ] `packages/ui/ui/src/atoms/file-thumbnail/utils.ts:172` - `new Date()` → `DateTime.unsafeMake`
  - Current: `new Date(file.lastModified)`
  - Fix: `DateTime.unsafeMake(file.lastModified)`

#### Switch Statements (~5 violations)

- [ ] `packages/ui/ui/src/layouts/dashboard/css-vars.ts:29` - `switch` → `Match.value`
  - Current: `switch (navColor) { ... }`
  - Fix: `Match.value(navColor).pipe(Match.when(...), Match.exhaustive)`

#### typeof/instanceof (~10 violations)

- [ ] `packages/ui/ui/src/routing/nav-section/utils/create-nav-item.ts:43` - `typeof icon === "string"` → `P.isString`
  - Current: `if (icon && render?.navIcon && typeof icon === "string")`
  - Fix: `if (icon && render?.navIcon && P.isString(icon))`

- [ ] `packages/ui/ui/src/atoms/file-thumbnail/useFilePreview.ts:21,25` - `instanceof File` / `typeof === "string"` → `P.isString`
  - Current: `if (file instanceof File)` / `else if (typeof file === "string")`
  - Fix: Use `P.isString` and appropriate predicates

---

### @beep/common-utils (packages/common/utils)

#### Required Import Additions

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as P from "effect/Predicate"
import * as DateTime from "effect/DateTime"
```

#### Native Array Methods (~15 violations)

- [ ] `packages/common/utils/src/data/record.utils.ts:83` - `Object.entries().map()` → Effect equivalents
  - Current: `Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]))`
  - Fix: `F.pipe(obj, R.toEntries, A.map(([key, value]) => [value, key]), R.fromEntries)`

- [ ] `packages/common/utils/src/data/string.utils.ts:50` - `.map()` → `A.map`
  - Current: `A.map((word) => word[0]?.toUpperCase() ?? "")`
  - [VERIFY] This appears to use A.map correctly

- [ ] `packages/common/utils/src/sqids.ts:619` - `.split()` → `Str.split`
  - Current: `s.split("")`
  - Fix: `Str.split("")(s)`

- [ ] `packages/common/utils/src/getters/getAt.ts:45-46` - `.split()` / `.filter()` → Effect equivalents
  - Current: `.split(".").filter(Boolean)`
  - Fix: `F.pipe(str, Str.split("."), A.filter(Boolean))`

- [ ] `packages/common/utils/src/data/object.utils/clone-deep.ts:89` - `Object.keys()` → `Struct.keys`
  - Current: `for (const key of Object.keys(value))`
  - Fix: `for (const key of Struct.keys(value))`

- [ ] `packages/common/utils/src/data/object.utils/merge-defined.ts:54` - `Object.keys()` → `Struct.keys`
  - Current: `[...Object.keys(source1), ...Object.keys(source2)]`
  - Fix: `[...Struct.keys(source1), ...Struct.keys(source2)]`

#### Native String Methods (~8 violations)

- [ ] `packages/common/utils/src/data/string.utils.ts:211` - `.split()` → `Str.split`
  - Current: `const parts = path.split(".")`
  - Fix: `const parts = Str.split(".")(path)`

- [ ] `packages/common/utils/src/data/string.utils.ts:216` - `.startsWith()` / `.endsWith()` → `Str.startsWith` / `Str.endsWith`
  - Current: `if (part.startsWith("[") && part.endsWith("]"))`
  - Fix: `if (Str.startsWith("[")(part) && Str.endsWith("]")(part))`

- [ ] `packages/common/utils/src/data/string.utils.ts:499-602` - Multiple native string methods
  - Current: Various `.endsWith()`, `.includes()`, `.toLowerCase()` calls
  - Fix: Convert to Effect String module equivalents

#### Native Date (~5 violations)

- [ ] `packages/common/utils/src/timing/debounce.ts:62` - `Date.now()` → `DateTime.unsafeNow()`
  - Current: `const defaultNow = () => Date.now()`
  - Fix: `const defaultNow = () => DateTime.toEpochMillis(DateTime.unsafeNow())`

- [ ] `packages/common/utils/src/format-time.ts:89` - `new Date()` → `DateTime.unsafeMake`
  - Current: `new Date(parts.year, parts.month - 1)`
  - Fix: Use DateTime construction

#### typeof/instanceof (~10 violations)

- [ ] `packages/common/utils/src/equality/deepEqual.ts:30` - `typeof value === "object"` → `P.isObject`
  - Current: `value !== null && (typeof value === "object" || typeof value === "function")`
  - Fix: `value !== null && (P.isObject(value) || P.isFunction(value))`

- [ ] `packages/common/utils/src/data/array.utils/order-by.ts:128-184` - Multiple `typeof` checks → `P.is*` predicates
  - Current: Various `typeof === "number"`, `typeof === "string"`, etc.
  - Fix: Use `P.isNumber`, `P.isString`, `P.isBigInt`, `P.isBoolean`, `P.isSymbol`

- [ ] `packages/common/utils/src/data/object.utils/clone-deep.ts:51-68` - `instanceof` checks → `P.is*` predicates
  - Current: `value instanceof Date`, `value instanceof RegExp`, etc.
  - Fix: `P.isDate(value)`, `P.isRegExp(value)`, etc.

---

### @beep/common-schema (packages/common/schema)

#### Required Import Additions

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as DateTime from "effect/DateTime"
import * as P from "effect/Predicate"
```

#### Native Array Methods (~12 violations)

- [ ] `packages/common/schema/src/internal/regex/regex.ts:31` - `.map()` in arbitrary → Effect equivalents
  - Current: `.map(() => new RegExp(...))`
  - [VERIFY] This is fc.map from fast-check, not native array

- [ ] `packages/common/schema/src/primitives/url/urlpath.ts:84-91` - `.map()` → `A.map`
  - Current: Various `.map()` calls for URL path construction
  - [VERIFY] Some may be fc.map from fast-check

- [ ] `packages/common/schema/src/primitives/json/json.ts:326,345` - `.map()` / `.join()` → Effect equivalents
  - Current: `A.map(...).join("")` / `?.map((part) => ...)`
  - Fix: Use `A.map` and `A.join`

- [ ] `packages/common/schema/src/primitives/currency/Currencies.ts:3546` - correctly uses `A.map`
  - [VALID] Already uses Effect

#### Native String Methods (~8 violations)

- [ ] `packages/common/schema/src/primitives/array.ts:63` - Uses `Str.split` correctly
  - [VALID] Already uses Effect

- [ ] `packages/common/schema/src/integrations/files/File.ts:378,644` - Uses `Str.split` correctly
  - [VALID] Already uses Effect

- [ ] `packages/common/schema/src/integrations/files/utils/compress-file-name.ts:12,15` - Native `.split()` / `Str.split` mix
  - Current: `fileName.split(".").pop()` - native
  - Fix: `F.pipe(fileName, Str.split("."), A.last)`

#### Native Date (~10 violations)

- [ ] `packages/common/schema/src/primitives/person/person-attributes.ts:270,273,281,283` - `Date.now()` / `new Date()`
  - Current: `value.getTime() <= Date.now()` / `ageOn(value, new Date())`
  - Fix: Use `DateTime.unsafeNow()` and `DateTime.toEpochMillis`

- [ ] `packages/common/schema/src/primitives/temporal/dates/date-time.ts:283,301,362,390,398` - `new Date()`
  - Current: Various `new Date()` constructions
  - [VERIFY] Some may be intentional for Date schema

- [ ] `packages/common/schema/src/primitives/temporal/dates/timestamp.ts:46-47` - `new Date()`
  - Current: `new Date(input).toISOString()`
  - [VERIFY] May be intentional for timestamp conversion

#### Switch Statements (~2 violations)

- [ ] `packages/common/schema/src/core/extended/extended-schemas.ts:417` - `switch (ast._tag)` → `Match.value`
  - Current: `switch (ast._tag) { ... }`
  - Fix: `Match.value(ast).pipe(Match.tag(...), Match.exhaustive)`

- [ ] `packages/common/schema/src/core/annotations/default.ts:572` - `switch (ast._tag)` → `Match.value`
  - Current: `switch (ast._tag) { ... }`
  - Fix: `Match.value(ast).pipe(Match.tag(...), Match.exhaustive)`

---

### @beep/shared-server (packages/shared/server)

#### Required Import Additions

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as Match from "effect/Match"
import * as P from "effect/Predicate"
```

#### Native Array Methods (~8 violations)

- [ ] `packages/shared/server/src/factories/db-client/pg/formatter.ts:184-199` - `Arr.map` is already Effect
  - [VALID] Uses imported Arr (alias for A)

- [ ] `packages/shared/server/src/factories/db-client/pg/PgClient.ts:177` - `Arr.map` is already Effect
  - [VALID] Uses imported Arr

#### Native String Methods (~5 violations)

- [ ] `packages/shared/server/src/factories/db-client/pg/errors.ts:133,136` - Uses `Str.split` correctly
  - [VALID] Already uses Effect

#### Switch Statements (~1 violation)

- [ ] `packages/shared/server/src/factories/db-client/pg/formatter.ts:140-146` - Uses `Match.when` correctly
  - [VALID] Already uses Effect Match

#### typeof/instanceof (~12 violations)

- [ ] `packages/shared/server/src/factories/db-client/pg/formatter.ts:288-313` - Multiple `typeof` checks
  - Current: `typeof value === "string"`, `typeof value === "number"`, etc.
  - Fix: Use `P.isString`, `P.isNumber`, `P.isBoolean`

- [ ] `packages/shared/server/src/factories/db-client/pg/errors.ts:18,49,54,131,158,185,212` - Multiple `instanceof` checks
  - Current: `error instanceof pg.DatabaseError`, `error instanceof Error`, etc.
  - [VERIFY] Some may be necessary for error handling

#### Type Safety (`as any`) (~5 violations)

- [ ] `packages/shared/server/src/factories/db-client/pg/PgClient.ts:172,193,248,254,379` - `as any` casts
  - Current: `params as any`, `(client as any).processID`
  - Fix: Add proper type annotations or use Effect type utilities

---

### @beep/shared-domain (packages/shared/domain)

#### Required Import Additions

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as DateTime from "effect/DateTime"
```

#### Native Array Methods - Most are correctly using Effect
- [VALID] Most usages are `A.map`, `A.filter`, `A.some`, `O.map`, etc.

#### Native Date (~5 violations)

- [ ] `packages/shared/domain/src/services/EncryptionService/EncryptionService.ts:711,740` - `Date.now()`
  - Current: `Date.now()` in encryption service
  - Fix: `DateTime.toEpochMillis(DateTime.unsafeNow())`

#### typeof/instanceof (~8 violations)

- [ ] `packages/shared/domain/src/services/EncryptionService/EncryptionService.ts:292` - `typeof input === "string"`
  - Current: `if (typeof input === "string")`
  - Fix: `if (P.isString(input))`

- [ ] `packages/shared/domain/src/factories/path-builder/PathBuilder/PathBuilder.ts:83,100` - `typeof` checks
  - Current: `typeof input === "object"` / `typeof value === "function"`
  - Fix: `P.isObject(input)` / `P.isFunction(value)`

---

### @beep/common-contract (packages/common/contract)

#### Switch Statements (~2 violations)

- [ ] `packages/common/contract/src/internal/contract-error/contract-error.ts:432` - `switch (this.reason)`
  - Current: `switch (this.reason) { ... }`
  - Fix: `Match.value(this.reason).pipe(Match.when(...), Match.exhaustive)`

#### typeof/instanceof (~15 violations)

- [ ] `packages/common/contract/src/internal/contract/continuation.ts:126,203,206` - `instanceof` checks
  - Current: `Effect.isEffect(value) && !(value instanceof Error)`
  - [VERIFY] May be intentional for Effect type checking

- [ ] `packages/common/contract/src/internal/contract-error/contract-error.ts:377,379` - `.includes()` checks
  - Current: `contentType.includes("application/json")`
  - Fix: `Str.includes("application/json")(contentType)`

---

### @beep/common-mock (packages/common/mock)

> **Note**: This package contains mock data and may have lower remediation priority.

#### Native Array Methods (~20 violations)

- [ ] `packages/common/mock/src/_files.ts:70,84` - `.map()` on array literals
  - Current: `FOLDERS.map((name, index) => {...})`
  - Fix: `F.pipe(FOLDERS, A.map((name, index) => {...}))`

- [ ] `packages/common/mock/src/_job.ts:116,118` - `.map()` / `.slice()` → Effect equivalents
  - Current: `JOB_BENEFIT_OPTIONS.slice(0, 3).map(...)`
  - Fix: `F.pipe(JOB_BENEFIT_OPTIONS, A.take(3), A.map(...))`

- [ ] `packages/common/mock/src/_user.ts:32-127` - Many `Array.from()` calls
  - Current: `Array.from({ length: N }, (_, index) => {...})`
  - Fix: `A.makeBy(N, (index) => {...})`

- [ ] `packages/common/mock/src/_tour.ts:71-87` - Multiple `Array.from()` calls
  - Current: `Array.from({ length: N }, ...)`
  - Fix: `A.makeBy(N, ...)`

- [ ] `packages/common/mock/src/_invoice.ts:17-44` - Multiple `Array.from()` / `.reduce()` calls
  - Current: `Array.from({ length: N }, ...)` / `ITEMS.reduce(...)`
  - Fix: `A.makeBy(N, ...)` / `A.reduce(ITEMS, ...)`

---

### @beep/ui-core (packages/ui/core)

#### Required Import Additions

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"
import * as P from "effect/Predicate"
```

#### Native Array Methods (~3 violations)

- [ ] `packages/ui/core/src/theme/core/typography.ts:32` - `.reduce()` → `A.reduce`
  - Current: `keys.reduce((styles, breakpoint) => {...}, {})`
  - Fix: `A.reduce(keys, {}, (styles, breakpoint) => {...})`

- [ ] `packages/ui/core/src/theme/core/mixins/text.ts:97` - `.reduce()` → `A.reduce`
  - Current: `keys.reduce((acc, breakpoint) => {...}, {})`
  - Fix: `A.reduce(keys, {}, (acc, breakpoint) => {...})`

#### Native String Methods (~5 violations)

- [ ] `packages/ui/core/src/utils/right-to-left.ts:17,24` - `.trim()` / `.includes()` → Effect equivalents
  - Current: `cssValue.trim()` / `trimmed.includes("/* @noflip */")`
  - Fix: `Str.trim(cssValue)` / `Str.includes("/* @noflip */")(trimmed)`

- [ ] `packages/ui/core/src/utils/color.ts:80,113,143` - Multiple native string methods
  - Current: `opacity.trim()`, `!color?.trim()`, `Str.toLowerCase(color) === "currentcolor"`
  - [VERIFY] Some already use Effect

- [ ] `packages/ui/core/src/utils/format-number.ts:71` - `.toLowerCase()` → `Str.toLowerCase`
  - Current: `match.toLowerCase()`
  - Fix: `Str.toLowerCase(match)`

#### Switch Statements (~1 violation)

- [ ] `packages/ui/core/src/utils/cookies.ts:21` - `switch (sameSite)` → `Match.value`
  - Current: `switch (sameSite) { ... }`
  - Fix: `Match.value(sameSite).pipe(Match.when(...), Match.exhaustive)`

#### typeof/instanceof (~5 violations)

- [ ] `packages/ui/core/src/theme/core/mixins/text.ts:58,62` - `typeof fontSize === "string"` → `P.isString`
  - Current: `typeof fontSize === "string"`
  - Fix: `P.isString(fontSize)`

- [ ] `packages/ui/core/src/utils/cookies.ts:91` - `typeof value === "string"` → `P.isString`
  - Current: `typeof value === "string"`
  - Fix: `P.isString(value)`

---

### @beep/lexical-collab (packages/ui/ui/src/lexical/collab)

#### Native Array Methods (~15 violations)

- [ ] `packages/ui/ui/src/lexical/collab/CollabInstance.ts:144,153,251,253,254` - `.filter()` / `.map()` → Effect equivalents
  - Current: `.filter(([k, _]) => k !== "root")` / `.map(([_, n]) => ...)`
  - Fix: Use `A.filter` and `A.map` with pipe

- [ ] `packages/ui/ui/src/lexical/collab/CollabInstance.ts:189,220,288,313,381,469,485,545` - `.forEach()` calls
  - Current: Various `nodes.forEach(...)`, `stack.forEach(...)`, etc.
  - Fix: Use `A.forEach`

- [ ] `packages/ui/ui/src/lexical/collab/CollabInstance.ts:251` - `Array.from(messageMap.values())`
  - Current: `Array.from(messageMap.values())`
  - Fix: `F.pipe(messageMap, HashMap.values, A.fromIterable)`

- [ ] `packages/ui/ui/src/lexical/collab/CollabTrystero.ts:70-249` - Many `.forEach()` calls on listeners
  - Current: `this.debugListeners.forEach(...)`, etc.
  - Fix: Use `A.forEach`

- [ ] `packages/ui/ui/src/lexical/collab/CollabNetwork.ts:43` - `.forEach()` → `A.forEach`
  - Current: `m.messages.forEach((pm) => {...})`
  - Fix: `A.forEach(m.messages, (pm) => {...})`

#### Native Date (~5 violations)

- [ ] `packages/ui/ui/src/lexical/collab/CollabInstance.ts:520,546` - `Date.now()` → `DateTime.unsafeNow()`
  - Current: `lastActivity: Date.now()` / `cursor.lastActivity < Date.now() - 1000 * ...`
  - Fix: Use `DateTime.toEpochMillis(DateTime.unsafeNow())`

- [ ] `packages/ui/ui/src/lexical/collab/CollabTrystero.ts:177` - `Date.now()` → `DateTime.unsafeNow()`
  - Current: `(Date.now() + Math.random()).toString()`
  - Fix: Use Effect DateTime

- [ ] `packages/ui/ui/src/lexical/collab/cursor.ts:28` - `Date.now()` → `DateTime.unsafeNow()`
  - Current: `message.lastActivity < Date.now() - 1000 * CURSOR_INACTIVITY_LIMIT`
  - Fix: Use Effect DateTime

#### Switch Statements (~6 violations)

- [ ] `packages/ui/ui/src/lexical/collab/CollabInstance.ts:222,289,315,409,441` - Multiple `switch` statements
  - Current: `switch (m.type)`, `switch (mutation)`, etc.
  - Fix: Use `Match.value().pipe(Match.when(...), Match.exhaustive)`

- [ ] `packages/ui/ui/src/lexical/collab/CollabNetwork.ts:35,45` - `switch (m.type)` → `Match.value`
  - Current: `switch (m.type) { ... }`
  - Fix: Use `Match.value`

- [ ] `packages/ui/ui/src/lexical/collab/CollabTrystero.ts:170,203` - `switch (message.type)` → `Match.value`
  - Current: `switch (message.type) { ... }`
  - Fix: Use `Match.value`

---

### @beep/common-types (packages/common/types)

> **Note**: This package contains TypeScript type definitions and documentation examples.
> Many violations are in JSDoc examples and type tests, which may not need remediation.

#### Documentation Examples (~35 occurrences)

These are type definition files with example code in comments/JSDoc. Consider:
- Lower priority for remediation
- May be intentionally using native JS for documentation clarity
- Review on case-by-case basis

---

### @beep/iam-server (packages/iam/server)

#### typeof/instanceof (~4 violations)

- [ ] `packages/iam/server/src/api/v1/organization/update.ts:36,40` - `typeof` checks → `P.is*`
  - Current: `typeof v === "object"` / `typeof value === "string"`
  - Fix: `P.isObject(v)` / `P.isString(value)`

- [ ] `packages/iam/server/src/api/v1/organization/create.ts:36,40` - Same as above
  - Current: `typeof v === "object"` / `typeof value === "string"`
  - Fix: `P.isObject(v)` / `P.isString(value)`

- [ ] `packages/iam/server/src/api/v1/sso/saml2-sp-metadata.ts:58` - `typeof result === "string"`
  - Current: `typeof result === "string" ? result : String(...)`
  - Fix: `P.isString(result) ? result : String(...)`

---

### @beep/iam-client (packages/iam/client)

#### Native String Methods (~3 violations)

- [ ] `packages/iam/client/src/clients/user/user.forms.ts:71` - Uses `Str.split` correctly
  - [VALID] Already uses Effect

- [ ] `packages/iam/client/src/constants/AuthCallback/AuthCallback.ts:19,26` - Uses `Str.split` correctly
  - [VALID] Already uses Effect

---

### @beep/documents-server (packages/documents/server)

#### Native String Methods - Most use Effect correctly

- [ ] `packages/documents/server/src/files/PdfMetadataService.ts:195-208` - Uses `Str.includes` / `Str.toLowerCase` correctly
  - [VALID] Already uses Effect

#### Native Date (~3 violations)

- [ ] `packages/documents/server/src/files/PdfMetadataService.ts:89` - `dateInput instanceof Date`
  - Current: `if (dateInput instanceof Date)`
  - Fix: `if (P.isDate(dateInput))`

- [ ] `packages/documents/server/src/files/PdfMetadataService.ts:100` - Uses `Str.startsWith` correctly
  - [VALID] Already uses Effect

---

### @beep/runtime-client (packages/runtime/client)

#### Switch Statements (~1 violation)

- [ ] `packages/runtime/client/src/services/unsafe-http-api-client.ts:69` - `switch (encoding.kind)` → `Match.value`
  - Current: `switch (encoding.kind) { ... }`
  - Fix: `Match.value(encoding.kind).pipe(Match.when(...), Match.exhaustive)`

#### typeof/instanceof (~4 violations)

- [ ] `packages/runtime/client/src/layers/layer-indexed-db.ts:126,138` - `typeof` / `instanceof` checks
  - Current: `typeof value === "string"` / `value instanceof Uint8Array`
  - Fix: `P.isString(value)` / appropriate predicate

- [ ] `packages/runtime/client/src/services/unsafe-http-api-client.ts:85,224` - `instanceof` checks
  - Current: `!(toI instanceof Uint8Array)` / `request?.payload instanceof FormData`
  - Fix: Use appropriate predicates

---

### @beep/common-errors (packages/common/errors)

#### Native Array Methods (~3 violations)

- [ ] `packages/common/errors/src/shared.ts:131` - `.map()` → `A.map`
  - Current: `List.toArray(spans).map((s) => ...)`
  - Fix: `F.pipe(List.toArray(spans), A.map((s) => ...))`

- [ ] `packages/common/errors/src/server.ts:269-274` - `.split()` / `.map()` / `.filter()` → Effect equivalents
  - Current: Various native array/string method chains
  - Fix: Use Effect equivalents

#### Native String Methods (~3 violations)

- [ ] `packages/common/errors/src/server.ts:136,138` - `.split()` / `.trim()` → Effect equivalents
  - Current: `stack.split("\n")` / `raw.trim()`
  - Fix: `Str.split("\n")(stack)` / `Str.trim(raw)`

#### typeof/instanceof (~5 violations)

- [ ] `packages/common/errors/src/shared.ts:99-102` - `typeof message === "string"` / `instanceof Error`
  - Current: Multiple type checks
  - Fix: Use `P.isString`, `P.isError` predicates

- [ ] `packages/common/errors/src/shared.ts:178,183` - `instanceof Error` → `P.isError`
  - Current: `val instanceof Error` / `d instanceof Error`
  - Fix: `P.isError(val)` / `P.isError(d)`

---

## Completion Log

| Package | Date | Violations Fixed | Commit |
|---------|------|------------------|--------|
| | | | |

---

## Notes

### False Positives Excluded

The following patterns were verified as NOT violations:
1. `A.map`, `A.filter`, `A.forEach`, etc. - Effect Array methods (correct usage)
2. `O.map`, `O.filter` - Effect Option methods (correct usage)
3. `Effect.map`, `Stream.map` - Effect core methods (correct usage)
4. `Str.split`, `Str.trim`, `Str.includes` - Effect String methods (correct usage)
5. `HashMap.forEach`, `HashSet.forEach` - Effect collection methods (correct usage)
6. `fc.map` - fast-check arbitrary mapping (library API)
7. `S.filter` - Effect Schema filter (correct usage)

### Packages Requiring Human Review

1. **@beep/common-types** - Contains TypeScript type examples that may use native JS intentionally
2. **@beep/common-mock** - Mock data may have lower priority
3. **@beep/common-contract** - Some `instanceof` checks may be intentional for Effect type guards
4. **Test files** - Some violations in test files testing invalid inputs with `@ts-expect-error`

### Ambiguous Cases

Items marked with `[VERIFY]` require additional context review before remediation.
