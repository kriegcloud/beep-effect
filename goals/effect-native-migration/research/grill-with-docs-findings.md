# Phase 1.5 — grill-with-docs findings

Stress-tested `SPEC.md` / `PLAN.md` against `standards/ARCHITECTURE.md`,
`standards/architecture/{README,GLOSSARY,DECISIONS}.md`,
`04-rich-domain-model.md`, `07-non-slice-families.md`, and
`.claude/skills/effect-first-development/SKILL.md`. Resolved before any Phase 2/3
edits. No source code changed in this phase; two surgical SPEC clarifications
were made (recorded below).

## Doctrine that backs the plan (no change needed)

- **Native helper ban** — SKILL Law #7 "No native `Object/Map/Set/Date/String`
  helpers in domain logic." Umbrella authority for the whole goal.
- **String → `effect/String` (`Str`)**, **Array → `effect/Array` (`A`)** incl.
  Law #44 "never native `Array.prototype.sort`; use `A.sort(values, order)` with
  explicit `Order`", **Record → `effect/Record` (`R`)** — SKILL Laws #1/#2/#44.
- **Duration for spans** — SKILL Law #19. **`Date.now()` flagged** by the Verify
  grep (SKILL.md:765).
- **JSON** — SKILL Laws #22/#23: `JSON.parse`/`JSON.stringify` banned in code,
  tests, and fixtures; replace with `S.fromJsonString` / `S.UnknownFromJsonString`
  + `S.decodeUnknownEffect` / `S.encodeUnknownEffect`. SPEC §5 matches exactly.

## Findings

### F1 — `canImportUtils` must also exclude `foundation/primitive` (RESOLVED, SPEC amended)

SPEC §4 computed `canImportUtils` from the cycle only ("packages `@beep/utils`
transitively depends on ⇒ raw `effect/*`; all others prefer wrappers"). That is
too permissive. `@beep/utils` is a `foundation/modeling` package, and
`ARCHITECTURE.md` (kind table) says a `primitive` package **may depend only on
`foundation/primitive`** — so `foundation/primitive` packages (`@beep/data`,
`@beep/types`) may **not** import `@beep/utils`, regardless of cycles. They must
use raw `effect/*` → `canImportUtils: false`.

Drift note: `@beep/data/package.json` **already** declares a `@beep/utils`
dependency (a `primitive → modeling` boundary violation). This goal does **not**
deepen it: primitive packages use raw `effect/*`. The drift is logged here for a
future topology cleanup, out of scope for this migration.

**Action taken:** amended SPEC §4 to add the `foundation/primitive ⇒ false`
rule and to fold it into the `canImportUtils` computation.

### F2 — Object → Struct/Record is struct-op replacement, not schema authoring (RESOLVED, SPEC amended)

SKILL Law #24 prefers `S.Class` over `S.Struct` for **domain object schemas**.
That is a different concern from this goal: the Object category replaces native
struct **operations** (`Object.keys/values/entries/assign/fromEntries/freeze`,
spread-merge) with `effect/Struct` / `effect/Record` helpers. A remediation agent
must **not** "upgrade" a plain object into an `S.Class`/`S.Struct` schema — that
is new schema authoring, a SPEC §8 non-goal.

**Action taken:** added a dedicated Object decision rule to SPEC §5 making the
"struct/record ops only, never schema authoring" boundary explicit.

### F3 — wrapper-precedence is user convention, not standards doctrine (ACCEPTED, no change)

The "prefer `@beep/utils/*` wrappers" rule is not codified in `standards/`; the
effect-first SKILL points at raw `effect/*` aliases. It originates from the
user's explicit, repeated preference (auto-memory `feedback_utils_import_precedence.md`
+ this goal's mission) and is cycle-conditioned. It is safe because each wrapper
(`A`, `Str`, `Struct`, `DateTime`) re-exports its `effect/*` module as a pure
**superset** (Phase 1 confirmed wrapper-only additions on top of full
re-exports), so behavior is identical. Kept as the goal's import precedence; not
a doctrine conflict.

### F4 — repo-wide scope is a superset of the "domain logic" ban (ACCEPTED, no change)

Law #7 scopes the native-helper ban to "domain logic"; this goal applies it to
all first-party `packages/**` + `apps/**` source. The SKILL's own Verify greps
(`JSON.parse|stringify`, `Date.now`, `new Map|Set|Date`) are repo-wide, and the
goal mission sets the broad scope deliberately. This is a superset of doctrine,
not a contradiction. No migration bucket (transitional / cleanup-on-touch /
forbidden-in-new-work) shields native-helper usage, and none mandates a forced
sweep — so a deliberate, gated sweep is consistent with the standard.

## Net effect on the plan

- Phase 2 `canImportUtils` computation: cycle set **plus** every
  `foundation/primitive` package ⇒ `false`. Concretely `false` for:
  `@beep/utils`, `@beep/identity`, `@beep/data`, `@beep/types`. Everything else
  in scope ⇒ `true`.
- Phase 3 Object remediation: struct/record ops only; never author schemas.
- All other mappings/decision rules stand as written.
