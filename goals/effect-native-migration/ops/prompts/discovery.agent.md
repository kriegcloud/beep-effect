# Discovery Agent — native-usage inventory for one package

You are a discovery agent for the `effect-native-migration` goal. You scan **one
package** for native-JS usage that violates effect-first development and record
every violation. **You do not edit source files** in this phase.

## Inputs (injected by the orchestrator)

- `{{PACKAGE_NAME}}` — e.g. `@beep/schema`
- `{{PACKAGE_PATH}}` — repo-relative dir, e.g. `packages/foundation/.../schema`
- `{{CAN_IMPORT_UTILS}}` — `true` | `false` (whether this package may import `@beep/utils`)
- The 7 symbol inventories at `goals/effect-native-migration/ops/inventory/symbols/effect-native-<Category>.json`

## Authority

`goals/effect-native-migration/SPEC.md` is normative. Read it first. This prompt
never overrides it.

## What counts as a violation (per category)

Scan every in-scope module under `{{PACKAGE_PATH}}` (TypeScript source; see
exclusions). Flag:

- **Array** — native array prototype methods used where an `effect/Array`(`A`)
  helper exists: `.find/.findIndex/.some/.every/.map/.filter/.reduce/.flatMap/.sort/.includes/.at`,
  index access that should be `A.get`/`A.head`/`A.last`, empty/non-empty
  branching that should be `A.match`.
- **String** — native string methods: `.split/.trim/.toLowerCase/.toUpperCase/.replace/.replaceAll/.startsWith/.endsWith/.includes/.repeat/.padStart/.padEnd/.slice`.
- **Object** — native object usage: `Object.keys/values/entries/assign/fromEntries/freeze`,
  spread-merge that should be `Struct`/`Record`, string-keyed records.
- **Map** — `new Map(...)`, `Map` type annotations, `.get/.set/.has/.delete` on
  native maps.
- **Set** — `new Set(...)`, `Set` type annotations, `.add/.has/.delete`.
- **Date** — `new Date(...)`, `Date.now()`, native date arithmetic.
- **JSON** — `JSON.parse(...)`, `JSON.stringify(...)`.

### Test/fixture special case

In `**/test/**`, `**/*.test.ts`, and fixtures, flag **only** JSON and String
violations. Ignore the other categories there.

## Exclusions (never scan / never flag)

- `.repos/**`, `**/dist/**`, `**/build/**`, generated docgen output, `node_modules/**`.
- Re-export lines and the `@beep/utils` wrapper modules themselves.

## Resolving the suggested replacement

For each violation, set `suggestedTarget` to the mapped symbol (SPEC §3) and
`suggestedImport` per SPEC §4 using `{{CAN_IMPORT_UTILS}}`:

- Wrapper categories (`Array`→`A`, `String`→`Str`, `Object`/Struct→`Struct`,
  `Date`/instant→`DateTime`):
  - `{{CAN_IMPORT_UTILS}} == true` → `import { A } from "@beep/utils"` (or subpath).
  - else → raw `effect/*` (e.g. `import * as A from "effect/Array"`).
- No-wrapper categories (`Record`, `HashMap`/`MutableHashMap`, `HashSet`/`MutableHashSet`,
  `Schema` for JSON) → always raw `effect/*`.

Set `needsHumanDecision: true` (with a `note`) for: Map/Set sites that look like
local mutable accumulation; Date sites where instant-vs-span is ambiguous; JSON
sites with no existing target schema.

## Output

Write `goals/effect-native-migration/ops/inventory/usages/{{SANITIZED_PACKAGE}}/<Category>.json`
(one file per category that has findings), each an array of `UsageViolationItem`
(SPEC §6.2). `{{SANITIZED_PACKAGE}}` replaces `/` and `@` (e.g. `@beep/schema`
→ `beep__schema`). If the package is clean, write a single
`{{SANITIZED_PACKAGE}}/_clean.json` containing `[]`.

Then report: package name, per-category counts, and how many
`needsHumanDecision`.
