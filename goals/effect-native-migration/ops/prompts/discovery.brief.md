# Discovery brief (shared) — read with SPEC.md + discovery.agent.md

You are a Phase 2 DISCOVERY agent. **READ-ONLY — never edit source.** For each
assigned package you write native-usage findings; you do not fix anything.

## Authority / read order
1. `goals/effect-native-migration/SPEC.md` — NORMATIVE (§2 scope, §3 mapping, §4
   import resolution, §5 decision rules, §6.2 output schema).
2. `goals/effect-native-migration/ops/prompts/discovery.agent.md` — template.
3. Confirm each package's real `path` from
   `goals/effect-native-migration/ops/progress.json` (`packages[name].path`)
   before scanning. Use that path, not a guessed one.
4. Consult `ops/inventory/symbols/effect-native-<Category>.json` only to confirm
   a target symbol name when unsure.

## Scan rules
- Scan `*.ts`/`*.tsx` under `<path>/src` for ALL categories.
- Scan `<path>/test` (and fixtures) for **JSON and String ONLY** (SPEC §2).
- EXCLUDE: `**/dist/**`, `**/build/**`, generated/codegen files (e.g. `_generated/`,
  files headed "Do not edit"), `node_modules`, re-export lines, and `@beep/utils`
  wrapper module internals.

## Violation = method call / static / constructor only (SPEC §2)
Flag only native **method calls**, **statics**, and **constructors**. Object-literal
spread/merge `{ ...a, ...b }`, computed-key literals `{ [k]: v }`, bracket index
access/assignment (`arr[0]`, `record[key]`, `match[n]`), and `.length` reads are
language syntax/properties — **out of scope**, never flag them.

## What to flag (SPEC §3 → target)
- **JSON**: `JSON.parse(` / `JSON.stringify(` → `S.fromJsonString`+`S.decodeUnknownEffect`
  (or `S.encodeUnknownEffect`) if a schema exists; else `S.UnknownFromJsonString`
  with `needsHumanDecision:true` + note "model schema later".
- **String**: native string methods on a string value: `.split/.trim/.trimStart/.trimEnd/.toLowerCase/.toUpperCase/.replace/.replaceAll/.startsWith/.endsWith/.padStart/.padEnd/.repeat/.slice/.substring/.charAt/.normalize/.localeCompare` → `Str.*`.
- **Array**: native array prototype **method calls** on an array value: `.find/.findIndex/.some/.every/.map/.filter/.reduce/.flatMap/.sort/.includes/.indexOf/.lastIndexOf/.forEach/.flat/.slice/.at/.reverse/.concat/.join` → `A.*`. (NOT `arr[i]` index access, NOT `arr.length`.)
- **Object**: native **static helpers** `Object.keys/values/entries/assign/fromEntries/freeze/getOwnPropertyNames` → `Struct.*` / `R.*`. (NOT object-literal spread/merge, computed-key literals, or `record[key]` access — those are syntax.) NEVER convert a plain object to an `S.Class`/`S.Struct` schema (SPEC §5; schema authoring is a non-goal).
- **Map**: `new Map(` constructor, `Map<…>` type annotations, native `.get/.set/.has/.delete` method calls → `HashMap` (immutable default) or `R` (string keys). `MutableHashMap` ONLY for local hot-loop accumulation that never escapes → `needsHumanDecision:true`.
- **Set**: `new Set(` / `new WeakSet(` constructor, `Set<…>`, native `.add/.has/.delete` → `HashSet`. `MutableHashSet` only justified-local → `needsHumanDecision:true`.
- **Date**: `new Date(`, `Date.now()`, native Date prototype methods (`.getTime/.toISOString/...`) → `DateTime` (instants) or `Duration` (spans). Ambiguous instant-vs-span → `needsHumanDecision:true`.

## CRITICAL — do NOT flag (already Effect-native / not targeted)
- Namespaced calls: `A.*`, `O.*`, `R.*`, `S.*`, `Str.*`, `Effect.*`, `Stream.*`,
  `HashMap.*`, `HashSet.*`, `Option/Either/Chunk.*`, `pipe(xs, A.filter(...))`, etc.
- `String(x)` coercion, `x.toString()`, `.length` property reads (not in the method
  lists), RegExp `.test/.exec`, `Math.*`, `Promise.*`, Node `path.*`, `console.*`,
  `TextEncoder/TextDecoder`, TypedArray (`Uint8Array`) methods, `Object.defineProperty`.
- Methods on Effect data types / fluent `this`-builders / `dual`-arity `args[0]` guards.
- Anything inside JSDoc `@example` / comment blocks.
- Only flag when the receiver is genuinely a native JS string/array/object/Map/Set/Date.
  Genuinely ambiguous receiver → include with `needsHumanDecision:true` + a `note`.

## Import resolution (SPEC §4) — depends on the package's `canImportUtils`
- Wrapper categories (Array/String/Struct/Date-instant):
  - `canImportUtils:true` → `import { A } from "@beep/utils"` / `{ Str }` / `{ Struct }` / `{ DateTime }`.
  - `canImportUtils:false` → raw: `import * as A from "effect/Array"` / `* as Str from "effect/String"` / `* as Struct from "effect/Struct"` / `* as DateTime from "effect/DateTime"`.
- No-wrapper categories (always raw, regardless of flag): `import * as R from "effect/Record"`,
  `* as HashMap from "effect/HashMap"`, `* as MutableHashMap from "effect/MutableHashMap"`,
  `* as HashSet from "effect/HashSet"`, `* as MutableHashSet from "effect/MutableHashSet"`,
  `* as Duration from "effect/Duration"`, `* as S from "effect/Schema"`.

## Output (per assigned package)
Write one file per category that has findings:
`goals/effect-native-migration/ops/inventory/usages/<sanitized>/<Category>.json`,
each a JSON array of `UsageViolationItem` (SPEC §6.2: `category, package, filePath`
[repo-relative], `line, nativeSnippet, nativeSymbol, suggestedTarget,
suggestedImport, needsHumanDecision?, note?`). Strictly valid JSON. If a package
is genuinely clean, write `<sanitized>/_clean.json` = `[]`.

Prefer precision over volume — a false positive that breaks a build later is worse
than skipping a low-value `.slice`.

Report per package: per-category counts and total `needsHumanDecision`.
