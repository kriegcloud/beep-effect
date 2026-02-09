# File Layout: URI Effect + Schema Refactor

This refactor keeps the existing URI module directory structure to minimize repo-wide churn, but rewrites implementation and error handling.

## Kept paths (rewritten internals)

- `packages/common/semantic-web/src/uri/uri.ts`
  - Public entry for:
    - `URI` / `IRI` (`S.Class`)
    - `URIFromString` / `IRIFromString` (`S.transformOrFail`)
    - Effect-based operations (`parse`, `serialize`, `resolveComponents`, `resolve`, `normalize`, `equal`, `escapeComponent`, `unescapeComponent`)
  - Owns public types (`URIComponents`, `URIOptions`) as needed.
  - Wraps internal `ParseIssue` failures into `ParseError` at the export boundary.

- `packages/common/semantic-web/src/uri/model.ts`
  - Keep `URIRegExps` as an `S.Class` holding compiled regexes (already schema-backed).

- `packages/common/semantic-web/src/uri/regex-uri.ts`
- `packages/common/semantic-web/src/uri/regex-iri.ts`
- `packages/common/semantic-web/src/uri/util.ts`
  - Keep existing regex construction helpers and patterns.

- `packages/common/semantic-web/src/uri/schemes/*`
  - Keep scheme handlers (http/https/ws/wss/mailto/urn/urn-uuid) but refactor:
    - remove `components.error` mutation
    - return typed failures (`ParseIssue` internally, `ParseError` at exported boundaries)
  - `packages/common/semantic-web/src/uri/schemes/index.ts` remains as the side-effect registration point.

## Optional internal helpers (only if `uri.ts` becomes unwieldy)

If `uri.ts` remains too large after refactor, carve out small internal modules:

- `packages/common/semantic-web/src/uri/internal/errors.ts`
  - constructors/helpers for `ParseIssue` (anchoring issues to `ast` when in schemas)
- `packages/common/semantic-web/src/uri/internal/options.ts`
  - deterministic default option sets for URI vs IRI schema decoding

This is not required for correctness, but matches Effect conventions (public surface thin; helpers internal).

