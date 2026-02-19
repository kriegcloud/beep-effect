# Docs Checklist: IDNA Rewrite

## Package Docs

- [x] Added `packages/common/semantic-web/README.md` with an **IDNA** section:
  - Effect API example (`IDNA.toASCII`)
  - Sync `*Result` example (`IDNA.toASCIIResult`)
  - Schema example (`IDNAFromString`)

## API Docs (Docgen / JSDoc)

- [x] Expanded module header comment in `packages/common/semantic-web/src/idna/idna.ts` with runnable examples:
  - Effect usage
  - Schema usage

## Consumer Notes

- [x] Synchronous consumers updated to use `*Result` APIs (no `Effect.runSync` in library code):
  - `packages/common/semantic-web/src/uri/uri.ts`
  - `packages/common/semantic-web/src/uri/schemes/mailto.ts`

## Follow-ups (Optional)

- [ ] Add a short “Migration” subsection documenting the return-type change of `toASCII/toUnicode` (string -> Effect) if external consumers exist.

