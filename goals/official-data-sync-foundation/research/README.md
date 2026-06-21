# Official Data Source Notes

## Decisions

- ISO 4217 uses the official SIX List One XML feed because it is the current
  machine-readable public feed used by ISO 4217 consumers.
- MIME/media type literals use the official IANA media type registry XML.
- Timezone identifiers use the official IANA tzdb data distribution and parse
  the tarball in memory.
- Country-like and continent-like literals use Unicode CLDR JSON in v1. The
  official ISO 3166 site offers up-to-date machine-readable formats through a
  paid/subscription path, so CLDR is the practical free official-ish source for
  this foundation slice.
- Schema derivation is intentionally downstream: `@beep/schema` consumes
  checked-in `@beep/data` snapshots and does no network IO.

## Source Anchors

- SIX ISO 4217 List One XML:
  `https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml`
- IANA media type registry XML:
  `https://www.iana.org/assignments/media-types/media-types.xml`
- IANA tzdb latest data tarball:
  `https://data.iana.org/time-zones/tzdata-latest.tar.gz`
- Unicode CLDR JSON releases:
  `https://github.com/unicode-org/cldr-json/releases`

## Open Follow-Ups

- Evaluate an approved ISO 3166 source if the project later obtains access to
  official paid/subscription machine-readable data.
- Consider adding generated provenance docs under `@beep/data` if consumers need
  human-readable source audits beyond JSON sidecars and sync reports.
