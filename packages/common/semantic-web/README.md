# `@beep/semantic-web`

Semantic web utilities used across the `beep-effect` monorepo.

## IDNA

This package includes an IDNA / punycode port under `@beep/semantic-web/idna`.

Key properties:
- `IDNA` is an `effect/Schema` `S.Class` representing the canonical ASCII form (what `toASCII` produces).
- `IDNAFromString` is a strict `S.transformOrFail(S.String, IDNA, ...)` so IDNA can be used as a schema.
- The public API is Effect-based (fails with `ParseResult.ParseError`), and also exposes explicit `*Result` methods for synchronous callers.

### Effect API

```ts
import * as Effect from "effect/Effect";
import { IDNA } from "@beep/semantic-web/idna";

const ascii = await IDNA.toASCII("münchen.de").pipe(Effect.runPromise);
// => "xn--mnchen-3ya.de"
```

### Sync `*Result` API (no throws)

```ts
import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import { IDNA } from "@beep/semantic-web/idna";

const r = IDNA.toASCIIResult("münchen.de");
if (Either.isLeft(r)) {
  console.error(ParseResult.TreeFormatter.formatIssueSync(r.left));
} else {
  console.log(r.right);
}
```

### Schema Usage

```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { IDNAFromString } from "@beep/semantic-web/idna";

const idna = await S.decodeUnknown(IDNAFromString)("münchen.de").pipe(Effect.runPromise);
console.log(idna.value);
// => "xn--mnchen-3ya.de"
```

## URI / IRI

This package includes an Effect-first `uri-js` port under `@beep/semantic-web/uri`.

Key properties:
- `URI` / `IRI` are `effect/Schema` `S.Class` value models whose `value` is a canonical serialization.
- `URIString` / `IRIString` are branded string schemas for canonical normalized serializations (useful when you want a `string` type that still carries the invariant).
- `URIFromString` / `IRIFromString` are strict `S.transformOrFail(S.String, ..., ...)` schemas so you can validate and normalize URIs/IRIs at boundaries.
- `URIStringFromString` / `IRIStringFromString` are strict `S.transformOrFail(S.String, ..., ...)` schemas producing branded canonical strings directly.
- The public API is Effect-based (fails with `ParseResult.ParseError`), and does not throw for invalid inputs.
- Scheme support is pluggable. Import `@beep/semantic-web/uri/schemes` once to register the built-in handlers (`http`, `https`, `ws`, `wss`, `mailto`, `urn`, `urn:uuid`).

### Effect API

```ts
import * as Effect from "effect/Effect";
import { equal, normalize, parse, resolve, serialize } from "@beep/semantic-web/uri/uri";
import "@beep/semantic-web/uri/schemes";

const components = await parse("http://example.com").pipe(Effect.runPromise);
const normalized = await normalize("HTTP://EXAMPLE.COM").pipe(Effect.runPromise);
const resolved = await resolve("http://example.com/a/b", "../c").pipe(Effect.runPromise);
const isSame = await equal("http://example.com", "http://example.com/").pipe(Effect.runPromise);
const rendered = await serialize(components).pipe(Effect.runPromise);
```

### Schema Usage

```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { URIFromString } from "@beep/semantic-web/uri/uri";
import "@beep/semantic-web/uri/schemes";

const uri = await S.decodeUnknown(URIFromString)("HTTP://ABC.COM").pipe(Effect.runPromise);
console.log(uri.value);
// => "http://abc.com/"
```

### Failure Handling (No Throws)

```ts
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import { parse } from "@beep/semantic-web/uri/uri";
import "@beep/semantic-web/uri/schemes";

const either = await parse("urn:uuid:not-a-uuid").pipe(Effect.either, Effect.runPromise);
if (either._tag === "Left") {
  console.error(ParseResult.TreeFormatter.formatErrorSync(either.left));
}
```
