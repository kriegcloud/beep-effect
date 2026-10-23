# Grill rulings — LiteralKit redesign (operator, 2026-10-22)

Three rounds after the three-model panel (`synthesis.md`) and /adhd (`adhd-wide-set.md`).
Recommended options were taken on every round unless noted.

## Surface

| Item | Ruling |
| --- | --- |
| `thunk` | stays retired; reconsidered on the context-free typing argument, rejected once `whenOr(...literals, match(cases))` + `withReturnType` was verified |
| `pick` | kit overrides upstream `pick`; returns `LiteralKit<P>`; non-empty argument |
| `omit` | new; returns `LiteralKit<readonly [Exclude<L[number], D[number]>, ...Array<...>]>`; non-empty argument; empty complement is a compile error via branded conditional; runtime `HashSet.fromIterable(dropped)` + one ordered `A.filter` |
| `$match` → `match` | rename, exhaustive, both overloads; codemod; `Unify<MatchReturn<Cases>>` typing kept |
| `matchOrElse` | added in this lane, both overloads, `orElse` receives the remainder; mirrors `Schema.TaggedUnion.matchOrElse` |
| `is`, `Enum` | names kept; `guards` / `values` recorded as rejected alternatives |
| `toTaggedUnion` | stays on the kit (measured: 48 instantiations untouched vs 3,159 when its type is read, 240 members) |
| Match combinator (`whenLiterals`) | withdrawn; `Match.whenOr(...Kit.literals, Kit.match(cases))` composes today (probe verified) |
| `transform` on omit-derived kits | JSDoc Gotcha only; positional over a rest tuple; no brand, no `transformBy` |

## Implementation items in the same lane

- `MatchReturn` fix: `(...args: infer _A) => infer R` (unary handlers currently collapse to `never`); type test asserting aggregate return includes unary handlers.
- `matchLiteral`: `typeof` switch, no `Match` pipeline; keys derived once per construction and shared by every builder.
- Record builders O(n) on null-prototype objects (`Record.fromEntries` / one loop), replacing spread-in-reduce in `makeEnum`, `makeGuards`, and MappedLiteralKit's enum builders.
- Dispatch: `Object.hasOwn` guard; a miss throws `LiteralKitUnhandledCaseError { kit identity, value, members }` (follow the existing `LiteralKit*Error` TaggedError pattern).
- Constructor returns `satisfies LiteralKit<L>` instead of `as LiteralKit<L>`.
- MappedLiteralKit directional kits use the shared internal builders; no throwaway `LiteralKit(from)`; they gain `pick`/`omit`/`match`/`matchOrElse`. No rename of the directional `Enum` (follow-up).
- Typeperf fixture pair `literal-kit-large-untagged` (untouched / touched arms) with baseline; `--extendedDiagnostics` before/after on `@beep/schema`, repo-cli, law-practice-domain as the trim PR did.
- Dispatch benchmark (typeof-switch vs direct index) recorded as evidence; direct-index fast path and `__proto__` rejection NOT in scope (operator did not select; fast path ships only if a future bench justifies it).
- Codemod (schema-parity engine, new rule): `$match` → `match` (member rename), `LiteralKit(X.pick([...]).literals)` → `X.pick([...])` (11 sites); `CitingApplicationIdentity` 234-literal complement → `OfficeCode.omit(["US", "XX"])` by hand after a census of `.literals[0]` reads and `transform` uses.
- `withLiteralKitStatics` Pick updated to the new member names.
- No changeset: `@beep/schema` is `private: true` and `.changeset/config.json` has `privatePackages.version: false`.

## Doctrine amendments (DECISIONS.md "Upstream-First Foundation/Modeling" + §11 rule text)

1. Coverage must survive the derivation consumers perform: a facet is covered only if the
   upstream result type consumers program against, after that derivation, still carries what
   they used. Precedent: upstream `pick` returning a bare `Literals` re-wrapped at 11 sites.
2. Construction is neutral in the facet census: construction lines leave the covered sum in
   rule 2. Precedent: 2,054 vs 2,048 was an artefact; without construction, 2,054 vs 527.
3. A facet whose replacement changes meaning (computed complement → enumerated list) needs its
   own decision row stating the semantic loss, regardless of site count. Precedent: `omit`,
   13 sites, below the 100-consumer census threshold.

## Packet and records

- New goal packet, working slug `literal-kit-subset-algebra`, archetype standard-delivery,
  `--from-exploration` none (provenance: effect-schema-parity decision log).
- `goals/effect-schema-parity/SPEC.md` decision log: dated reopening rows for `omit`/`pick`
  (doctrine requires reopening in the ruling packet's log) citing the new packet.
- `explorations/effect-schema-parity/DECISIONS.md`: same rows (the 2026-09-15 entry lives there).
- `standards/architecture/DECISIONS.md` + `standards/architecture/11-evolution-and-deprecation.md`:
  the three amendments, dated 2026-10-22.
- `explorations/INBOX.md`: two bullets — MappedLiteralKit directional `Enum` → `map`
  (`From.Enum.OK === 200` while `From.is.OK` recognises `"OK"`); AST-derived helpers
  (`LiteralKit.of(schema)`) so helpers survive `S.optional`/`S.Union`/brands and the upstream
  ask shrinks to a members annotation.

## Upstream (Effect-TS/effect via fork `~/YeeBois/forks/effect`, on `main`, clean)

- Issues now: `Schema.Literals.omit` (signature + stale-complement rationale); `Match.literals` /
  `Match.literalsExhaustive` (record form for bare literal unions, analogous to `tags` /
  `tagsExhaustive`).
- PRs after the local lane lands and its type tests prove the shapes; local `omit` is deleted
  if upstream merges.
- Hygiene (operator 2026-10-22): the upstream work follows Effect's `CONTRIBUTING.md` and code
  style, not beep-effect's laws (no `@beep` idioms, no `LiteralKit` vocabulary, Effect's
  changeset and test conventions, dprint/eslint as the repo configures). PR and issue prose is
  written through `/unslop`. No AI attribution anywhere on upstream commits, PR bodies or
  issues: no "Generated with Claude Code", no `Co-Authored-By: Claude`, no Codex mentions.
  Read upstream's open
  issues/PRs for `Literals` and `Match` first to avoid duplicating an in-flight proposal.

## Evidence files

`2026-10-22-panel-synthesis.md`, `2026-10-22-adhd-wide-set.md`, `panel/fable-implementation-review.md`, `panel/muse.md`, `panel/astra.md`,
`panel/grok.md`, probes `probes/annotation-needs.probe.ts` and `probes/match-return-and-whenor.probe.ts` (MatchReturn
defect, whenOr composition).
