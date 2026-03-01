# JSDoc Exhaustiveness Audit Report

Date: 2026-03-01

## Confidence Model

This audit now uses a two-layer trust model:

1. Deterministic snapshot parity (default CI-safe run)
2. Live upstream drift verification (manual/explicit run)

The validator enforces all of the following simultaneously:

- canonical tag/name integrity (`_tag` uniqueness and synonym collision detection)
- TypeScript `SyntaxKind` JSDoc tag mapping integrity
- `HasJSDoc` mapping integrity (`64/64`, zero `any`)
- canonical source-list coverage across five specs
- strict per-spec attribution across five specs
- canonical-list parity against committed source snapshots
- optional live drift check against current upstream source content

## Canonical Source Sets

- JSDoc 3: `67`
- TSDoc: `25`
- TypeScript JSDoc (Primary + Addenda): `25`
- Closure: `39`
- TypeDoc: `51`

## Authoritative Sources

- JSDoc: <https://jsdoc.app/index.html>
- TSDoc tags: <https://tsdoc.org/pages/tags/alpha/>
- TypeScript JSDoc primary: <https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/documentation/copy/en/javascript/JSDoc%20Reference.md>
- TypeScript addenda: <https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/documentation/copy/en/release-notes/TypeScript%205.0.md>
- Closure tags: <https://raw.githubusercontent.com/wiki/google/closure-compiler/Annotating-JavaScript-for-the-Closure-Compiler.md>
- TypeDoc tags: <https://typedoc.org/documents/Tags.html>

## Snapshot Artifact

Committed snapshot file:

- `specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/source-tag-snapshots.json`

Each source entry includes:

- `url`
- `retrievedAt`
- `contentSha256`
- `rawTags`
- `normalizedTags`
- `normalizationRulesVersion`
- `extractionStrategy`

TypeScript snapshot additionally records explicit addenda provenance via `addendaSources`.

## Normalization Policy

- JSDoc: normalize `inline-link -> link`, `inline-tutorial -> tutorial`
- TSDoc: normalize slug casing (`defaultvalue -> defaultValue`, `inheritdoc -> inheritDoc`, etc.)
- TypeScript: normalize aliases (`arg`/`argument -> param`, `return -> returns`) and include explicit addenda tags (`overload`)
- Closure: use first heading tag from each `### \`@tag\`` section
- TypeDoc: include canonical `_tag` pages (`Tags._*.html`) only

## Re-Run Commands

Deterministic validator:

```bash
bun run audit:jsdoc-exhaustiveness
```

Refresh committed source snapshot intentionally:

```bash
bun run audit:jsdoc-exhaustiveness:refresh-snapshot
```

Live drift verification against upstream sources:

```bash
bun run audit:jsdoc-exhaustiveness:live
```

## Expected Deterministic Output Summary

```text
- Coverage JSDoc3: 67/67
- Coverage TSDoc: 25/25
- Coverage TypeScript: 25/25
- Coverage Closure: 39/39
- Coverage TypeDoc: 51/51
- Specification Attribution JSDoc3(jsdoc3): 67/67
- Specification Attribution TSDoc(tsdoc-*): 25/25
- Specification Attribution TypeScript(typescript): 25/25
- Specification Attribution Closure(closure): 39/39
- Specification Attribution TypeDoc(typedoc): 51/51
- Snapshot Parity JSDoc3: 67/67
- Snapshot Parity TSDoc: 25/25
- Snapshot Parity TypeScript: 25/25
- Snapshot Parity Closure: 39/39
- Snapshot Parity TypeDoc: 51/51
```

PASS indicator:

```text
PASS: 100% exhaustive baseline and parity checks passed.
```
