---
title: Http.headers.shared.ts
nav_order: 113
parent: "@beep/schema"
---

## Http.headers.shared.ts overview

HTTP header schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeHeaderEncodeForbidden](#makeheaderencodeforbidden)
  - [makeResponseHeaderOption](#makeresponseheaderoption)
- [encoding](#encoding)
  - [encodeStrictURI](#encodestricturi)
- [models](#models)
  - [ArrayOfStrOrStr (type alias)](#arrayofstrorstr-type-alias)
  - [EncodedStrictURIFromStrOrURL (type alias)](#encodedstricturifromstrorurl-type-alias)
  - [ResponseHeader (class)](#responseheader-class)
  - [StringOrUrl (type alias)](#stringorurl-type-alias)
- [schemas](#schemas)
  - [ArrayOfStrOrStr](#arrayofstrorstr)
  - [EncodedStrictURIFromStrOrURL](#encodedstricturifromstrorurl)
  - [StringOrUrl](#stringorurl)
- [utilities](#utilities)
  - [wrapArray](#wraparray)
---

# constructors

## makeHeaderEncodeForbidden

Creates an encoder that always fails for one-way header schemas.

**Example**

```ts
import { Effect } from "effect"
import { makeHeaderEncodeForbidden } from "../../src/Http/Http.headers.shared.ts"

const result = Effect.runSyncExit(makeHeaderEncodeForbidden("DemoHeader")("value"))
console.log(result._tag)
```

**Signature**

```ts
declare const makeHeaderEncodeForbidden: <A>(schemaName: string) => (header: A) => Effect.Effect<never, SchemaIssue.Issue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L193)

Since v0.0.0

## makeResponseHeaderOption

Creates a response header when a value is present.

**Example**

```ts
import * as Option from "effect/Option"
import { makeResponseHeaderOption } from "../../src/Http/Http.headers.shared.ts"

const header = makeResponseHeaderOption("X-Test", Option.some("ok"))
console.log(Option.isSome(header))
```

**Signature**

```ts
declare const makeResponseHeaderOption: { (name: string, value: Option.Option<string>): Option.Option<ResponseHeader>; (value: Option.Option<string>): (name: string) => Option.Option<ResponseHeader>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L233)

Since v0.0.0

# encoding

## encodeStrictURI

Encodes a string or URL as a normalized absolute URL string.

**Example**

```ts
import { encodeStrictURI } from "../../src/Http/Http.headers.shared.ts"

console.log(encodeStrictURI("https://example.com/docs"))
```

**Signature**

```ts
declare const encodeStrictURI: (value: StringOrUrl) => EncodedStrictURIFromStrOrURL
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L134)

Since v0.0.0

# models

## ArrayOfStrOrStr (type alias)

Type for a single string header value or repeated string values.

**Signature**

```ts
type ArrayOfStrOrStr = typeof ArrayOfStrOrStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L44)

Since v0.0.0

## EncodedStrictURIFromStrOrURL (type alias)

Type for encoded absolute URL strings.

**Signature**

```ts
type EncodedStrictURIFromStrOrURL = typeof EncodedStrictURIFromStrOrURL.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L115)

Since v0.0.0

## ResponseHeader (class)

Model for a rendered HTTP response header.

**Example**

```ts
import * as Option from "effect/Option"
import { ResponseHeader } from "../../src/Http/Http.headers.shared.ts"

const header = ResponseHeader.make({ name: "X-Test", value: Option.some("ok") })
console.log(header.name)
```

**Signature**

```ts
declare class ResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L168)

Since v0.0.0

## StringOrUrl (type alias)

Type for values accepted where a URL-like header value is expected.

**Signature**

```ts
type StringOrUrl = typeof StringOrUrl.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L72)

Since v0.0.0

# schemas

## ArrayOfStrOrStr

Schema for a single string header value or repeated string values.

**Example**

```ts
import * as S from "effect/Schema"
import { ArrayOfStrOrStr } from "../../src/Http/Http.headers.shared.ts"

console.log(S.decodeUnknownSync(ArrayOfStrOrStr)(["a", "b"]).length)
```

**Signature**

```ts
declare const ArrayOfStrOrStr: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L32)

Since v0.0.0

## EncodedStrictURIFromStrOrURL

Schema that normalizes a string or URL into an encoded absolute URL string.

**Example**

```ts
import * as S from "effect/Schema"
import { EncodedStrictURIFromStrOrURL } from "../../src/Http/Http.headers.shared.ts"

const uri = S.decodeUnknownSync(EncodedStrictURIFromStrOrURL)("https://example.com/docs")
console.log(uri)
```

**Signature**

```ts
declare const EncodedStrictURIFromStrOrURL: AnnotatedSchema<S.decodeTo<S.brand<S.String, "EncodedStrictURIFromStrOrURL">, S.Union<readonly [S.String, S.URL]> & SchemaStatics<S.Union<readonly [S.String, S.URL]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L89)

Since v0.0.0

## StringOrUrl

Schema for values accepted where a URL-like header value is expected.

**Example**

```ts
import * as S from "effect/Schema"
import { StringOrUrl } from "../../src/Http/Http.headers.shared.ts"

console.log(S.decodeUnknownSync(StringOrUrl)("https://example.com"))
```

**Signature**

```ts
declare const StringOrUrl: AnnotatedSchema<S.Union<readonly [S.String, S.URL]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L60)

Since v0.0.0

# utilities

## wrapArray

Wraps a single value in an array while preserving arrays.

**Example**

```ts
import { wrapArray } from "../../src/Http/Http.headers.shared.ts"

console.log(wrapArray("cache-control").length)
```

**Signature**

```ts
declare const wrapArray: <T>(value: T | ReadonlyArray<T>) => readonly T[]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Http/Http.headers.shared.ts#L150)

Since v0.0.0