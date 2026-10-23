# LiteralKit panel synthesis (2026-10-22)

Inputs: `muse.md` (Muse Wonder 1.0 xhigh, deep-research), `astra.md` (GPT-6 Astra xhigh,
Codex read-only), `fable-implementation-review.md` (Fable), Grok 4.7 xhigh pending.
Fable verified every load-bearing factual claim below against the tree or a tsgo probe
(`../probe/probe.ts`, `../probe/probe2.ts`).

## Verified facts the panel surfaced that we did not have

| Fact | Source | Verified |
| --- | --- | --- |
| 11 live sites re-wrap `LiteralKit(X.pick([...]).literals)` to recover helpers on a subset | Muse | rg count 11 |
| `CitingApplicationIdentity.model.ts:80-318` hand-spells a 234-literal complement with a comment admitting it is a complement pick and an explicit type arg to tame inference | Muse, Astra | read |
| `matchLiteral` runs a `Match.value().pipe(when x4)` pipeline per literal, called from every builder and the collision validator on the construction path | Muse, Astra | read :164-171 |
| `MappedLiteralKit` constructs a throwaway `LiteralKit(from)` per direction to borrow `is`/`$match`, validating collisions twice | Muse | read :232-244 |
| `MatchReturn` (`:79-81`) uses `(...args: ReadonlyArray<unknown>) => infer R`; under strictFunctionTypes unary handlers fail the check and the return collapses to `never`, which is assignable anywhere so no site errors | Astra | tsgo probe2 Claim A |
| `Match.whenOr(...Kit.literals, Kit.match(cases))` composes inside a Match chain, honours `withReturnType`, and `exhaustive` still catches a missing case | Astra | tsgo probe2 Claim B |
| Dispatch indexes the cases object directly; upstream TaggedUnion match checks `Object.hasOwn` first | Astra | read `Schema.js:3281-3310`, every branch uses `Object.hasOwn` |
| Codemod inserted `HashSet.fromIterable(...)` / `constant(...)` at access sites without hoisting | Astra | mechanism confirmed (`planHashSet`, codemod :509-524 emits inline); live cost nil: 0 production sites have a per-call `HashSet.fromIterable(X.literals)` inside a function body, only tests do |

## Where the three reviewers agree (and agree with the Fable/operator position)

- Kit should exist, as a thin domain wrapper over `Schema.Literals`.
- Drop the `$`: `match`, exhaustive by default, both overloads. Add `matchOrElse(cases, orElse)`
  both overloads. No Option- or undefined-returning partial record match.
- `omit` retirement was wrong. Complement is a continuing policy; an enumerated pick is a
  snapshot. Empty complement should be a type error, not the old runtime throw.
- `Enum`, `is`, `toTaggedUnion` stay. `enumMapping` / `M` stays dead; mappings live in
  `MappedLiteralKit`.
- Quadratic record builders, repeated key derivation, `matchLiteral` on the hot path:
  fix all three. Keep the `rebuild` override; it is the right mechanism.
- No eager `HashSet`. Muse: lazy memoised getter or nothing. Astra: drop.

## Where they diverge from the Fable/operator position

| Topic | Operator + Fable (pre-panel) | Muse | Astra |
| --- | --- | --- | --- |
| Subset shape | `pickLiterals` / `omitLiterals` return typed tuples | `pick` / `omit` return a **LiteralKit** (kit-preserving); `.literals` gives the tuple | same as Muse; `pick` override, `omit` new; "closure under selection" |
| `thunk` | bring back (context-free literal typing inside pipes) | drop; `F.constant(Enum.k)` covers it | drop; "parallel vocabulary without enough meaning" |
| Match interop | new kit static (`whenLiterals`) | standalone combinator beside the kit (`MatchLiterals.valuesExhaustive(Kit, cases)`), not a method | **no new API**: `Match.whenOr(...Kit.literals, Kit.match(cases))`; verified |
| `is` name | keep | keep, reluctantly (`guards` is upstream's spelling) | rename to `guards` |
| `Enum` name | keep | keep | prefer `values`, least-firm call, rename probably not worth it |
| Doctrine | correct the omit row | amend: coverage judged on the result type consumers program against after the derivation they perform | drop the line-count majority rule as a deciding vote; use the census to understand, not decide |
| MappedLiteralKit | same four helpers | share builders, stop the throwaway kit | `From.Enum.OK === 200` while `From.is.OK` recognises `"OK"`: rename conversion tables to `forward`/`reverse`, keep `Enum` meaning "own members" |

## Fable's read after the panel

1. Kit-preserving `pick`/`omit` is the better design and subsumes `pickLiterals`/`omitLiterals`
   (one `.literals` accessor longer, returns a domain). Both reviewers reached it
   independently from the 11 re-wrap sites. Adopt. Open question for the grill: override
   upstream `pick` (return type narrows from `Literals<L2>` to `LiteralKit<L2>`, still
   substitutable) or a distinct name. Lean override, as both reviewers do.
2. `thunk`: both reviewers drop it on coverage; neither weighed the context-free typing
   argument. The operator likes it on taste. Astra's `whenOr(...literals, match(...))`
   plus `withReturnType` removes the main pipe-context motivation. Fable now leans: do not
   bring it back; if the operator still wants it, it rides on taste alone and should be
   recorded as such. Grill item.
3. `whenLiterals`: Astra's verified composition means the capability exists today with
   zero new surface. Fable withdraws the proposal unless /adhd finds a case `whenOr` cannot
   express (candidates: handlers needing the literal argument, which `whenOr` passes; a
   subset of the kit's cases, which `pick(...).literals` + `matchOrElse` covers).
4. `MatchReturn` fix is a correctness bug independent of the redesign: land it first or in
   the same lane, with a type test asserting the aggregate return includes unary handlers.
5. Names: `match` / `matchOrElse` / `pick` / `omit` settled by three-way agreement. `is` vs
   `guards` and `Enum` vs `values` are cosmetic renames over 200+ files each; the panel is
   split and holds them loosely. Fable: keep `is` and `Enum`; record the alternatives.
6. MappedLiteralKit semantic cleanup (Astra) is real but a separate packet; note it, do not
   bundle.

## Grok 4.7 xhigh (third report, `grok.md`)

Lands with the other two on every shared point: kit stays and smaller; `omit` back as a
kit-returning complement; override `pick`'s return type to a kit; drop `thunk`, `HashSet`,
`pickOptions`, `enumMapping`; no `$`; `match` exhaustive, both overloads; `matchLiteral`'s
Match pipeline on the construction path is the real cost; keep `Enum` and `is` names;
`MappedLiteralKit`'s directional `Enum` is a different thing and should be renamed (`map`).
Agrees with Astra that counting construction lines in the "covered" column is a flawed
metric: construction is the cost of reaching the uncovered members, not a vote for
`S.Literals`.

New positions only Grok takes:

- **Move `toTaggedUnion` off the kit interface** to a free function (`taggedUnion(Kit)(tag)(cases)`).
  Reason: its N-key mapped type (`TaggedUnionCases`, `:102-142`) is paid by every kit
  including 240-member office codes that will never be a tag. Grok is unsure whether the
  interface property type is elaborated eagerly; needs a checker trace or typeperf run.
- **`omit`'s type via `Exclude`, never a recursive tuple filter**, and a worry that a
  rest-tuple `L` (`readonly [C, ...Array<C>]`) pollutes `Literals.members`
  (`{ [K in keyof L]: Literal<L[K]> }`). Prototype on `OfficeCode` before freezing.
- **Guards with `Object.is`, not `===`.** (NaN / -0 literals; cheap correctness.)
- **A miss in `match` should throw a descriptive error naming the value and domain**, not
  the `TypeError` from the `!` assertion at `:286`/`:291`. (Astra: also use `Object.hasOwn`.)
- **Replace the `as LiteralKit<L>` cast at `:454` with `satisfies`**, so the constructor
  is checked against the interface and static drift becomes a type error.
- **`matchOrElse`: lean yes but do not add speculatively in the same change as `omit`**;
  add when a call site needs a default arm on a closed set.
- **No Match interop in the kit at all**; the right home is an upstream `Match.literals` /
  `Match.literalsExhaustive`, written as a proposal. Grok did not consider Astra's
  `whenOr(...literals, match(cases))` composition.
- **Upstream `Literals.omit` is the one thing to propose**; do not upstream `Enum`/`is`/`match`
  (would tax every anonymous `S.Literals`, including Effect's own internal ones).

## Panel scorecard (3 reviewers + Fable)

| Decision | Muse | Astra | Grok | Fable now |
| --- | --- | --- | --- | --- |
| kit-returning `pick`/`omit` | yes | yes | yes | yes, adopt |
| `thunk` back | no | no | no | no (taste-only if operator insists) |
| `$match` → `match` | yes | yes | yes (bundle with omit) | yes |
| `matchOrElse` | yes | yes | lean yes, defer | yes, in the same lane (TaggedUnion parity) |
| Match combinator on kit | no (standalone fn instead) | no (`whenOr` composition) | no (upstream proposal) | no, withdrawn |
| `is`/`Enum` renames | keep | `guards`/`values` loosely | keep | keep |
| `toTaggedUnion` off interface | keep on kit | keep, measure bundle | free function | /adhd + typeperf decide |
| `MatchReturn` unary bug | — | found, verified | — | fix in lane |

## Items for /adhd

- Alternatives to kit-preserving pick/omit that keep `Literals` substitutability.
- Any expressiveness `whenOr(...literals, match(...))` lacks that would justify a static.
- Whether `omit`'s tuple-preserving conditional type is affordable on 240-member kits
  (typeperf fixture) or needs a bounded overload.
- Whether the key encoding (`number200`, `bigint1n`) should stay the dispatch key or kits
  should special-case string-only domains for direct indexing.
- Upstream proposal shape for `Literals.omit` and `Literals.match`/`matchOrElse`.
