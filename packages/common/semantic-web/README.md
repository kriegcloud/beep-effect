# @beep/semantic-web

Semantic-web schemas and utilities for the `beep-effect` monorepo.

## Status

Current implemented surface in this slice:

- `@beep/semantic-web/iri`
- `@beep/semantic-web/uri`
- `@beep/semantic-web/rdf`
- `@beep/semantic-web/vocab/*`
- `@beep/semantic-web/jsonld`
- `@beep/semantic-web/prov`
- `@beep/semantic-web/evidence`
- `@beep/semantic-web/services/*`
- `@beep/semantic-web/adapters/jsonld-context`
- `@beep/semantic-web/adapters/jsonld-document`
- `@beep/semantic-web/adapters/canonicalization`
- `@beep/semantic-web/adapters/shacl-engine`
- `@beep/semantic-web/adapters/web-annotation`
- curated root exports from `@beep/semantic-web` for `VERSION` plus the IRI family

Migration posture in this slice:

- `IRI` remains canonical at `@beep/semantic-web/iri`
- `ProvO` now has a semantic-web public surface at `@beep/semantic-web/prov`
- no public `@beep/schema` compatibility shims were added

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

## URI, RDF, and JSON-LD

The v1 implementation now includes bounded URI helpers, RDF/JS-aligned value families, concrete vocab modules, JSON-LD context/document models, provenance values, and adapter-neutral evidence anchors.

Canonical subpath imports:

```ts
import { normalizeUriReference } from "@beep/semantic-web/uri";
import { makeQuad } from "@beep/semantic-web/rdf";
import { JsonLdDocument } from "@beep/semantic-web/jsonld";
import { ProvBundle } from "@beep/semantic-web/prov";
import { EvidenceAnchor } from "@beep/semantic-web/evidence";
```

Service and adapter layers are exposed by family subpaths rather than the package root:

```ts
import { JsonLdDocumentService } from "@beep/semantic-web/services/jsonld-document";
import { JsonLdDocumentServiceLive } from "@beep/semantic-web/adapters/jsonld-document";
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
