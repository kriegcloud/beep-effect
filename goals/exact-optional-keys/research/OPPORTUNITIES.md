# Opportunities — friction receipts

## 2026-10-23 — fallow audit counts codemod rename-only drift as introduced duplication

- Doing: publishing the mechanical `exact-optional-keys` migration (106 files,
  identifier rename `optional` -> `optionalKey`).
- Evidence: `bun run beep yeet publish` cheap gate `fallow:audit` red with
  `findingAttributionSummary.introduced = 19`, all `fallow:audit:duplication`.
  The 19 clone groups span 43 files; 0 of them were edited by hand, and the 33
  the branch touches changed only in the codemod commit `9e3aff5de8`. The
  clones pre-date the branch (e.g. the 25-site
  `S.Array(X).pipe(S.withConstructorDefault(...A.empty()), S.withDecodingDefaultKey(...A.empty()))`
  idiom, repeated `Laws.command.ts` wiring).
- Outcome: operator chose push + S11 attribution over ~90 reasoned
  suppressions.
- Would have prevented it: a fallow audit attribution mode (or yeet gate rule)
  that classifies a clone group as inherited when every changed line inside
  it is a same-length identifier rename recorded by a registered codemod
  report (`research/codemod-write.jsonc` lists every site).
- Follow-up: dedupe the empty-array-default idiom behind a named
  `@beep/schema` helper and collapse the `Laws.command.ts` repetition.
