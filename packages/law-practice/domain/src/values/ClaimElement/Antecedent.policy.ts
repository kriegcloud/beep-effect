/**
 * Pure 35 U.S.C. 112(b) antecedent-basis policy: its contract and the
 * deterministic rule set that binds to it.
 *
 * **Details**
 *
 * `antecedentPolicy` resolves every `the`/`said` term along each dependency
 * chain of its claim and reports the terms that fail, so its findings are
 * advisory review evidence rather than a pass/fail gate.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { PatentClaim } from "../PatentDocument/PatentDocument.model.ts";
import { AntecedentFinding, AntecedentRuleId } from "./AntecedentFinding.model.ts";
import { ClaimTermIntroducingDeterminer, ClaimTermReferringDeterminer } from "./ClaimElement.behavior.ts";
import { ClaimTermDeterminer, ClaimTermRef } from "./ClaimElement.model.ts";
import type { AntecedentPolicyInput } from "./AntecedentFinding.model.ts";
import type { ClaimTerm } from "./ClaimElement.model.ts";
import type { ClaimElementTree } from "./ClaimElement.tree.model.ts";

/**
 * Pure antecedent-basis decision over one document's claim-element trees.
 *
 * **Details**
 *
 * The trees are the decompositions of the document's claims, at most one per
 * claim number. The claim set supplies the dependency graph: every
 * referring term resolves only along its claim's dependency chains, never
 * through sibling claims, and a multiple dependent claim is checked once per
 * chain, so its findings carry the `chain` they were resolved against.
 *
 * The policy is total and deterministic. It returns typed advisory findings,
 * never a failure: an empty result means no rule fired, and a term no rule
 * covers is reported as `pattern-not-covered` rather than passed silently.
 *
 * Two inputs have no dependency chain to resolve against, and both yield
 * `pattern-not-covered` findings instead of a pass, a skip or a throw:
 *
 * - a tree whose `claimNumber` names no claim of the set yields one
 *   `pattern-not-covered` finding per referring term of that tree;
 * - a referring term whose dependency chain passes through a claim with no
 *   tree (a claim the decomposer could not decompose) yields one
 *   `pattern-not-covered` finding for that chain, because its antecedents
 *   cannot be read.
 *
 * **Gotchas**
 *
 * Trees normally come from a `ClaimElementDecomposer` over the same set, so a
 * tree outside the set signals a caller bug; it is still reported, never
 * dropped.
 *
 * **Example** (Bind a policy that reports every term as uncovered)
 *
 * ```ts
 * import * as A from "effect/Array"
 * import * as S from "effect/Schema"
 * import {
 *   AntecedentFinding,
 *   AntecedentPolicyInput,
 *   AntecedentRuleId,
 *   ClaimTermRef
 * } from "@beep/law-practice-domain/values/ClaimElement"
 * import type { AntecedentPolicy } from "@beep/law-practice-domain/values/ClaimElement"
 * import { PatentClaim } from "@beep/law-practice-domain/values/PatentDocument"
 *
 * const PosInt = S.Int.check(S.isGreaterThan(0))
 * const rule = AntecedentRuleId.make("no-rule-yet")
 *
 * const uncovered: AntecedentPolicy = ({ trees }) =>
 *   A.flatMap(trees, (tree) =>
 *     A.flatMap(tree.elements, (element) =>
 *       A.map(element.terms, (term) =>
 *         AntecedentFinding.cases["pattern-not-covered"].make({
 *           referring: ClaimTermRef.make({ anchor: term.anchor, path: element.path }),
 *           rule
 *         })
 *       )
 *     )
 *   )
 *
 * const claim = PatentClaim.cases.independent.make({
 *   body: "a sensor",
 *   claimNumber: PosInt.make(1),
 *   claimText: "A system comprising a sensor.",
 *   preamble: "A system",
 *   transition: "comprising"
 * })
 * console.log(uncovered(AntecedentPolicyInput.make({ trees: [], claims: [claim] })).length) // 0
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AntecedentPolicy = (input: AntecedentPolicyInput) => ReadonlyArray<AntecedentFinding>;

const rule = {
  definiteWithoutIntroduction: AntecedentRuleId.make("definite-without-introduction"),
  multipleIntroductions: AntecedentRuleId.make("multiple-introductions"),
  determinerNumberMismatch: AntecedentRuleId.make("determiner-number-mismatch"),
  ordinalVariants: AntecedentRuleId.make("ordinal-variants"),
  outsideChain: AntecedentRuleId.make("outside-chain"),
  treeWithoutClaim: AntecedentRuleId.make("tree-without-claim"),
  chainThroughUndecomposed: AntecedentRuleId.make("chain-through-undecomposed"),
  chainUnresolvable: AntecedentRuleId.make("chain-unresolvable"),
};

/** One term of one tree, with the claim it belongs to and its reference. */
type LocatedTerm = { readonly claimNumber: number; readonly ref: ClaimTermRef; readonly term: ClaimTerm };

/** A dependency chain from the checked claim towards its root, and whether every step could be followed. */
type Chain = { readonly claims: A.NonEmptyReadonlyArray<number>; readonly resolvable: boolean };

/** A finding with its sort key. */
type Ranked = {
  readonly claimNumber: number;
  readonly start: number;
  readonly chain: ReadonlyArray<number>;
  readonly finding: AntecedentFinding;
};

/** `O.none()` resolves the term; `O.some(finding)` reports it. */
type Verdict = O.Option<AntecedentFinding>;

const isIntroducingDeterminer = S.is(ClaimTermIntroducingDeterminer);
const isReferringDeterminer = S.is(ClaimTermReferringDeterminer);
const isIntroducing = ({ term }: LocatedTerm): boolean => isIntroducingDeterminer(term.determiner);
const isReferring = ({ term }: LocatedTerm): boolean => isReferringDeterminer(term.determiner);

// Rule `non-referential-idiom`: "the same", "the art", ... carry no antecedent.
const idiomWords = HashSet.make("same", "like", "art", "other", "following", "case");
const isIdiom = ({ term }: LocatedTerm): boolean =>
  ClaimTermDeterminer.is.the(term.determiner) && HashSet.has(idiomWords, A.headNonEmpty(Str.split(term.head, " ")));

const locatedTerms = (tree: ClaimElementTree): ReadonlyArray<LocatedTerm> =>
  A.flatMap(tree.elements, (element) =>
    A.map(element.terms, (term) => ({
      claimNumber: tree.claimNumber,
      ref: ClaimTermRef.make({ path: element.path, anchor: term.anchor }),
      term,
    }))
  );

const locatedOrder = Order.combine(
  Order.mapInput(Num.Order, ({ claimNumber }: LocatedTerm) => claimNumber),
  Order.mapInput(Num.Order, ({ term }: LocatedTerm) => term.anchor.startChar)
);

const chainOrder = Order.mapInput(A.makeOrder(Num.Order), ({ claims }: Chain) => claims);

const rankedOrder = Order.combineAll([
  Order.mapInput(Num.Order, ({ claimNumber }: Ranked) => claimNumber),
  Order.mapInput(Num.Order, ({ start }: Ranked) => start),
  Order.mapInput(A.makeOrder(Num.Order), ({ chain }: Ranked) => chain),
]);

// Rule `chain-unresolvable`: a reference to a missing or non-earlier claim ends the chain unresolved.
const chainsOf =
  (claimIndex: HashMap.HashMap<number, PatentClaim>) =>
  (claim: PatentClaim): ReadonlyArray<Chain> =>
    PatentClaim.match(claim, {
      independent: ({ claimNumber }): ReadonlyArray<Chain> => [{ claims: [claimNumber], resolvable: true }],
      dependent: ({ claimNumber, claimReferences }) =>
        A.flatMap(claimReferences, (parent) =>
          pipe(
            HashMap.get(claimIndex, parent),
            O.filter(() => parent < claimNumber),
            O.match({
              onNone: (): ReadonlyArray<Chain> => [{ claims: [claimNumber, parent], resolvable: false }],
              onSome: (ancestor) =>
                A.map(chainsOf(claimIndex)(ancestor), (chain) => ({
                  ...chain,
                  claims: A.prepend(chain.claims, claimNumber),
                })),
            })
          )
        ),
    });

// Number normalization on the last word: ies -> y, (s|x|ch|sh)es -> drop es, final s -> drop.
const singularRules: ReadonlyArray<readonly [RegExp, string]> = [
  [/ies$/u, "y"],
  [/(s|x|ch|sh)es$/u, "$1"],
  [/s$/u, ""],
];

const singularWord = (word: string): string =>
  pipe(
    A.findFirst(singularRules, ([pattern]) => O.isSome(Str.match(pattern)(word))),
    O.map(([pattern, replacement]) => Str.replace(pattern, replacement)(word)),
    O.getOrElse(() => word)
  );

const singularHead = (head: string): string => {
  const words = Str.split(head, " ");
  return A.join(A.append(A.initNonEmpty(words), singularWord(A.lastNonEmpty(words))), " ");
};

// "first sensor" or "optical sensor" for "sensor": exactly one modifier word before the referring head.
const isSingleModifiedOf =
  (head: string) =>
  (candidate: string): boolean =>
    Str.endsWith(` ${head}`)(candidate) &&
    !pipe(Str.slice(0, Str.length(candidate) - Str.length(head) - 1)(candidate), Str.includes(" "));

// Zero matches: the step does not apply. One or many: the step decides.
const byCount = <B>(
  matches: ReadonlyArray<LocatedTerm>,
  onOne: (match: LocatedTerm) => B,
  onMany: (first: LocatedTerm, second: LocatedTerm, others: ReadonlyArray<LocatedTerm>) => B
): O.Option<B> =>
  A.matchLeft(matches, {
    onEmpty: () => O.none(),
    onNonEmpty: (first, rest) =>
      O.some(
        A.matchLeft(rest, {
          onEmpty: () => onOne(first),
          onNonEmpty: (second, others) => onMany(first, second, others),
        })
      ),
  });

const uncovered = (referring: LocatedTerm, ruleId: AntecedentRuleId): AntecedentFinding =>
  AntecedentFinding.cases["pattern-not-covered"].make({ rule: ruleId, referring: referring.ref });

// In-chain resolution: `O.none()` when no step applies, else the step's verdict.
const resolveInChain = (introductions: ReadonlyArray<LocatedTerm>, referring: LocatedTerm, chain: Chain) => {
  const head = referring.term.head;
  const resolved = (): Verdict => O.none();
  const ambiguous =
    (ruleId: AntecedentRuleId) =>
    (first: LocatedTerm, second: LocatedTerm, others: ReadonlyArray<LocatedTerm>): Verdict =>
      O.some(
        AntecedentFinding.cases["ambiguous-antecedent"].make({
          rule: ruleId,
          referring: referring.ref,
          chain: chain.claims,
          candidates: [first.ref, second.ref, ...A.map(others, ({ ref }) => ref)],
        })
      );
  return pipe(
    byCount(
      A.filter(introductions, ({ term }) => Str.Equivalence(term.head, head)),
      resolved,
      ambiguous(rule.multipleIntroductions)
    ),
    O.orElse(() =>
      byCount(
        A.filter(introductions, ({ term }) => Str.Equivalence(singularHead(term.head), singularHead(head))),
        (introducing): Verdict =>
          O.some(
            AntecedentFinding.cases["number-mismatch"].make({
              rule: rule.determinerNumberMismatch,
              referring: referring.ref,
              chain: chain.claims,
              introducing: introducing.ref,
            })
          ),
        ambiguous(rule.determinerNumberMismatch)
      )
    ),
    // Rule `single-modified-introduction` resolves one modified introduction; several are `ordinal-variants`.
    O.orElse(() =>
      byCount(
        A.filter(introductions, ({ term }) => isSingleModifiedOf(head)(term.head)),
        resolved,
        ambiguous(rule.ordinalVariants)
      )
    )
  );
};

// Rule `chain-through-undecomposed`: only a resolution inside the decomposed claims passes.
const partialVerdict = (introductions: ReadonlyArray<LocatedTerm>, referring: LocatedTerm, chain: Chain): Verdict =>
  pipe(
    resolveInChain(introductions, referring, chain),
    O.filter(O.isNone),
    O.getOrElse(() => O.some(uncovered(referring, rule.chainThroughUndecomposed)))
  );

const fullVerdict = (
  terms: ReadonlyArray<LocatedTerm>,
  introductions: ReadonlyArray<LocatedTerm>,
  referring: LocatedTerm,
  chain: Chain
): Verdict =>
  pipe(
    resolveInChain(introductions, referring, chain),
    O.orElse(() =>
      O.map(
        A.findFirst(
          terms,
          (candidate) =>
            isIntroducing(candidate) &&
            !A.contains(chain.claims, candidate.claimNumber) &&
            Str.Equivalence(candidate.term.head, referring.term.head)
        ),
        (introducing): Verdict =>
          O.some(
            AntecedentFinding.cases["antecedent-outside-chain"].make({
              rule: rule.outsideChain,
              referring: referring.ref,
              chain: chain.claims,
              introducing: introducing.ref,
            })
          )
      )
    ),
    O.getOrElse(
      (): Verdict =>
        O.some(
          AntecedentFinding.cases["missing-antecedent"].make({
            rule: rule.definiteWithoutIntroduction,
            referring: referring.ref,
            chain: chain.claims,
          })
        )
    )
  );

const readableVerdict = (
  terms: ReadonlyArray<LocatedTerm>,
  decomposed: HashSet.HashSet<number>,
  referring: LocatedTerm,
  chain: Chain
): Verdict => {
  const introductions = A.filter(
    terms,
    (candidate) =>
      isIntroducing(candidate) &&
      A.contains(chain.claims, candidate.claimNumber) &&
      (candidate.claimNumber !== referring.claimNumber ||
        candidate.term.anchor.startChar < referring.term.anchor.startChar)
  );
  return A.every(chain.claims, (claimNumber) => HashSet.has(decomposed, claimNumber))
    ? fullVerdict(terms, introductions, referring, chain)
    : partialVerdict(introductions, referring, chain);
};

const verdictFor = (
  terms: ReadonlyArray<LocatedTerm>,
  decomposed: HashSet.HashSet<number>,
  referring: LocatedTerm,
  chain: Chain
): Verdict =>
  chain.resolvable
    ? readableVerdict(terms, decomposed, referring, chain)
    : O.some(uncovered(referring, rule.chainUnresolvable));

/**
 * Deterministic rule policy: resolves every referring term along each dependency chain of its claim.
 *
 * **Details**
 *
 * Referring terms are `the`/`said` terms, except the idioms `the same`,
 * `the like`, `the art`, `the other`, `the following` and `the case`. Along one
 * chain, a term's introductions are the `a`/`an`/`at least one`/`plurality of`
 * terms earlier in its own claim or anywhere in an ancestor claim. Then, in
 * order:
 *
 * - exactly one introduction with the same head resolves it; several are
 *   `ambiguous-antecedent`;
 * - otherwise a head that differs only in grammatical number is
 *   `number-mismatch` (several: `ambiguous-antecedent`);
 * - otherwise exactly one introduction with one extra modifier word ("an
 *   optical sensor" for "the sensor") resolves it; several, as with "a first
 *   sensor" and "a second sensor", are `ambiguous-antecedent`;
 * - otherwise an introduction in a claim outside the chain is
 *   `antecedent-outside-chain`, and no introduction at all is
 *   `missing-antecedent`.
 *
 * Coverage limits yield `pattern-not-covered`: a tree whose claim is not in
 * the set, a chain that reaches an absent or non-earlier claim, and a chain
 * through a claim with no tree when the term does not resolve inside the
 * decomposed part. Findings are sorted by claim number, referring span start,
 * then chain; identical findings are reported once.
 *
 * **Example** (Report a definite term without an introduction)
 *
 * ```ts
 * import * as A from "effect/Array"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * import {
 *   AntecedentPolicyInput,
 *   antecedentPolicy,
 *   DecomposeClaimInput,
 *   decomposeClaim
 * } from "@beep/law-practice-domain/values/ClaimElement"
 * import { PatentClaim } from "@beep/law-practice-domain/values/PatentDocument"
 *
 * const PosInt = S.Int.check(S.isGreaterThan(0))
 *
 * const claim = PatentClaim.cases.independent.make({
 *   body: "a controller mounted in the housing.",
 *   claimNumber: PosInt.make(1),
 *   claimText: "A system comprising: a controller mounted in the housing.",
 *   preamble: "A system",
 *   transition: "comprising"
 * })
 * const tree = Effect.runSync(decomposeClaim(DecomposeClaimInput.make({ claim, claims: [claim] })))
 * const findings = antecedentPolicy(AntecedentPolicyInput.make({ trees: [tree], claims: [claim] }))
 * console.log(A.map(findings, ({ kind }) => kind)) // ["missing-antecedent"]
 * ```
 *
 * @category policies
 * @since 0.0.0
 */
export const antecedentPolicy: AntecedentPolicy = ({ trees, claims }) => {
  const claimIndex = HashMap.fromIterable(
    A.map(claims, (claim): readonly [number, PatentClaim] => [claim.claimNumber, claim])
  );
  const decomposed = HashSet.fromIterable(A.map(trees, ({ claimNumber }) => claimNumber));
  const terms = A.sort(A.flatMap(trees, locatedTerms), locatedOrder);
  const ranked = A.flatMap(trees, (tree): ReadonlyArray<Ranked> => {
    const referringTerms = A.filter(locatedTerms(tree), (term) => isReferring(term) && !isIdiom(term));
    const rank = (referring: LocatedTerm, chain: ReadonlyArray<number>, finding: AntecedentFinding): Ranked => ({
      claimNumber: tree.claimNumber,
      start: referring.term.anchor.startChar,
      chain,
      finding,
    });
    return pipe(
      HashMap.get(claimIndex, tree.claimNumber),
      O.match({
        onNone: () =>
          A.map(referringTerms, (referring) => rank(referring, [], uncovered(referring, rule.treeWithoutClaim))),
        onSome: (claim) => {
          const chains = A.sort(chainsOf(claimIndex)(claim), chainOrder);
          return A.flatMap(referringTerms, (referring) =>
            A.getSomes(
              A.map(chains, (chain) =>
                O.map(verdictFor(terms, decomposed, referring, chain), (finding) =>
                  rank(referring, chain.claims, finding)
                )
              )
            )
          );
        },
      })
    );
  });
  return A.dedupe(A.map(A.sort(ranked, rankedOrder), ({ finding }) => finding));
};
