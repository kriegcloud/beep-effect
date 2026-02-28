# @beep/ai-sdk Effect-First Conventions Alignment (Execution Spec)

## Summary
- Objective: Refactor `packages/ai/sdk` to comply with repository laws and package conventions: Effect-first data/runtime APIs, canonical `$AiSdkId/$I` identity usage, `LiteralKit` over `S.Literals`, `S.Class` + tagged unions for discriminators, and strict removal of ai/sdk allowlist debt.
- Scope: `packages/ai/sdk/src/core/**` including `experimental/**` and `internal/**`.
- Strictness: Remove all `packages/ai/sdk` entries from `standards/effect-laws.allowlist.jsonc`.

## Baseline Snapshot
- `withIdentifier` usage in 10 schema files.
- `S.Literals` usage in 16 files.
- Raw `"@effect/claude-agent-sdk/..."` IDs in 23 files.
- ai/sdk allowlist entries: 78 total (22 import-style, 56 no-native-runtime).

## Required Changes
1. Remove `withIdentifier` helper and usage.
2. Keep `withToolInput` and `withSdkMessage`, but accept caller-provided `$I.annote(...)` metadata.
3. Replace `S.Literals([...])` with `LiteralKit([...])` throughout `src/core/**`.
4. Convert exported discriminated schemas (`status`, `type`, `subtype`, `hook_event_name`, etc.) to `S.Class` variants with `S.Union([...]).pipe(S.toTaggedUnion("<field>"), S.annotate($I.annote(...)))`.
5. Convert service/tag IDs from `@effect/claude-agent-sdk/...` to `$AiSdkId` composer IDs.
6. Service definitions must use explicit shape interfaces separate from service classes.
7. Convert exported `S.TaggedErrorClass` and `S.Class` declarations with raw identifiers to `$I` identifiers + meaningful descriptions.
8. Replace native runtime patterns in ai/sdk allowlisted files:
- `typeof` => `P.is*`
- `Object.*` => `R.*`/Effect combinators
- `Array.from/isArray/of` => `A.*`/Predicate equivalents
- `new Map/new Set` => Effect collections (`HashMap`/`HashSet`) or typed Effect mutable alternatives when required
- `Date.*` => `Clock`/`DateTime`
9. Remove all ai/sdk entries from `standards/effect-laws.allowlist.jsonc`.
10. Add regression test guard in `packages/ai/sdk/test` for:
- no `withIdentifier(` in `src/core`
- no `S.Literals(` in `src/core`
- no raw `@effect/claude-agent-sdk/` IDs in `src/core`
- tagged-union enforcement in targeted schema modules

## Constraints
- Preserve existing optional field semantics (no broad `OptionFromOptionalKey` migration unless already used).
- Annotation requirement applies to exported schemas/effects/services/errors.
- Keep API behavior stable while changing internal schema composition.

## Validation Commands
1. `bunx eslint --config eslint.config.mjs "packages/ai/sdk/src/**/*.{ts,tsx}" --max-warnings=0`
2. `bun run --cwd packages/ai/sdk check`
3. `bun run --cwd packages/ai/sdk test`
4. `bun run --cwd packages/ai/sdk docgen`
5. `bun run check`
6. `bun run lint`
7. `bun run test`
8. `bun run docgen`
