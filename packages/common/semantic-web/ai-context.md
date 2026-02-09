---
path: packages/common/semantic-web
summary: Effect-first semantic web utilities (IDNA, URI/IRI parsing/normalization, RDF-adjacent modules)
tags: [semantic-web, uri, iri, idna, effect, schema, parseerror]
---

# `@beep/semantic-web`

Semantic web primitives and utilities shared across the monorepo. This package is intended to stay deterministic and boundary-friendly: validate, normalize, parse, and serialize data without introducing I/O.

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/idna/` | IDNA / punycode utilities with Schema-first models (`IDNA`, `IDNAFromString`) and Effect APIs (`toASCII`, `toUnicode`) |
| `src/uri/` | `uri-js` port refactored to Effect + Schema-first (`URI`, `IRI`, `URIFromString`, `IRIFromString`) plus effectful operations (`parse`, `serialize`, `resolve`, `normalize`, `equal`) |
| `src/jsonld/` | JSON-LD helpers/constants (keep pure) |
| `src/turtle/` | Turtle helpers/constants (keep pure) |
| `src/sparql/` | SPARQL helpers/constants (keep pure) |
| `src/shacl/`, `src/rdfs/`, `src/owl2/`, `src/prov0/`, `src/shexj/` | Vocabularies and helpers (keep pure) |

## URI / IRI (Effect + Schema-first)

**Entry point:** `@beep/semantic-web/uri/uri`

- `URI` / `IRI`: `effect/Schema` `S.Class` value models with a canonical `.value` string.
- `URIString` / `IRIString`: branded string schemas for canonical normalized serializations.
- `URIFromString` / `IRIFromString`: strict `S.transformOrFail(S.String, ..., ...)` so URIs/IRIs can be used as schemas at boundaries.
- `URIStringFromString` / `IRIStringFromString`: strict `S.transformOrFail(S.String, ..., ...)` producing branded canonical strings directly.
- Public APIs fail with `ParseResult.ParseError` (no throws for invalid inputs).
- Scheme support is extendable. Built-in schemes are registered by importing `@beep/semantic-web/uri/schemes` once.

### Typical Usage

```ts
import * as Effect from "effect/Effect";
import { parse, normalize } from "@beep/semantic-web/uri/uri";
import "@beep/semantic-web/uri/schemes";

const components = await parse("http://example.com").pipe(Effect.runPromise);
const canonical = await normalize("HTTP://EXAMPLE.COM").pipe(Effect.runPromise);
```

### Schema Boundary Usage

```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { URIFromString } from "@beep/semantic-web/uri/uri";
import "@beep/semantic-web/uri/schemes";

const uri = await S.decodeUnknown(URIFromString)("HTTP://ABC.COM").pipe(Effect.runPromise);
// uri.value is canonicalized
```

### Error Model

- Internal helpers use `ParseResult.ParseIssue`.
- Public exported Effect APIs wrap issues into `ParseResult.ParseError`.
- Schema transforms (`transformOrFail`) fail with `ParseIssue` anchored to the transform stage using the provided `ast`.

## Testing References

- IDNA: `packages/common/semantic-web/test/idna/idna.test.ts`
- URI: `packages/common/semantic-web/test/uri/uri.test.ts`

Tests for Effect APIs should use `@beep/testkit` runners (`effect`, `scoped`, `layer`) rather than manual `Effect.runPromise`.

## Related Docs

- `packages/common/semantic-web/README.md`
- `packages/common/semantic-web/AGENTS.md`
