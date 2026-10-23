You are an independent reviewer with your own taste in TypeScript and Effect API design. Give your OWN preferences, with reasons. Where reasonable people would disagree, say which way you lean and why. Do not try to guess what the repo authors want; disagree with the current code or its history wherever your judgment says so.

## Setting

The repository in your working directory (`beep-effect`) is an Effect v4 monorepo. `@beep/schema` (package root `packages/foundation/modeling/schema`) exports `LiteralKit`, a wrapper over upstream `Schema.Literals` that attaches helpers keyed by the literal members. It is used in roughly 600 files. There is also `MappedLiteralKit` (`packages/foundation/modeling/schema/src/MappedLiteralKit/`), whose `From` and `To` kits carry the same helpers.

The kit used to carry more helpers than it does today. On 2026-10-01 a trim (PR #1338, commit `b26ed3a81d`) removed several of them under a doctrine that retires any facet upstream Effect already covers. Some of those removals are now being questioned. You are being asked to evaluate the whole design fresh.

Read the primary sources yourself before forming a view. Use file reads, `git show`, and `rg`. Do not modify any file and do not run git commands that change state.

- Current kit: `packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts`
- Pre-trim kit: `git show b26ed3a81d^:packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts`
- Upstream `Schema.Literals` and `Schema.TaggedUnion` (installed Effect v4): `node_modules/effect/dist/Schema.d.ts`, search for `export interface Literals<` and `export interface TaggedUnion<`
- Upstream `effect/Match`: `node_modules/effect/dist/Match.d.ts` (`type`, `value`, `when`, `whenOr`, `tags`, `tagsExhaustive`, `withReturnType`, `exhaustive`, `orElse`, `option`, and the `Types` namespace)
- `Data.taggedEnum` in `node_modules/effect/dist/Data.d.ts` for the `$match` / `$is` naming precedent
- The retirement ruling and its consumer census: `explorations/effect-schema-parity/DECISIONS.md`, entry dated 2026-09-15 titled "LiteralKit reopened at decompose: ADAPT, not RETIRE"; and the doctrine entry "Upstream-First Foundation/Modeling" in `standards/architecture/DECISIONS.md`
- The codemod that rewrote consumers: `packages/tooling/tool/cli/src/commands/Lint/internal/SchemaParityCodemodLiteralKitRule.ts`
- Repo code laws you should respect in any proposal: the "Code Laws" section of `AGENTS.md` (Effect collections over native `Set`/`Map`, `effect/<Module>` imports, schema-first)
- A representative consumer to look at real usage: `apps/labs/ciops/src/kpi/Fold.ts` (`classifyAttempt`) and `apps/labs/ciops/src/kpi/Schemas.ts` (`KpiTier`). Sample more with `rg -n "\.Enum\.|\.is\.|\.\$match\(" packages apps --glob '*.ts' | shuf -n 40` or similar.

## Questions

Answer each with a clear preference and the reasoning behind it. Sketch type signatures where they help.

1. **Which helpers should a literal-domain kit over `Schema.Literals` carry?** Judge each of the following on its own merits, ignoring whether it currently exists: the readonly members tuple; a typed subset selection (pick) and its complement (omit); a `HashSet` of members; a record of zero-argument thunks returning each member; a record of members keyed by name (`Enum`); per-member type guards (`is`); a record-form match over the members; conversion to a tagged union; a user-supplied key mapping. For each: keep, drop, or redesign, and why. Where would you draw the line between "upstream covers this" and "the kit should own it"?

2. **Naming.** For each helper you keep, what would you call it, and why? Should any helper use a `$` prefix? Should names follow `Schema.TaggedUnion`, `Data.taggedEnum`, `effect/Match`, or something else?

3. **Exhaustiveness.** Should a record-form match on a literal domain be exhaustive by default? How should non-exhaustive matching be exposed, if at all, and what should an unmatched value produce?

4. **`effect/Match` interoperability.** Should the kit offer something that composes inside a `Match.type<...>().pipe(...)` chain? If yes: what shape, what name, and how should it interact with `Match.withReturnType` and `Match.exhaustive`? If no: why not?

5. **Implementation quality.** For whatever surface you propose, evaluate the current and pre-trim implementations for runtime cost (eager allocation per kit, closures, HashSet construction), bundle size, and type-level cost (instantiation depth, `const` type parameters, conditional types). Propose concrete improvements: what to compute lazily, how statics should survive `check`/`annotate`/`pipe` derivations, what type machinery to simplify. Be specific about trade-offs.

6. **Upstream.** Would any of this belong in Effect itself, as additions to `Schema.Literals`? Which parts, in what form, and what would you leave repo-local?

7. **Existence.** Should the kit exist at all, versus plain `Schema.Literals` plus ad hoc code at call sites? Answer honestly even if the answer is uncomfortable for a 600-file consumer base.

## Deliverable

A single markdown report. Open with a one-paragraph summary of your position. Then one section per question. Close with a section titled "Where I am unsure" listing the judgments you hold least firmly, and a section titled "Disagreements with the current code or its history" listing anything in the sources you read that you think was decided wrongly, with the evidence.

Cite file paths and line numbers for every claim about the code. Do not pad. Prefer a firm opinion with a stated reason over a balanced survey.
