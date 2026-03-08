# @beep/semantic-web

Semantic-web schemas and utilities for the `beep-effect` monorepo.

## Status

Current implemented surface in this slice:

- `@beep/semantic-web/iri`
- curated root exports from `@beep/semantic-web` for `VERSION` plus the IRI family

Planned but not implemented in this slice:

- `@beep/semantic-web/uri`
- `@beep/semantic-web/prov`
- `@beep/semantic-web/rdf`
- `@beep/semantic-web/jsonld`

## Installation

```bash
bun add @beep/semantic-web
```

## IRI

`@beep/semantic-web/iri` is the canonical import path for the RFC 3987 IRI family.

Exports:

- `IRI`
- `AbsoluteIRI`
- `IRIReference`
- `RelativeIRIReference`

These schemas preserve the current syntax-boundary posture from the seed asset:

- rigorous RFC 3987 validation
- no silent normalization or comparison policy
- no transport or mapping behavior added at decode time

```ts
import * as S from "effect/Schema";
import { IRI } from "@beep/semantic-web/iri";

const decodeIri = S.decodeUnknownSync(IRI);

decodeIri("https://例え.テスト/δοκιμή/𐌀?κλειδί=値#片段");
```

## Curated Root Surface

The package root is intentionally small. It re-exports `VERSION` and the IRI family for convenience, but family-specific paths remain canonical.

```ts
import { IRI, VERSION } from "@beep/semantic-web";
```

## Development

```bash
bun run --filter=@beep/semantic-web check
bun run --filter=@beep/semantic-web lint
bun run --filter=@beep/semantic-web test
bun run --filter=@beep/semantic-web build
```

## License

MIT
