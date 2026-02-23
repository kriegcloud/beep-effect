# Effect module design conventions to mirror

## Public surface vs internal helpers
- Public modules expose a stable API of `types`, `symbols`, `models`, `constructors`, and `refinements` (`ParseResult.ts`, `Encoding.ts`, `Brand.ts`).
- Internal logic is kept in `internal/*` and is re-exported only via public constructors/refinements (see `Encoding.ts` vs `internal/encoding/common.ts`).
- Pattern: public file defines `TypeId` symbols, interfaces, constructors, and `isX` refinements; internal file holds low-level implementations and unique symbol instantiation.

## Naming conventions and export shape
- Symbols: `XTypeId` (unique symbol) and matching `type XTypeId` alias.
- Errors: `XError` or `XException` interfaces with `_tag`, plus constructor `XError(...)`/`XException(...)` and refinement `isXError`/`isXException`.
- Constructors: `succeed`, `fail`, `try`, `fromOption` for `ParseResult`, `encode*` / `decode*` for `Encoding`.
- Guards/refinements: `isX` functions, and `Brand` provides `option`, `either`, `is` on constructors.

## Error surface choices
- `ParseIssue` is used for schema-level failures; it is a structured, composable error tree that can be formatted (`TreeFormatter`, `ArrayFormatter`).
- `ParseError` is a tagged error wrapper *only* used by throwing sync APIs. It is not returned from `decodeUnknown` or `encodeUnknown` (those return `Effect`/`Either` with `ParseIssue`).
- `Encoding` uses checked exceptions (`DecodeException`, `EncodeException`) in `Either`, not thrown exceptions. This makes it easy to map to `ParseIssue` in schema transforms.

## Purity boundaries (Either internally, Effect at the edge)
- Internal parse logic uses `Either` aggressively and only upgrades to `Effect` when required (e.g., effectful message annotations or effectful transformations). `ParseResult.map`, `flatMap`, `mapError` are optimized to operate on `Either` without allocating `Effect` (`ParseResult.ts`).
- Sync APIs (`decodeSync`, `encodeSync`, `validateSync`) will attempt to execute effects and fail with `Forbidden` for async/defect paths. This keeps effectful schemas safe but predictable at sync boundaries (`ParseResult.ts`).
- Effectful decoders/encoders are explicit: `decodeUnknown` / `encodeUnknown` set `isEffectAllowed` so effectful transforms can run, while sync variants reject async work.

## Modules to mirror structure from
- `ParseResult.ts`: clean separation of error model, constructors, formatter utilities, and parser plumbing; highlights the “Either internally, Effect at the edge” rule.
- `Encoding.ts`: public module exposes `Either`-based API with `DecodeException`/`EncodeException`, backed by `internal/encoding/*` implementation.
- `Brand.ts`: clear symbol/type-id pattern, namespace for related types, and constructor surface with `option`/`either`/`is` helpers. The namespace pattern keeps model types clustered without polluting the top-level exports.

## Practical conventions to reduce maintenance risk
- Keep internal details in `internal/*` and expose a small, stable surface of constructors and refinements.
- Prefer `Either` for pure, fast paths and lift to `Effect` only when necessary. This keeps parse logic deterministic and easier to test.
- When adding new error types, follow the `TypeId` + constructor + `isX` refinement pattern so downstream callers can safely discriminate errors without relying on string matching.
- Avoid throwing in core logic; use `Either`/`Effect` and let sync wrappers (`*Sync`) be the only throwers.
