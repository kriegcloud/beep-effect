---
"@beep/data": minor
"@beep/schema": minor
"@beep/md": minor
"@beep/file-processing": minor
"@beep/pandoc-ast": patch
"@beep/lexical-schema": patch
"@beep/repo-configs": patch
"@beep/libpff": patch
"@beep/professional-desktop": patch
---

Automate official dataset → TypeScript sync and expose schema-first consumers.

Add a `sync-data-to-ts` CLI backend that fetches and content-pins official
datasets (ISO 4217 currencies, IANA media types, IANA tzdb timezones, and
Unicode CLDR territories/continents), generates the raw datasets in `@beep/data`,
and exposes schema-first consumers in `@beep/schema`: `CurrencyCode`,
`CurrencyName`, `MimeType`, an expanded `Timezone`, `TerritoryCode`/
`TerritoryName`, `CountryCode`/`CountryName`, and `ContinentCode`/
`ContinentName` (LiteralKit and reversible MappedLiteralKit codecs over the
generated enumerations).

Markdown sync reports render through `@beep/md`/`@beep/pandoc-ast`, the
file-processing service layer now threads an `effect/Crypto` requirement for
content hashing, and `@beep/schema`'s SHA-256 helper moves to a named
`Effect.fn`.
