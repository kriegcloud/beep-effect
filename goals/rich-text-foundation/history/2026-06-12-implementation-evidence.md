# Implementation evidence — 2026-06-12 (claude)

## What landed

- `@beep/lexical-schema` (`packages/foundation/modeling/lexical`), scaffolded
  via `bun run beep create-package lexical-schema --type library --family
  foundation --kind modeling --dir-name lexical` (after a one-line fix to
  `CreatePackage/Handler.ts` — the identity-registry updater expected
  `const composers = $I.compose(...)` but `packages.ts` had been refactored to
  `generatedComposers`; the updater now targets `generatedComposers` with a
  `composers` fallback).
  - `src/Lexical.model.ts` — v1 node union (text/tab/linebreak, root,
    paragraph, heading, quote, list/listitem, link, code, artifact-ref),
    `SerializedEditorState`, `EditorStateFromJson`, plain-text projection.
    Options at the boundary; hand-written `Type`/`Encoded` namespaces; tags
    only on concrete leaf classes. Zero runtime `lexical` imports (verified:
    `grep -rn 'from "lexical"\|from "@lexical' src/` → type-only hits none in
    runtime position).
  - `src/Lexical.codec.ts` — `documentToEditorState`/`blockToLexical` and
    `editorStateToDocument`/`nodeToBlocks` with the locked lossiness profile
    (documented in the package README).
  - `dtslint/Lexical.tst.ts` — 32 tstyche assertions pinning encoded shapes
    to `lexical` 0.45 serialized types (devDependency, type-only).
- `@beep/editor` (`packages/foundation/ui-system/editor`): `EditorViewer`,
  `EditorComposer` (history/list/check-list/link/markdown-shortcut plugins),
  `editorNodes` (CodeHighlightNode intentionally unregistered to keep the
  schema wire profile), `editorTheme` re-export, runtime `ArtifactRefNode`
  decorator pinned to the schema's encoded contract.
- `apps/storybook`: `Editor/EditorViewer` + `Editor/EditorComposer` stories
  hosted from `packages/foundation/ui-system/editor/stories/`; host deps +
  `tsconfig.stories.json` paths/references extended.

## Codec profile decision (lossiness check)

Run as `test/Lexical.codec.test.ts`. Md inline marks ↔ Lexical format bits
bold=1/italic=2/strikethrough=4/code=16. Dropped Lexical → Md: alignment,
indent, direction, underline(8)/sub(32)/sup(64)/highlight(128)/casing bits,
inline styles, NodeState, nested-list depth (flattened). Degraded Md →
Lexical: RawMarkdown/RawHtml → text, Img → link, Hr → `---` paragraph, bare
Li → paragraph. Normalizations: mark nesting canonicalizes to
Strong > Em > Del; multi-block quotes flatten to one linebreak-separated
paragraph. `artifact-ref` ↔ Md paragraph wrapping one `artifact://<id>` link.

## Verification runs (all green)

| Check | Command | Result |
| --- | --- | --- |
| Schema typecheck | `bunx tsgo -b tsconfig.json` (modeling/lexical) | clean |
| Schema tests | `bun run beep:test` | 12/12 passed |
| Schema dtslint | `bun run dtslint` | 32/32 assertions |
| Schema lint | `bun run beep:lint` | clean |
| Editor check | `bun run beep:check` (ui-system/editor) | clean |
| Editor test (headless lexical round-trip incl. artifact-ref) | `bun run beep:test` | 1/1 passed |
| Storybook typecheck | `bun run beep:check` (apps/storybook) | clean |
| Storybook play tests (full suite) | `bun run test:storybook` | 464/464 passed (72 files) |
| Fixture-turn render proof | `bunx vitest run --config vitest.storybook.config.ts ... editor-viewer editor-composer` | `editor-viewer.stories.tsx > Assistant Turn` ✓ (chromium; asserts heading, link, bold run, artifact-ref chip renders as decorator, not link) |
| Repo exports catalog | `bun run repo-exports:catalog` | packages=97, both new packages sharded |

## Schema-first policy round (first `yeet verify` findings, all fixed)

The first full `yeet verify` failed on `schema-first-policy` findings:

- `@beep/editor` exported pure-data/callback props interfaces
  (`EditorViewerProps`, `EditorComposerProps`) — made non-exported (consumers
  use `React.ComponentProps`); matches the `@beep/ui` convention of
  non-exported props types.
- Both `@beep/lexical-schema` test files were "schema-heavy without
  schema-derived property coverage" — added `S.toArbitrary`/fast-check
  property tests: encode∘decode identity over arbitrary `LexicalNode` /
  `SerializedEditorState`, and `editorStateToDocument` totality (arbitrary
  states project onto schema-valid Md documents). Tests now 14/14.
- `@beep/repo-cli` had a stale inventory entry for the (pre-existing,
  user-modified) `test/tsconfig-sync.test.ts` — refreshed via
  `bun run beep lint schema-first --write` and moved to a documented
  `exception` (CLI JSON-boundary plumbing), mirroring the adjacent
  `reuse-command`/`docgen` exceptions.

`bun run beep lint schema-first` now reports 0 advisories. The first run also
hit the known stale-`.beep/fallow`-envelope failure (cleared and re-ran).

## Second `yeet verify` round (misattributed packet, two real failures)

The re-run failed with a packet blaming `dual-arity`, but that lane passed —
the yeet failure-hint scanner picked the last recognizable sub-lane marker in
a 512 KB-truncated step log. The real failures, found in
`.beep/yeet/logs/full_01-pre-push.log`:

1. `@beep/identity:lint` — `create-package` appended the new registry
   segments unformatted (`"uspto", "lexical-schema"` on one line); fixed with
   the package's `lint:fix`.
2. `check:tsgo:tests` — the **pre-existing, user-modified**
   `packages/tooling/tool/cli/test/tsconfig-sync.test.ts` required
   `Stdio | Terminal` (introduced by the in-flight TsconfigSync command
   changes) without providing them. Additive fix following the
   `docgen.test.ts` precedent: merge `NodeServices.layer` into the test's
   `PlatformLayer`. Runtime tests (7/7) and `bun run beep quality test-tsgo`
   now pass.

## Third round: fallow lanes + generated-artifact resync

Run 4 (full log captured) surfaced fallow audit/dead-code findings and stale
generated configs; all resolved:

- **Story files as entries**: added
  `packages/foundation/ui-system/*/stories/**/*.stories.tsx` to `.fallowrc.jsonc`
  `entry` (story files are tool-loaded roots via the storybook glob).
- **Dependency hygiene**: story dependencies moved to the owning package
  (`@beep/editor` devDeps gain `@beep/md`, `storybook`,
  `@storybook/react-vite`, mirroring `@beep/ui`); the four deps I had added to
  `apps/storybook` were removed; unused `@beep/identity` removed from
  `@beep/editor`.
- **dtslint type-only deps**: `lexical` + `@lexical/{code,link,list,rich-text}`
  added to `.fallowrc.jsonc` `ignoreDependencies` with a comment — dtslint/**
  is path-ignored so fallow cannot see the type-only conformance imports.
- **User's staged OTel deps** (`@opentelemetry/{resources,sdk-trace-node,sdk-trace-web}`
  added in the user's `saving` commit with no source usage yet): ignore-listed
  with a dated comment instead of touching their in-flight work.
- **Duplication**: the editor headless test no longer clones the schema test's
  hand-written wire fixture — it now builds its fixture through the real
  Md → `documentToEditorState` → encode pipeline (better proof, no clone).
- **Complexity**: my branchy model-test callback was rewritten branch-free
  (`toMatchObject`); the pre-existing 377-line `CreatePackage/Handler.ts`
  handler (cyclomatic 67, flagged only because the one-line registry fix put
  the file in the diff) got fallow's sanctioned
  `// fallow-ignore-next-line complexity` with a debt note.
- **Generated configs resynced** in dependency-stable order: `tsconfig-sync
  --write`, `fallow:boundaries:write`, `lint schema-first --write` (then
  re-applying the exception status `--write` clobbers), `repo-exports:catalog`
  last.

Probes after repairs: fallow audit `introduced=0` (exit 0), fallow dead-code
`findingCount=0` (exit 0), schema-first 0 advisories, both packages' tests and
checks green, storybook checks green.

## Fourth round: static-lane stragglers (all fixed and probed green)

- `laws effect-imports`: `Lexical.codec.ts` had two stable-module imports in
  root form — auto-fixed with `--write` (now `effect/Effect` etc. namespace
  imports), check exits 0.
- `lint:deprecated-apis` eslint: editor stories weren't matched by
  `allowDefaultProject` (the glob was ui-specific, and tseslint rejects `**`
  there) — generalized to
  `packages/foundation/ui-system/*/stories/*.stories.tsx` plus the existing
  ui `stories/components` glob in
  `packages/tooling/policy-pack/repo-configs/src/eslint/DeprecatedApisESLintConfig.ts`.
- docgen `<module fileoverview> missing @since`: docgen reads the file's
  FIRST comment as the module fileoverview — `"use client"` was hiding the
  doc blocks in `viewer.tsx`/`composer.tsx` (moved the `@packageDocumentation`
  blocks above the directive, which bundlers accept) and the `// cspell:ignore`
  line had displaced the fileoverview in `nodes.ts` (folded the directive into
  the doc block).
- cspell: `Klass` (lexical's exported type) ignored inline, mirroring
  `@beep/ui`'s editor-00 `nodes.ts`.

## Storybook proof detail

`stories/editor-viewer.stories.tsx` builds the fixture assistant turn as
md-core blocks (`@beep/md` AST: h2, paragraph with strong + link, quote,
typescript code fence, task list, bullet list, artifact-ref paragraph), lifts
it through `documentToEditorState`, and renders `EditorViewer`. The play
assertions run in real chromium via the storybook vitest addon.
