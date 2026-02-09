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

