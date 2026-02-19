# Schema Utilities and Patterns (IDNA refactor inputs)

This note collects proven in-repo patterns for Schema-first string modeling and `S.transformOrFail` usage. It is intentionally descriptive and avoids proposing the final IDNA API.

## Schema-first string patterns in `packages/common/schema`

### Branded string patterns

- Encoded → branded → redacted layering pattern (email example):
  - `EmailEncoded` validates lowercase + trimmed + non-empty + regex, then `EmailBase` brands with `S.brand("Email")`, then `Email` wraps with `S.Redacted` for PII-safe runtime handling. This gives a strict encoded representation, a nominal string for type safety, and a redacted runtime type. `packages/common/schema/src/primitives/string/email.ts`
- Branded primitives with `S.brand` over a validated base:
  - `Slug` uses `SlugBase` (pattern + examples) and brands it. `packages/common/schema/src/primitives/string/slug.ts`
  - `HexColor`, `SemanticVersion`, `Phone`, `PasswordBase`, `IPv4/IPv6`, etc. follow the same pattern. `packages/common/schema/src/primitives/string/hex.ts`, `packages/common/schema/src/primitives/string/semantic-version.ts`, `packages/common/schema/src/primitives/string/phone.ts`, `packages/common/schema/src/primitives/network/ip.ts`
- Domain and URL strings are modeled as refined strings without extra brand for each component, but still use `S.brand` for full URL types (e.g., `Url`, `CustomURL`). `packages/common/schema/src/primitives/network/domain.ts`, `packages/common/schema/src/primitives/network/url.ts`
- Shared brand helpers for ad-hoc branding in helper functions:
  - `makeBranded<Brand, Type>(value)` and `brand<Type>(value)` centralize casting to `effect/Brand` types. `packages/common/schema/src/core/utils/brands.ts`

### String annotation conventions (title/description/examples)

- Most primitives attach metadata through `S.annotations({...})` or `.annotations($I.annotations("...", {...}))` to keep a stable identifier and consistent docs:
  - Example: `URLFromString` adds `description` and `jsonSchema` under `$I.annotations("URLFromString", ...)` and merges other annotations. `packages/common/schema/src/primitives/network/url.ts`
  - Example: `SlugBase` and `Slug` provide `description` and `examples` for documentation and test data. `packages/common/schema/src/primitives/string/slug.ts`
- The schema identity helper `$SchemaId` is used to generate a stable identifier string for annotations:
  - `const $I = $SchemaId.create("primitives/network/url");` and then `$I.annotations("URLFromString", {...})`. `packages/common/schema/src/primitives/network/url.ts`
- The doc annotation helper `makeBrandedExamples` is used to cast example values to branded types when needed for `examples`. `packages/common/schema/src/core/annotations/example-annotations.ts`
- Default annotation symbols (field name, UI config, etc.) are in core annotations. These are used via `S.annotations({ [BSFieldName]: "..." })` etc. `packages/common/schema/src/core/annotations/default.ts`

### URL/domain/email related schemas (relevant to IDNA handling)

- URL parsing and string validation:
  - `CustomURL` validates `URL` instances, then `URLFromString` uses `S.transformOrFail` to parse strings into `URL` objects. `packages/common/schema/src/primitives/network/url.ts`
  - `Url`, `HttpUrl`, `HttpsUrl`, and `URLString` use regex/`new URL(...)` parsing for safe URL strings. `packages/common/schema/src/primitives/network/url.ts`
- Domain primitives:
  - `DomainLabel`, `TopLevelDomain`, `DomainName` are defined with lowercase/trimmed/length/regex validation. `packages/common/schema/src/primitives/network/domain.ts`
  - Regexes include `hostname`, `domain`, `domain_label`, and `top_level_domain` definitions. `packages/common/schema/src/internal/regex/regexes.ts`
  - A static list of TLDs exists in `tld.ts` (useful if IDNA handling needs a known list). `packages/common/schema/src/primitives/url/tld.ts`
- Email primitives:
  - `EmailEncoded`, `EmailBase`, `Email`, and `EmailFromCommaDelimitedString` show how validation + branding + redaction + transformation are composed. `packages/common/schema/src/primitives/string/email.ts`
  - Regexes include `idnEmail`/`unicodeEmail` for IDN-friendly validation. `packages/common/schema/src/internal/regex/regexes.ts`

## Concrete `S.transformOrFail` patterns to copy

### URLFromString (`packages/common/schema/src/primitives/network/url.ts`)

Pattern summary:
- `S.transformOrFail(S.String, CustomURL, { strict: true, decode, encode })`
- `decode` uses `ParseResult.try` to wrap a `new URL(...)` call.
- On failure it constructs `new ParseResult.Type(ast, input, "...")`.
- `encode` returns `ParseResult.succeed(url.toString())`.

Why it matters:
- Demonstrates `ParseResult.try` for exception-driven parsing and a clear error path using `ParseResult.Type` tied to the schema AST.

How `ast` is threaded:
- `ast` is the 3rd argument of `decode` in `transformOrFail`. It comes from the transform schema’s AST and is passed through by Effect Schema so `ParseResult.Type(ast, ...)` attaches the error to the correct node.

### LocalDateFromString (`packages/shared/domain/src/value-objects/LocalDate.ts`)

Pattern summary:
- `S.transformOrFail(S.String.annotations({...}), LocalDate, { strict: true, decode, encode })`
- `decode` uses a regex match and then `Effect.fail(new ParseResult.Type(ast, ...))` for invalid shape or invalid day/month.
- `encode` returns `Effect.succeed` with formatted ISO string.

Why it matters:
- Shows a non-exception path using `Effect.fail` with `ParseResult.Type` for semantically rich validation errors.

How `ast` is threaded:
- `ast` is supplied as the 3rd argument in `decode`. It is used in every `ParseResult.Type` to tag validation failures with schema location.

### EncryptedStringFromPlaintext (`packages/shared/domain/src/services/EncryptionService/schemas.ts`)

Pattern summary:
- `S.transformOrFail(S.String, EncryptedPayload, { strict: true, decode, encode })`
- `decode` and `encode` are `Effect` programs that map service errors to `ParseResult.Type(ast, ...)`.
- `Effect.mapError` is used to convert domain errors to schema parse issues.

Why it matters:
- Demonstrates how to bridge effectful transformations to schema parsing and keep errors aligned with schema AST.

How `ast` is threaded:
- `ast` is passed into both `decode` and `encode` and used in `ParseResult.Type` created inside `Effect.mapError`.

### Additional in-repo `transformOrFail` patterns worth scanning (if needed)

- `EmailFromCommaDelimitedString` uses `ParseResult.fail(new ParseResult.Type(ast, ...))` and `ParseResult.succeed` directly for non-effectful transforms. `packages/common/schema/src/primitives/string/email.ts`
- `UUIDLiteralBase` shows literal ↔ UUID transforms using `ParseResult.Type` in `packages/common/schema/src/identity/entity-id/uuid.ts`.
- `JsonStringToStringArray` shows tolerant input union → normalized array with `transformOrFail`. `packages/common/schema/src/primitives/json/json.ts`

## Notes on strictness + ParseResult construction

- All three primary examples set `strict: true`, which makes the transform enforce exact shape and avoids implicit conversion behavior. This is consistent across URL parsing and LocalDate/Encryption schemas.
- Parse issues are constructed in two main ways:
  - `ParseResult.try({ try, catch: () => new ParseResult.Type(ast, input, msg) })` (exception-style parsing).
  - `Effect.fail(new ParseResult.Type(ast, input, msg))` or `ParseResult.fail(new ParseResult.Type(ast, input, msg))` (explicit error path).
- `ast` is always taken from the `decode`/`encode` signature (3rd argument) provided by `transformOrFail` and used to anchor errors to the schema node.

## Potential ambiguity to watch

- There is also a `LocalDateFromString` in `packages/common/schema/src/primitives/temporal/LocalDate.ts`. The request explicitly referenced the shared-domain one; ensure you’re copying patterns from the intended location and not mixing the two implementations.
