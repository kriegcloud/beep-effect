---
title: URL.ts
nav_order: 216
parent: "@beep/schema"
---

## URL.ts overview

A module housing URL related schemas

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [URLStr (type alias)](#urlstr-type-alias)
- [validation](#validation)
  - [URLStr](#urlstr)
---

# models

## URLStr (type alias)

{@inheritDoc URLStr}

**Example**

```ts
import type { URLStr } from "@beep/schema/URL"

const endpoint: URLStr = "https://api.example.com" as URLStr
```

**Signature**

```ts
type URLStr = Brand.Branded<NonEmptyTrimmedStr, "URLStr">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/URL.ts#L85)

Since v0.0.0

# validation

## URLStr

A branded schema for URL-encoded strings validated against `new URL()`.

**Example**

```ts
import * as S from "effect/Schema"
import { URLStr } from "@beep/schema/URL"

const url = S.decodeUnknownSync(URLStr)("https://example.com")
console.log(url)
```

**Signature**

```ts
declare const URLStr: AnnotatedSchema<S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "NonEmptyTrimmedStr" | "URLStr"> & { filter: Filter<unknown>; is: (u: unknown) => u is URLStr; make: Brand.Constructor<URLStr>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/URL.ts#L60)

Since v0.0.0