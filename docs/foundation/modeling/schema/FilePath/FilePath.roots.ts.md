---
title: FilePath.roots.ts
nav_order: 86
parent: "@beep/schema"
---

## FilePath.roots.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HasLeafSegment (type alias)](#hasleafsegment-type-alias)
  - [WindowsDriveRoot (type alias)](#windowsdriveroot-type-alias)
  - [WindowsUncRoot (type alias)](#windowsuncroot-type-alias)
- [validation](#validation)
  - [HasLeafSegment](#hasleafsegment)
  - [WindowsDriveRoot](#windowsdriveroot)
  - [WindowsUncRoot](#windowsuncroot)
---

# models

## HasLeafSegment (type alias)

Type for `HasLeafSegment`.

**Signature**

```ts
type HasLeafSegment = typeof HasLeafSegment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.roots.ts#L157)

Since v0.0.0

## WindowsDriveRoot (type alias)

Type for `WindowsDriveRoot`.

**Signature**

```ts
type WindowsDriveRoot = typeof WindowsDriveRoot.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.roots.ts#L52)

Since v0.0.0

## WindowsUncRoot (type alias)

Type for `WindowsUncRoot`.

**Signature**

```ts
type WindowsUncRoot = typeof WindowsUncRoot.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.roots.ts#L89)

Since v0.0.0

# validation

## HasLeafSegment

Branded schema for path strings that include a non-root leaf segment.

**Example**

```ts
import { HasLeafSegment } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(HasLeafSegment)("src/index.ts")
console.log(path)
```

**Signature**

```ts
declare const HasLeafSegment: AnnotatedSchema<S.brand<S.NonEmptyString, "HasLeafSegment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.roots.ts#L110)

Since v0.0.0

## WindowsDriveRoot

Branded schema for Windows drive roots such as `C:` and `C:\\`.

**Example**

```ts
import { WindowsDriveRoot } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const root = S.decodeUnknownSync(WindowsDriveRoot)("C:\\")
console.log(root)
```

**Signature**

```ts
declare const WindowsDriveRoot: AnnotatedSchema<S.brand<S.String, "WindowsDriveRoot">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.roots.ts#L28)

Since v0.0.0

## WindowsUncRoot

Branded schema for UNC roots such as `\\\\server\\share`.

**Example**

```ts
import { WindowsUncRoot } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const root = S.decodeUnknownSync(WindowsUncRoot)("\\\\server\\share")
console.log(root)
```

**Signature**

```ts
declare const WindowsUncRoot: AnnotatedSchema<S.brand<S.String, "WindowsUncRoot">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.roots.ts#L69)

Since v0.0.0