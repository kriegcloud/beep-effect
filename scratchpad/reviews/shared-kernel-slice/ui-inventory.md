# Shared Kernel UI Inventory

Reviewed on 2026-04-27.

## Scope Summary

Reviewed the shared-kernel UI slice around `@beep/shared-ui`, specifically:

- `packages/shared/ui/src/entities/Organization/*`
- `packages/shared/ui/src/index.ts` and entity barrels
- `packages/shared/ui/test`, `packages/shared/ui/dtslint`, `package.json`, `docgen.json`, `README.md`, and `AGENTS.md`
- dependency boundaries against `@beep/shared-domain`, `@beep/schema`, and shared-kernel architecture rules
- relevant guidance in `standards/ARCHITECTURE.md`, `standards/architecture/02-shared-kernel.md`, `packages/shared/AGENTS.md`, and `packages/shared/ui/AGENTS.md`

Non-writing verification performed:

- `bun run check` from `packages/shared/ui` - passed
- `bun run test` from `packages/shared/ui` - passed, 1 file / 3 tests
- `bun run lint` from `packages/shared/ui` - passed
- `bunx tstyche --config tstyche.json packages/shared/ui/dtslint/OrganizationDisplay.tst.ts` from repo root - passed, 8 assertions
- `bunx turbo run check --filter=@beep/shared-ui --dry=json` - confirmed the package filter resolves to `@beep/shared-ui`

`bun run docgen` was not run because it regenerates docs outside this artifact's write boundary. Docgen findings below come from static review plus the existing generated docs.

## Findings

| ID | Severity | File/Line | Issue | Recommended Fix | Expected Verification |
| --- | --- | --- | --- | --- | --- |
| UI-01 | High | `packages/shared/ui/package.json:48` | Published root export points at `./dist/index.ts`, but the built package has `dist/index.js` and no `dist/index.ts`. A packed/published `@beep/shared-ui` root import would resolve to a missing file even though source-mode checks pass. | Change `publishConfig.exports["."]` to `./dist/index.js`. Consider adding an export smoke check that validates every publish export target exists after build. | `bun run build` from `packages/shared/ui`; `jq -er '.publishConfig.exports["."] == "./dist/index.js"' packages/shared/ui/package.json`; `test -f packages/shared/ui/dist/index.js`; smoke import the built root. |
| UI-02 | Medium | `packages/shared/ui/AGENTS.md:1`, `packages/shared/ui/AGENTS.md:37`, `packages/shared/ui/README.md:1`, `packages/shared/AGENTS.md:33` | Shared UI docs and agent guidance call this package `@beep/ui`, which is the foundation UI-system package in this repo. The verification commands also use `--filter=@beep/ui`, so an agent following the leaf guide would check the generic UI library instead of `@beep/shared-ui`. | Rename the shared-kernel UI references to `@beep/shared-ui`, update the README export list to include the current Organization surface, and keep any `@beep/ui` mention only as an explicit contrast with foundation UI primitives. | `rg -n '@beep/ui' packages/shared/ui packages/shared/AGENTS.md` shows no accidental shared-kernel package names; `bunx turbo run check --filter=@beep/shared-ui --dry=json` lists `@beep/shared-ui`. |
| UI-03 | Medium | `packages/shared/ui/src/entities/Organization/Organization.display.ts:29`, `:36`, `:38`, `:79`, `:81`, `:119`, `:126`, `:128` | Public JSDoc examples manufacture branded values with `as Shared.OrganizationId`, `as PosInt`, and `as Slug`. The repo JSDoc standard forbids type assertions in examples, and these examples teach callers to bypass the schema contracts that the UI package is meant to expose. | Rewrite examples to decode raw browser-safe payloads through `S.decodeUnknownSync(Display)` / `S.decodeUnknownSync(Form)` or another canonical schema constructor, with no branded casts. | `bun run docgen` from `packages/shared/ui` compiles examples without warnings; `rg -n ' as (Shared\\.OrganizationId|Slug|PosInt)' packages/shared/ui/src` returns no hits. |
| UI-04 | Low | `packages/shared/ui/src/index.ts:8` | The exported `VERSION` symbol lacks the required public export example and uses uppercase `@category Configuration`. The JSDoc standard requires `@example`, lowercase `@category`, and `@since` on exports. | Add a small compilable example for `VERSION` and change the category to a lowercase category, likely `configuration`. Review namespace re-export blocks for the same export-doc convention if docgen/lint treats them as public symbols. | `bun run docgen` from `packages/shared/ui`; any repo JSDoc lint target used for packages stays clean. |
| UI-05 | Low | `packages/shared/ui/test/OrganizationDisplay.test.ts:18` | Runtime coverage is happy-path only. It proves decode of missing/present `parentOrgId` and `primaryLabel`, but it does not lock encode semantics for `OptionFromOptionalKey` or rejection behavior for invalid `slug`, `licenseTier`, empty names, or bad nested settings. | Add focused runtime tests for `S.encodeSync(Display/Form)` with `None` and `Some`, plus invalid decode assertions for the schema fields that define the browser contract. | `bun run test` from `packages/shared/ui`; targeted tests fail if optional parent encoding or schema rejection regresses. |
| UI-06 | Low | `packages/shared/ui/docs/modules/entities/Organization/Organization.display.ts.md:62` | Existing generated docs link nested module symbols to `packages/shared/ui/src/Organization.display.ts` instead of `packages/shared/ui/src/entities/Organization/Organization.display.ts`. The source links are not navigable for nested files. | Fix the docgen source-link path calculation to use the module path relative to package `src`, then regenerate docs. If the tooling fix is outside this slice, track it separately but do not call these generated links ready. | Regenerated docs link `Display`, `Form`, and `primaryLabel` to `src/entities/Organization/Organization.display.ts#L...`; package docgen remains clean. |

## Intentional Non-Issues

- No React/component leakage found in `packages/shared/ui/src/entities/Organization/*`. The source imports only `@beep/identity/packages`, `@beep/schema`, `@beep/shared-domain`, and `effect/Schema`.
- No use-case, client, server, config, table, driver, Node builtin, or generic UI primitive imports found in the shared-ui source, tests, or dtslint files.
- `Display` and `Form` are schema-first `S.Class` contracts with `$SharedUiId` annotations and reused shared-domain field schemas.
- `parentOrgId` uses `S.OptionFromOptionalKey(Shared.OrganizationId)`, which matches the browser/form boundary shape; the current runtime test confirms omitted input decodes to `None` and present input decodes to `Some`.
- Tests and dtslint use package aliases (`@beep/shared-ui`, `@beep/shared-domain`) instead of relative imports into workspace `src`.
- The shared-ui dtslint file is included by root `tstyche.json` (`packages/shared/ui/dtslint/**/*.tst.*`) and passed the targeted TSTyche run.
- The package depends on shared-domain and foundation modeling packages only (`@beep/shared-domain`, `@beep/schema`, `@beep/identity`, `effect`), which is consistent with the shared-kernel UI boundary reviewed here.
