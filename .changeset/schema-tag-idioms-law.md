---
"@beep/repo-cli": minor
---

Add `beep laws schema-tag-idioms`, a law with no allowlist that reports the
hand-spelled schema tags PR #1943 removed: `S.Struct` with a fixed `_tag`
(use `S.TaggedStruct`), `S.Class` / `S.Error` with a fixed `_tag` (use
`S.TaggedClass` / `S.TaggedError`), and a required field fixed to one
`S.Literal(v)` (use `S.tag(v)`). It scans every git-tracked TypeScript file,
its JSDoc examples and Markdown TypeScript fences. `--check` fails on any
finding and `--json` emits the schema-shaped summary. The root
`lint:schema-tag-idioms` script runs it as a cheap-gates lane and in the medium
policy phase.
