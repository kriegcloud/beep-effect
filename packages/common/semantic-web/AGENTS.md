# @beep/semantic-web Agent Guide

## Purpose & Fit
- A library containing utilities, schemas, and services for working with the semantic web

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION, IRI, AbsoluteIRI, IRIReference, RelativeIRIReference | curated root surface only |
| `iri` module | IRI, AbsoluteIRI, IRIReference, RelativeIRIReference | canonical public IRI family |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { IRI } from "@beep/semantic-web/iri"
```

## Verifications
- `bun run --filter=@beep/semantic-web check`
- `bun run --filter=@beep/semantic-web lint`
- `bun run --filter=@beep/semantic-web test`
- `bun run --filter=@beep/semantic-web build`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
