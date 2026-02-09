# File Layout: IDNA Rewrite

## Target Module Layout

Keep the existing entrypoints but move algorithm details behind an internal boundary.

### Public entrypoints

- `packages/common/semantic-web/src/idna/index.ts`
  - Re-export `IDNA` (class), `IDNAFromString` (schema).
  - Default export `IDNA` (compat value).

- `packages/common/semantic-web/src/idna/idna.ts`
  - Public `IDNA` class definition (Schema.Class).
  - Public schema `IDNAFromString`.
  - Named wrapper exports matching prior names for migration convenience.

### Internal implementation

- `packages/common/semantic-web/src/idna/internal/ucs2.ts`
  - `ucs2decode`, `ucs2encode` helpers (pure).

- `packages/common/semantic-web/src/idna/internal/punycode.ts`
  - `encode` / `decode` algorithm.
  - Pure core that returns `ParseResult.ParseResult<string>` (no throws).
  - Error message mapping table for `overflow` / `invalid-input` / `not-basic`.

- `packages/common/semantic-web/src/idna/internal/domain.ts`
  - `toASCII` / `toUnicode` domain + email handling.
  - Separator normalization (`.` + U+3002 / U+FF0E / U+FF61) parity with current tests.
  - Uses `punycode` functions and keeps failures as `ParseIssue`.

Notes:
- The existing `errors.ts` and `model.ts` are removed as part of the rewrite (replaced by `ParseResult` + `IDNA` S.Class).
- Keep internal names close to the original algorithm so diffs are reviewable and the tests remain meaningful.

