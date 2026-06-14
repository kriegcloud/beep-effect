---
title: FileName.ts
nav_order: 84
parent: "@beep/schema"
---

## FileName.ts overview

Portable file-name schema helpers for strings shaped like `basename.ext`.

The basename must be non-empty and may include additional dots, while the
final extension segment must be one of the known `FileExtension`
values.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { FileName } from "@beep/schema/FileName";

const decodeFileName = S.decodeUnknownSync(FileName);

decodeFileName("readme.txt");
decodeFileName("archive.tar.gz");
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [FileName](#filename)
---

# models

## FileName (type alias)

Type for `FileName`.

**Example**

```ts
import type { FileName } from "@beep/schema/FileName"

const file: FileName = "readme.txt" as FileName
```

**Signature**

```ts
type FileName = typeof FileName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileName.ts#L136)

Since v0.0.0

# validation

## FileName

Portable file name schema.

**Example**

```ts
import { FileName } from "@beep/schema/FileName"
import * as S from "effect/Schema"

const fileName = S.decodeUnknownSync(FileName)("readme.txt")
console.log(fileName)
```

**Signature**

```ts
declare const FileName: S.Codec<`${string}.${string}`, `${string}.${string}`, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileName.ts#L118)

Since v0.0.0