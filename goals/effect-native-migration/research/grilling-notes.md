# Grilling Notes — design decisions behind this goal

Captured during the `grill-me` session that produced this packet. These are the
resolved decisions; SPEC.md is the normative restatement.

## Findings that reshaped the original draft

- `goals/` already has a canonical form (`README.md`, `SPEC.md`, `PLAN.md`,
  `research/`, `ops/`, `history/`; machine artifacts live in `ops/`). The draft's
  `./.goals` and top-level `/inventory/` paths were non-conformant.
- "1 agent per category per package" ≈ 63–77 packages × 7 categories ≈ 440–540
  agents per phase — infeasible. Collapsed to one agent per package per phase.
- `grill-with-docs` is for stress-testing a plan, not authoring one; moved to
  Phase 1.5.
- The skill leaves Map-immutability, Date(DateTime-vs-Duration), and unschema'd
  JSON open, and the draft had no verification gate.
- New requirement: prefer `@beep/utils/*` wrappers over raw `effect/*` when the
  importing package can depend on `@beep/utils` without a cycle.

## Decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Scope | First-party `packages/**` + `apps/**`; exclude `.repos/**`, `dist`, generated docgen, `node_modules`; tests/fixtures only for JSON & String bans. |
| 2 | Fan-out | 1 agent per package per phase, all categories; topo order, bounded waves; remediation loads only flagged-category inventories. |
| 3 | Artifact layout | Canonical `goals/effect-native-migration/` + `ops/`. |
| 4 | Map/Set | Immutable `HashMap`/`HashSet` by default; `Mutable*` only justified local; `Record` for string keys. |
| 5 | Date | `DateTime` instants + `Duration` spans; ban `new Date()`/`Date.now()` in domain. |
| 6 | JSON | Schema codec where a schema exists; else `S.UnknownFromJsonString` + flag. |
| 7 | Verification | Per-package gate (typecheck + lint + effect-first checks) in topo order. |
| 8 | grill-with-docs | Author first, then stress-test PLAN (Phase 1.5). |
| 9 | Phase 1 method | 7 parallel agents + reuse `standards/repo-exports.catalog`. |
| 10 | Import precedence | Prefer `@beep/utils/*` when `canImportUtils`; else raw `effect/*`; no-wrapper categories always raw. |
| 11 | Phase 0 depth | Full bootstrap (scaffold + docs + prompt templates). |
| 12 | Number.ts | Deferred. |

## `@beep/utils` facts used

- Wrappers re-exporting `effect/*`: `Array.ts`→`effect/Array`, `Str.ts`→`effect/String`,
  `Struct.ts`→`effect/Struct`, `DateTime.ts`→`effect/DateTime` (also `Bool`, `Num`,
  `Option`, `Predicate`, `Function`, `Stream` — out of scope here).
- No wrapper for `Record`, `HashMap`/`MutableHashMap`, `HashSet`/`MutableHashSet`,
  JSON/`Schema`.
- Barrel `src/index.ts` exposes `export * as A`, `Str`, `Struct`, `DateTime`, etc.
  package.json `exports` includes `"./*": "./src/*.ts"` → subpath imports work.
- `@beep/utils` workspace deps: only `@beep/identity` (→ defines the cycle
  boundary for `canImportUtils`).

## Repo facts

- `bun run topo-sort` = `bun run beep topo-sort`.
- Gates: `beep-cli check` / `beep-cli lint` (root `bun run check` / `bun run lint`).
- JSON codecs `S.fromJsonString` / `S.UnknownFromJsonString` live in
  `effect/Schema` (no standalone `JSON` module).
- ~63–77 first-party workspace packages.
