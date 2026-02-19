# Schema Utilities and Patterns (In-Repo)

This note summarizes Schema-first utilities/patterns already present in the repo that are directly applicable to implementing URI/IRI as `S.Class` plus `URIFromString` / `IRIFromString` using `S.transformOrFail`. It focuses on copyable patterns and why they exist, without proposing any new API design.

## Relevant Schema Utilities in `packages/common/schema`

### Domain name primitives
File: `packages/common/schema/src/primitives/network/domain.ts`

Patterns to reuse:
1. **`S.Class`-style “named primitive” with `S.pipe`**:
   - `DomainLabel`, `TopLevelDomain`, `DomainName` are `class extends S...pipe(...)`.
   - They use string hygiene (`S.lowercased`, `S.trimmed`, `S.nonEmptyString`, length bounds) + regex `S.pattern`.
   - Why: keeps validation centralized and creates strong nominal types while remaining string-backed.
2. **Standard annotations via `$SchemaId`**:
   - `const $I = $SchemaId.create("primitives/network/domain")`, then `.annotations($I.annotations(...))`.
   - Why: makes schema identifiers and metadata consistent across the repo and supports tooling.
3. **Arbitrary generators for tests**:
   - `arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainName())`.
   - Why: patterns exist for generating valid sample values for property-based tests.

Relevance:
Use these patterns for URI/IRI string “surface” schemas (lowercased/trimmed, non-empty, bounds, regex), and for class-based nominal typing.

### IP primitives
File: `packages/common/schema/src/primitives/network/ip.ts`

Patterns to reuse:
1. **Regex-only validation with branding**:
   - `IPv4`, `IPv6` are `S.NonEmptyString.pipe(S.pattern(...), S.brand(...))`.
   - Why: pure string semantics with minimal parsing, still strongly typed.
2. **Union schema with annotations**:
   - `IP = S.Union(IPv4, IPv6).annotations(...)`.
   - Why: use union pattern for “either-or” structures.

Relevance:
If URI/IRI will be composed from sub-schemas (host forms), union is already used for “address or address” cases.

### URL primitives and `URLFromString`
File: `packages/common/schema/src/primitives/network/url.ts`

Patterns to reuse:
1. **Dual schemas: string representation and runtime object**:
   - `Url` (string) and `CustomURL` (`URL` instance).
   - Why: provides both “string-only” and “parsed runtime object” views.
2. **`S.transformOrFail` for string ⇄ object**:
   - `URLFromString = S.transformOrFail(S.String, CustomURL, { ... })`.
   - Why: demonstrates exact repo-standard for parsing a string into an object and encoding back to string.

Key `URLFromString` implementation details to copy:
1. **`strict: true`**:
   - Ensures the input exactly matches the schema without implicit conversions.
2. **`ParseResult.try` wrapper**:
   - `decode: (s, _, ast) => ParseResult.try({ try: () => new URL(s), catch: () => new ParseResult.Type(ast, s, "Invalid URL string") })`.
   - Why: centralizes try/catch in `ParseResult` and ties failures to the provided `ast`.
3. **Encode path**:
   - `encode: (url) => ParseResult.succeed(url.toString())`.
   - Why: idempotent encode behavior for stable representation.

Relevance:
This is the closest in-repo analog to “URIFromString/IRIFromString”, including `strict: true`, `ParseResult.try`, and `ParseResult.Type`.

## Semantic-web Local Utilities

File: `packages/common/semantic-web/src/uri/model.ts`

Patterns to reuse:
1. **`S.Class` with shared regex schema**:
   - `URIRegExps` is `S.Class<URIRegExps>(...)` and uses `BS.Regex` for each field.
   - Why: centralizes regex definitions in a typed object and makes them schema-backed.

Relevance:
`URIRegExps` already models regex structure as a schema class; for URI/IRI parsing, you can reuse this structure to keep regex definitions validated and discoverable, and to follow the project’s `S.Class` conventions.

## Concrete `S.transformOrFail` Examples (With Pattern Explanation)

### URLFromString
File: `packages/common/schema/src/primitives/network/url.ts`

Pattern:
1. **Source schema**: `S.String`
2. **Target schema**: `CustomURL` (an `URL` instance type)
3. **`strict: true`**: exact string input (no implicit coercion).
4. **`decode`**:
   - Uses `ParseResult.try` with a `new URL(s)` call.
   - On failure, constructs `new ParseResult.Type(ast, s, "Invalid URL string")`.
   - `ast` is provided by the `transformOrFail` callback and is used as the error anchor.
5. **`encode`**:
   - Returns `ParseResult.succeed(url.toString())`.

Why it’s relevant:
This is a minimal, correct pattern for “string → parsed object” with a single point of failure and consistent error construction.

### LocalDateFromString
File: `packages/shared/domain/src/value-objects/LocalDate.ts`

Pattern:
1. **Source schema**: `S.String` (with annotations)
2. **Target schema**: `LocalDate` (`S.Class`)
3. **`strict: true`**.
4. **`decode`**:
   - Parses string with regex and `Option` combinators.
   - On failures, returns `Effect.fail(new ParseResult.Type(ast, dateString, "..."))`.
   - Additional semantic validation (month/day) also emits `ParseResult.Type` using the same `ast`.
5. **`encode`**:
   - Uses `Effect.succeed` to return a string.

Why it’s relevant:
Shows multi-step validation in `decode` and uses `ParseResult.Type` for semantic errors (not only parsing exceptions).

### EncryptedStringFromPlaintext
File: `packages/shared/domain/src/services/EncryptionService/schemas.ts`

Pattern:
1. **Source schema**: `S.String`
2. **Target schema**: `EncryptedPayload`
3. **`strict: true`**.
4. **`decode`**:
   - Runs an effectful operation, then uses `Effect.mapError` to return `new ParseResult.Type(ast, plaintext, "...")`.
5. **`encode`**:
   - Performs effectful decryption and maps error to `ParseResult.Type(ast, payload, "...")`.

Why it’s relevant:
Shows how to wrap effectful transformations, and how to map domain errors into `ParseResult.Type` with `ast` in the transform layer.

## Notes on `strict: true`, `ParseResult` and `ast` Threading

Observed patterns:
1. **`strict: true`** is explicitly set in all transform-based schemas referenced:
   - `URLFromString`, `LocalDateFromString`, `EncryptedStringFromPlaintext` (and all related encrypt/decrypt transforms).
2. **`ParseResult.Type(ast, ...)` is the standard error constructor**:
   - Used for invalid input, semantic validation errors, and effectful failures.
   - Examples:
     - `URLFromString`: `ParseResult.Type(ast, s, "Invalid URL string")`
     - `LocalDateFromString`: `ParseResult.Type(ast, dateString, "...")`
     - `EncryptedStringFromPlaintext`: `ParseResult.Type(ast, plaintext/payload, "...")`
3. **`ParseResult.try` is used when the main failure mode is a JS exception**:
   - `URLFromString` uses `ParseResult.try({ try: ..., catch: () => new ParseResult.Type(ast, s, "...") })`.
4. **Where `ast` comes from**:
   - In `transformOrFail`, the callback signature `(input, _, ast)` provides the `ast`.
   - The repo consistently threads this `ast` into `ParseResult.Type` so error reporting and tracing stay attached to the transform schema.
   - Example usage appears in `URLFromString` and `LocalDateFromString`.

## What This Enables (Without Proposing APIs)

Copyable patterns from this repo already cover:
1. **Nominal schema classes** for string-based identifiers (`DomainName`, `Url`, `URIRegExps`).
2. **Structured transforms** from strings to richer runtime types (`URLFromString`).
3. **Semantic validation with precise error types** (`LocalDateFromString`).
4. **Effectful transform patterns** with standardized error mapping (`EncryptedStringFromPlaintext`).

These patterns are sufficient as references for implementing URI/IRI primitives in the same style as existing schema utilities.
