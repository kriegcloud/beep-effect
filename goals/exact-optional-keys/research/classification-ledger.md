# Classification ledger — `UndefinedOr` exceptions

Each field kept as `S.optionalKey(S.UndefinedOr(X))` (or its `Option`
equivalent) needs evidence here: who produces the undefined-valued key, and the
test or probe that proves it. Everything else migrated to the exact form.

## Exceptions kept

| File:field | Producer of `undefined` | Evidence | Spelling |
| --- | --- | --- | --- |
| `lexical/src/Lexical.model.ts` `CodeNode.theme` | `@lexical/code-core` `CodeNode.exportJSON()` writes `theme: this.getTheme()` | `node_modules/@lexical/code-core/dist/LexicalCodeCore.dev.mjs:464`; 128 `@beep/editor` `style-node-matrix` cases failed `Expected string at ["root"]["children"][0]["theme"]` after the plain rewrite | `OptionFromLexicalUndefinedOr` |
| `Lexical.model.ts` `ListItemNode.checked` | `@lexical/list` `ListItemNode.exportJSON()` writes `checked: this.getChecked()` (`undefined` outside check lists) | `LexicalList.dev.mjs:750` | `OptionFromLexicalUndefinedOr` |
| `Lexical.model.ts` `TableCellNode.width` | `@lexical/table` `TableCellNode.exportJSON()` writes `width: this.getWidth()` | `LexicalTable.dev.mjs:144` | `OptionFromLexicalUndefinedOr` |
| `Lexical.model.ts` `TableNode.colWidths` | `TableNode.exportJSON()` writes `colWidths: this.getColWidths()` | `LexicalTable.dev.mjs:4602` | `OptionFromLexicalUndefinedOr` |
| `Lexical.model.ts` `TableNode.frozenColumnCount`, `frozenRowCount`, `rowStriping` | `TableNode.exportJSON()` writes `x ? x : undefined` | `LexicalTable.dev.mjs:4603-4605` | `OptionFromLexicalUndefinedOr` |
| `api-transport/src/Transport.ts` `ApiTransportDurationObject` (8 keys) | Mirrors effect's `Duration.DurationObject`, declared `weeks?: number \| undefined` etc.; a value typed against `Duration.Input` may hold `undefined` | `node_modules/effect/dist/Duration.d.ts:141`; `Transport.test.ts` "preserves every legacy transport option input accepted by Effect Duration" (`window: { seconds: undefined }`) | `S.optionalKey(S.UndefinedOr(X))` |

`OptionFromLexicalUndefinedOr(X)` is
`X.pipe(S.UndefinedOr, S.optionalKey, S.decodeTo(X.pipe(S.toType, S.Option), SchemaTransformation.optionFromOptional()))`,
the explicit form of upstream `S.OptionFromOptional`. Its companion
`CodeNode.Encoded` (and the other six) keep `| undefined` on those keys.

## Classified as exact (no exception)

| File:field | Why no exception |
| --- | --- |
| `Lexical.model.ts` `QuoteNode.shadowRoot` | NodeState: default `false` is not serialized (`LexicalRichText.dev.mjs:358-363`) |
| `Lexical.model.ts` `TableCellNode.colSpan`, `rowSpan`, `verticalAlign`; `TableRowNode.height` | always numbers, or spread conditionally (`LexicalTable.dev.mjs:137-143`, `:414`) |
| `github` `GitHubIssue` comment `body` | GitHub sends a missing body as `null` (already `NullOr`); the fixture's getter returning `undefined` was unrealistic |
| `github` `Ruleset.list` `source_type`, `GitHubClient.makeClientShape` options, `infra` `AccountCostControls` | in-repo construction sites; now `O.getSomesStruct({ k: O.fromUndefinedOr(v) })` |
| `yaml` `RequoteScalarInput.tag` / `anchor` | `YamlFormat.collectionShell` already strips undefined through `definedFields` |
| `schema-org` all node fields | Documented package exception (constructor convenience), but no src caller in the repo passes `undefined` (repo-wide typecheck after the rewrite); exception withdrawn |
| `jsonl` `JournalConfig`, `Slice`, `CursoredSlice` keys | Upstream-parity choice (D15), not a producer; recorded as kept deviation 24 in the package README |
| `schema` `FileDiff` `file` / `patch` (`optionalUndefined` helper) | The helper existed only to admit decoded-side `undefined`; deleted |

## Tests that pinned the old contract (inverted to pin rejection)

`commands` `Run.test.ts`, `ScriptedSpawner.test.ts`; `github` `CodeScanning.test.ts`,
`Ruleset.test.ts`, `GitHubIssue.coverage.test.ts`; `jsonl` `JournalDeviations.test.ts`,
`Properties.test.ts`, `jsonl.test.ts`; `schema-org` `nodes.test.ts`,
`Conformance.test.ts`, `JsonLdDocument.test.ts`; `schema` `FileDiff.test.ts`; `yaml`
`requote.round-3.test.ts`; `repo-cli` `quality-tmpfs-render.test.ts`.
