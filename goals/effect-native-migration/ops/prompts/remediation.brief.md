# Remediation brief (shared) — read with SPEC.md + remediation.agent.md

You remediate **one package**: apply the native→Effect substitutions from its
Phase 2 findings, then prove it still typechecks and lints. **Do NOT git commit**
and **do NOT edit `progress.json` or any `ops/*` file** — the orchestrator owns
commits and status. Edit only source/test files under your package path.

## Authority / read order
1. `goals/effect-native-migration/SPEC.md` — NORMATIVE (§3 mapping, §4 imports, §5 rules, §8 non-goals).
2. Your package's findings: `goals/effect-native-migration/ops/inventory/usages/<sanitized>/*.json`.
3. The symbol inventories for the categories you touch:
   `goals/effect-native-migration/ops/inventory/symbols/effect-native-<Category>.json`.

## Locate by content, not stale line numbers
Line numbers in the findings may be stale. Find each site by its `nativeSnippet`/
`filePath` and verify the receiver before editing.

## Per-finding policy
- **`needsHumanDecision: true` → LEAVE AS-IS** (it is a recorded waiver in
  `ops/waivers.md`), **EXCEPT**:
  - **JSON sites** — never leave raw `JSON.parse`/`JSON.stringify`. Apply the JSON
    policy below even when flagged `needsHumanDecision` (the flag there means "model
    a real schema later", not "skip").
  - The single **`new Set` FFI site in `@beep/nlp`** — keep the native `Set` (wink-nlp
    requires it) but add the inline marker comment
    `// effect-native-migration: WONTFIX (wink-nlp FFI requires native Set)` on the line above.
- **`needsHumanDecision` absent/false → apply the substitution** using
  `suggestedTarget`/`suggestedImport`, preserving exact behavior (SPEC §8).

## JSON policy (no schema → synchronous boundary)
- If a target `Schema` exists: `S.fromJsonString(schema)` + `S.decodeUnknownEffect` /
  `S.encodeUnknownEffect` (Effect context) or the `*Sync` runner if the call site is
  synchronous.
- If **no** schema and the call site is **synchronous** (the common case here): use
  `S.decodeUnknownSync(S.UnknownFromJsonString)` (for `JSON.parse`) /
  `S.encodeUnknownSync(S.UnknownFromJsonString)` (for `JSON.stringify`). This preserves
  the synchronous call shape (no §8 behavior change) and removes the raw call. Add
  `// TODO(effect-native-migration): model schema` above it.
- `S` is always raw `effect/Schema` (`import * as S from "effect/Schema"`), regardless of `canImportUtils`.

## Behavior preservation for `?? default` reads
`record[key] ?? d` / `arr[i] ?? d` → `pipe(R.get(record, key), O.getOrElse(() => d))` /
`pipe(A.get(arr, i), O.getOrElse(() => d))` (or `A.head`/`A.last` for `[0]`/`[length-1]`).
Only do this when the value type cannot legitimately be a present-but-`undefined`
entry (where `R.get`/`A.get` would return `Some(undefined)` and diverge from `??`).
If uncertain, LEAVE the site and note it — do not risk a behavior change.

## Imports (SPEC §4 — your package's `canImportUtils` is given by the orchestrator)
- Wrapper categories (Array/String/Struct/Date-instant):
  - `canImportUtils:true` → `import { A } from "@beep/utils"` / `{ Str }` / `{ Struct }` / `{ DateTime }`.
  - `canImportUtils:false` → raw `import * as A from "effect/Array"` / `* as Str from "effect/String"` / etc.
- No-wrapper categories (always raw): `R`←`effect/Record`, `HashMap`/`MutableHashMap`,
  `HashSet`/`MutableHashSet`, `Duration`, `S`←`effect/Schema`.
- Reuse imports the file already has; add only what's missing; don't duplicate; keep import style consistent with the file.

## Verify (scoped to your package — report results, do NOT commit)
1. `bun run beep check --filter <PACKAGE_NAME>`
2. `bun run beep lint --filter <PACKAGE_NAME>`
3. Residue grep under your package src (tests only for JSON/String):
   `rg -n "JSON\.(parse|stringify)\(" <path>` ,
   `rg -n "\.(split|trim|toLowerCase|toUpperCase|replace|replaceAll)\(" <path>` ,
   `rg -n "new (Map|Set|Date)\(|Date\.now\(" <path>`
   — expect no in-scope hits except the documented `@beep/nlp` `new Set` waiver.

## Report
List: files changed, findings applied vs left-as-waiver, JSON sites converted, and
the pass/fail of check / lint / grep. State clearly if the gate is green.
