---
name: crispen
description: >
  Schema-first "crispening": push invariants and behavior INTO effect/Schema and
  onto the data so business-logic reads as pure intent — reduce free-floating
  decode/guard helpers, colocate behavior with the data, eliminate null/undefined
  and *Defaults spreads, collapse repeated literal/variant families. Ponytail's
  lazy-minimal ethos applied through this repo's schema-first and effect-first laws.
  Use when adding or refactoring schema/domain code, reviewing for helper-wall bloat,
  or when the user says "crispen", "crisp this up", "reduce helpers", "colocate
  behavior", or "schema is truth". Trigger on: schema refactors, new domain models,
  helper-wall/decode-wall cleanup, *Defaults removal, literal-domain collapse,
  Option-ifying nullish fields. Do NOT use for non-schema prose or pure UI/styling.
argument-hint: "[lite|full|ultra]"
version: 0.1.0
status: active
---

# Crispen

**The schema is truth; behavior precipitates.** Crispening pushes every invariant
and every piece of pure node behavior *into the schema and onto the data*, so the
business-logic files shrink to intent. The win condition: **the first ~200 lines of
any business-logic module read as pure intent** — no decode/guard helper wall, no
`*Defaults` spreads, no imperative `let`/`for`/`push` loops.

This is ponytail's minimalism aimed at schemas. It is a *lens* over the repo's
enforced laws — when anything here conflicts with `effect-first-development`,
`schema-first-development`, or repository law, **the laws win**. Schema verbosity is
fine; it's the *business logic* that must be crisp.

## Persistence

ACTIVE EVERY RESPONSE while engaged. No drift back to helper-wall habits. Still
active if unsure. Off only: "stop crispen" / "normal mode". Default: **full**.
Switch: `/crispen lite|full|ultra`. Level persists until changed or session end.

## The crispening ladder

Before you write a helper, climb. **Stop at the first rung that removes the noise** —
but only *after* you understand the module and trace the real flow. Absorbing logic
into the wrong schema is a second bug wearing a smaller diff.

1. **Can the schema carry this invariant instead of code?** A default, a refinement,
   a brand, an `Option` field — an invariant the type enforces is a helper you never
   write.
2. **Does a schema/combinator/primitive already exist?** Search `@beep/schema`
   (`SchemaUtils`, `LiteralKit`, `MappedLiteralKit`), `@beep/identity`, and the shared
   schemas before inventing. Reuse beats reimplement.
3. **Absence/nullish → `Option` in the schema**, not a null-check. `S.OptionFromNullOr`
   / `S.OptionFromOptionalKey` at the boundary; `SchemaUtils.withNoneDefault` erases the
   explicit `O.none()` at every `make` site.
4. **Constant/bool default → the schema**, not a `*Defaults` spread.
   `SchemaUtils.withConstantDefault(v)` / `withKeyDefaults` / `BoolKeyDefaultFalse` /
   `withEmptyArrayDefaults`. Call sites collapse to `Node.makeEffect({ children })`.
5. **Decode/guard wall → colocated statics.** `SchemaUtils.withCodecStatics` on
   branded/union consts gives `{ is, fromUnknown, decodeOption }`; `S.Class`/`S.TaggedClass`
   lose statics when piped, so attach `static readonly is = S.is(Self)` in-body. The wall
   of top-of-file `const isX = S.is(X)` / `const decodeX = …` vanishes.
6. **Repeated literal/variant family → one node + a kit.** `LiteralKit([...])` for a
   literal domain (`.Options`/`.Enum`/`.is`/`.$match`/`.toTaggedUnion`); `MappedLiteralKit`
   for a reversible code map (`.From.Enum`/`.To.Enum`). Six near-identical nodes become one.
7. **Branching → a fold; passthrough → point-free.** `Match.tagsExhaustive` over
   if/else and `switch`; `A.match` for empty/non-empty; `flow(...)` for passthrough
   `pipe` callbacks; `dual` for 2–3-arg public helpers.
8. **Split roles.** Schemas in `.model.ts`, pure projections in `.behavior.ts`,
   conversions in `.codec.ts`, adapters in `.render.ts`, escaping in `.escape.ts`. Move
   behavior off the schema class so `.model.ts` stays pure (this also breaks model↔utils
   cycles). Specialize per package — no package needs all five.

## Fast rules

- **Absence → `Option`.** No `| null` / `| undefined` / `!` in domain code.
  `S.OptionFrom*` at boundaries; `SchemaUtils.withNoneDefault` drops the `O.none()` argument.
- **Defaults live in the schema.** `withConstantDefault(v)`, `withKeyDefaults(v)`,
  `BoolKeyDefaultFalse`, `withEmptyArrayDefaults` — never a runtime fallback object.
  Gotcha: branded/union fields need the explicit type arg — `withConstantDefault<number>(0)`,
  `withConstantDefault<ElementFormat>("")`.
- **Guards/decoders colocate.** `withCodecStatics` on consts; in-body `static is = S.is(Self)`
  on classes. `fromUnknown` is the trusted-boundary decode; `decodeOption` is the soft one.
- **Literal domains → kits.** `LiteralKit` / `MappedLiteralKit` instead of duplicate literal
  arrays + enum objects + ad-hoc guards. Gotcha: numeric/boolean literal keys are stringified —
  `LiteralKit([1..6]).Enum.number1`, `.$match({ number200: … })`; a manual `[[lit, "NAME"]]`
  mapping renames them.
- **`S.Class`/`S.TaggedClass` over `S.Struct`;** annotate every reusable schema via
  `$I.annote` / `$I.annoteSchema` / `$I.annoteKey` (identifier from an `@beep/identity` composer).
- **Errors via `TaggedErrorClass` / `CauseTaggedError`** from `@beep/schema` — never `new Error`.
- **Effectful functions → `Effect.fn("Name")` (traced) / `Effect.fnUntraced` (tests, hot paths)**,
  never `(a) => Effect.gen(...)`.
- **Decode via `S.decodeUnknownEffect` / `S.decodeEffect`;** never `Effect.try` around a decode,
  never `JSON.parse`/`JSON.stringify` (use `S.fromJsonString`).
- **No `as` (only `as const`), no native `Map`/`Set`/`Array` methods** (use `effect/Array`,
  `MutableHashMap`); `S.toEquivalence` over `===`.
- **Tests sample the schema:** `S.toArbitrary(Schema)` + `@effect/vitest` property laws
  replace hand-written fixtures.

## Output discipline

Code first. Then at most three short lines: **what invariant moved into the schema, what
helper wall was deleted, what was deliberately left.** No essays. If the explanation is
longer than the deletion, delete the explanation.

Mark deliberately un-absorbed logic with a `crispen:` comment naming *why* and the *upgrade
path*, so a shortcut reads as intent, not ignorance:

```ts
// crispen: kept as a helper — the refinement needs a cross-field check S.filterGroup
// can't express yet; fold into the schema when it can.
```

## Intensity

| Level | What change |
|-------|-------------|
| **lite** | Build/leave what's asked, but name the crispening opportunity in one line — the schema or combinator that would absorb it. User picks. |
| **full** | The ladder enforced. Absorb invariants into the schema, colocate statics, collapse literals, delete the helper wall. Shortest diff. Default. |
| **ultra** | Absorption extremist. Deletion before addition; challenge whether the helper/field/variant needs to exist at all; refuse to write a helper a combinator already provides. |

Example: "Add heading rendering for h1–h6."
- **lite**: "Done. FYI: the six near-identical arms collapse to one `Heading{ level }` with `LiteralKit([1..6])` + a `MappedLiteralKit` for `level↔"h1".."h6"` if you'd rather not maintain six."
- **full**: "One `Heading` node, `level: HeadingLevel` (`LiteralKit`), rendered by one arm via the level→marker map. Deleted the six node classes + the `headingConstructors` lookup. Kept `Md.h1…h6` as thin builders."
- **ultra**: "Six nodes were never real variants — one `Heading{ level }`. The lookup table is the `MappedLiteralKit` itself. If a level needs distinct behavior later, *then* branch."

## When NOT to crispen

- **Never weaken a trust boundary.** Escaping, sanitization, URL/injection guards stay
  explicit and property-tested (e.g. `Md.escape.ts`). Behavior parity over cleverness.
- **Never touch the load-bearing `declare namespace Type/Encoded` blocks** — they're
  required for `S.suspend` mutual recursion. Schema verbosity there is correct, not debt.
- **Don't collapse a union that needs distinct per-variant behavior** just to save lines;
  a `Match.tagsExhaustive` arm per real variant is the feature, not the noise.
- **Keep one runnable proof behind every absorption** — a `S.toArbitrary` round-trip / law
  test that fails if the invariant you moved into the schema breaks.
- Never lazy about understanding: the ladder shortens the code, never the reading.

## Verify

Prove the crispening held with the governance laws (all support `--check`):

```bash
bun run beep laws terse-effect --check     # flow / helper-ref / option-object compaction
bun run beep laws dual-arity --check        # public 2–3-arg helpers are dual
bun run beep laws effect-fn --check         # Effect.gen-returning fns use Effect.fn(Untraced)
bun run beep laws native-runtime --check    # no native fs/path/sort/string in hot paths
bun run beep laws effect-imports --check    # canonical A/O/P/R/S aliases
bun run beep lint schema-first              # schema-first inventory baseline (no drift)
bun run beep lint schema-topology           # @beep/schema canonical topology
bun run beep yeet verify                    # full proof
```

Smell-checks before you start — the walls to demolish:

```bash
rg -n 'const (is|decode)\w+ = S\.(is|decodeUnknown)' path/   # decode/guard wall
rg -n '\.\.\.\w*Defaults\b' path/                            # *Defaults spreads
rg -n ' as [A-Z]| as unknown|![.)\]]' path/                  # assertions / non-null
```

Operational note: **do not run manual `turbo` / `docgen` / `vitest` while a background
`yeet verify` (or any `turbo run`) is in flight** — they contend over the turbo daemon and
`docs/generated/` and emit *spurious* `Failed to spawn` / docgen exit-1. Use read-only probes
(`git`, `rg`/`tail` on the log) while it runs; investigate a lane only after killing the run.

## Reference & escalation

- **`references/crispening.md`** — the crispening toolkit map (every combinator, its signature,
  the noise it kills, a real usage site) plus the before→after moves catalog from the `@beep/md`
  / `@beep/lexical-schema` refactor.
- **`schema-first-development`** — the enforced laws (`references/repo-laws.md`), pattern
  selection (`references/pattern-catalog.md`), local primitives (`references/local-primitives.md`),
  real exemplars (`references/examples.md`). Load these for the deep schema-first rules.
- **`effect-first-development`** — the full EF-law list + Always/Never examples for anything
  broader than schema work (services, errors, concurrency).
- **`ponytail`** — the parent lazy-minimal ethos when the task isn't schema-shaped.
