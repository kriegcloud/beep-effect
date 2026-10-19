/**
 * Read-only goal completion verification and explicit clone-scoped receipt refresh.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import { Command, Flag } from "effect/cli";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { appendContainedFileString, readContainedFileStringNoFollow } from "../../internal/cli/FsGuards.ts";
import { JsonStringCodec } from "../../internal/schema/JsonCodec.ts";
import { resolveProofLedgerLocation } from "../Yeet/internal/ArtifactPaths.ts";
import { decideYeetReviewWindow, YEET_REVIEW_WINDOW_DEFAULT } from "../Yeet/internal/ReviewWindow.ts";
import { YeetVerdict } from "../Yeet/internal/Verdict.ts";
import { YeetCommandError } from "../Yeet/Yeet.errors.ts";
import {
  GoalCompletionEvidenceInput,
  GoalMergeTimeEvidenceRequest,
  GoalObservedCheckRun,
} from "./CompletionEvidence.schemas.ts";
import {
  decideGoalCompletionEvidence,
  describeGoalCompletionEvidence,
  readGoalCompletionGit,
  readGoalCompletionGithub,
  readGoalCompletionJson,
  readGoalMergeTimeEvidence,
} from "./CompletionEvidence.ts";
import {
  GoalAcceptanceEvidenceRef,
  GoalCheckConclusion,
  GoalCompletionReceipt,
  GoalEvidenceCheck,
  GoalManifest,
  GoalMergeResult,
  GoalNonRequiredRed,
  GoalRequiredCheckFact,
  GoalRequiredCheckSnapshot,
  goalPullRequestRefs,
} from "./Goals.schemas.ts";
import { listGoalPackets, parseGoalManifestText } from "./Inventory.ts";
import { canonicalJsonText, sha256Hex } from "./PacketCore/PacketDigest.ts";
import type { GoalCompletionEvidenceVerdict, GoalCompletionOutcome, GoalPullRequestRef } from "./Goals.schemas.ts";
import type { GoalPacketRecord } from "./Inventory.ts";

const $I = $RepoCliId.create("commands/Goals/Completion");
const hostedRef = GoalAcceptanceEvidenceRef.make({ kind: "hosted-required-checks", ref: "required", gating: true });

/**
 * Pure verification input: absence is explicit and cannot become a success by default.
 *
 * **Example** (Inspect the observation boundary)
 *
 * ```ts
 * import { GoalCompletionObservation } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(GoalCompletionObservation.fields.merged)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GoalCompletionObservation extends S.Opaque<GoalCompletionObservation, { readonly brand: unique symbol }>()(
  S.Struct({
    repository: S.NonEmptyString,
    packet: S.NonEmptyString,
    declarationDigest: S.NonEmptyString,
    acceptedDeclarationDigest: S.Option(S.NonEmptyString),
    requiredChecks: S.Option(GoalRequiredCheckSnapshot).pipe(S.withConstructorDefault(Effect.succeedNone)),
    finalPullRequest: S.Int.check(S.isGreaterThan(0)),
    acceptedHead: S.Option(S.NonEmptyString),
    merged: S.Option(S.Boolean),
    merge: S.Option(GoalMergeResult),
    grandfathered: S.Boolean,
    evidence: S.Array(GoalEvidenceCheck),
    requiredCheckFacts: S.Array(GoalRequiredCheckFact).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<GoalRequiredCheckFact>()))
    ),
    nonRequiredReds: S.Array(GoalNonRequiredRed),
    subClaims: S.Array(GoalEvidenceCheck),
    verifiedAt: S.DateTimeUtcFromString,
  }).pipe(
    $I.annoteSchema("GoalCompletionObservation", {
      description: "Facts observed once for a declared final PR, separate from the pure completion decision.",
    })
  )
) {}

/**
 * Decides the merge-time evidence verdict for an observation or stored receipt.
 *
 * **Details**
 *
 * The verdict is re-derived from the stored rule-suite inventory and head-bound
 * facts every time, so a persisted `verified` outcome or `inventoryComplete`
 * flag cannot bypass incomplete evidence.
 *
 * **Example** (Inspect the verdict reader)
 *
 * ```ts
 * import { goalCompletionVerdict } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(typeof goalCompletionVerdict)
 * ```
 *
 * @param observation - Observation or receipt holding merge, head, inventory and facts.
 * @returns The verified, unsatisfied or unknown evidence verdict.
 * @category validation
 * @since 0.0.0
 */
export const goalCompletionVerdict = (
  observation: Pick<GoalCompletionObservation, "merge" | "acceptedHead" | "requiredChecks" | "requiredCheckFacts">
): GoalCompletionEvidenceVerdict =>
  decideGoalCompletionEvidence(
    GoalCompletionEvidenceInput.make({
      acceptedHead: observation.acceptedHead,
      mergeCommit: O.map(observation.merge, (merge) => merge.mergeCommit),
      requiredChecks: observation.requiredChecks,
      facts: observation.requiredCheckFacts,
    })
  );

const overallOutcome = (observation: GoalCompletionObservation): GoalCompletionOutcome => {
  if (observation.grandfathered) return "verified";
  if (O.contains(false)(observation.merged)) return "unsatisfied";
  const verdict = goalCompletionVerdict(observation);
  const gating = A.filter(observation.evidence, (check) => check.ref.gating);
  if (
    verdict._tag === "unsatisfied" ||
    A.some(
      gating,
      (check) =>
        check.outcome === "unsatisfied" ||
        O.exists(check.observedHead, (head) => !O.contains(head)(observation.acceptedHead))
    )
  )
    return "unsatisfied";
  if (
    O.isNone(
      O.all({
        merged: observation.merged,
        merge: observation.merge,
        head: observation.acceptedHead,
        declaration: observation.acceptedDeclarationDigest,
      })
    ) ||
    A.isReadonlyArrayEmpty(gating) ||
    verdict._tag !== "verified" ||
    A.some(gating, (check) => check.outcome === "unknown" || O.isNone(check.observedHead))
  )
    return "unknown";
  return "verified";
};

/**
 * Resolves observations without IO; substitutes cleanly in fixtures and offline callers.
 *
 * **Example** (Inspect the verifier service)
 *
 * ```ts
 * import { GoalCompletionVerifier } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(typeof GoalCompletionVerifier.of)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class GoalCompletionVerifier extends Context.Service<
  GoalCompletionVerifier,
  {
    readonly resolve: (observation: GoalCompletionObservation) => Effect.Effect<GoalCompletionReceipt>;
  }
>()($I`GoalCompletionVerifier`) {
  /**
   * Resolve a receipt from a complete, typed observation.
   *
   * **Example** (Inspect the pure resolver)
   *
   * ```ts
   * import { GoalCompletionVerifier } from "@beep/repo-cli/commands/Goals/Completion"
   * console.log(typeof GoalCompletionVerifier.resolve)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly resolve = Effect.fn("Goals.Completion.resolve")((observation: GoalCompletionObservation) =>
    Effect.succeed(
      GoalCompletionReceipt.make({
        schemaVersion: "goal-completion-receipt/v1",
        repository: observation.repository,
        packet: observation.packet,
        declarationDigest: observation.declarationDigest,
        acceptedDeclarationDigest: observation.acceptedDeclarationDigest,
        requiredChecks: observation.requiredChecks,
        finalPullRequest: observation.finalPullRequest,
        acceptedHead: observation.acceptedHead,
        merge: observation.merge,
        evidence: observation.evidence,
        requiredCheckFacts: observation.requiredCheckFacts,
        nonRequiredReds: observation.nonRequiredReds,
        subClaims: observation.subClaims,
        outcome: overallOutcome(observation),
        verifiedAt: observation.verifiedAt,
      })
    )
  );
}

const Pull = S.Struct({
  created_at: S.DateTimeUtcFromString,
  number: S.Int,
  merged: S.Boolean,
  merged_at: S.OptionFromNullOr(S.DateTimeUtcFromString),
  merge_commit_sha: S.OptionFromNullOr(S.NonEmptyString),
  head: S.Struct({ sha: S.NonEmptyString }),
  base: S.Struct({ ref: S.NonEmptyString, repo: S.Struct({ full_name: S.NonEmptyString }) }),
});
const Commit = S.Struct({
  sha: S.NonEmptyString,
  parents: S.Array(S.Struct({ sha: S.NonEmptyString })),
  commit: S.Struct({ tree: S.Struct({ sha: S.NonEmptyString }) }),
});
const CheckPages = S.Array(S.Struct({ check_runs: S.Array(GoalObservedCheckRun) }));
const TimelinePages = S.Struct({ event: S.String, created_at: S.optionalKey(S.DateTimeUtcFromString) }).pipe(
  S.Array,
  S.Array
);
const ReceiptJson = JsonStringCodec(GoalCompletionReceipt);
/**
 * Digests the decoded completion declaration, initiative identity and packet identity canonically.
 *
 * **Example** (Inspect the digest operation)
 *
 * ```ts
 * import { goalCompletionDeclarationDigest } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(typeof goalCompletionDeclarationDigest)
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const goalCompletionDeclarationDigest = Effect.fn("Goals.Completion.declarationDigest")(function* (
  manifest: GoalManifest
) {
  const gate = yield* S.encodeEffect(GoalManifest)(manifest);
  return yield* sha256Hex(
    canonicalJsonText({
      initiative: { id: manifest.initiative.id },
      packetId: manifest.initiative.packetId,
      completionGate: gate.completionGate,
      pullRequests: goalPullRequestRefs(manifest),
    })
  );
});
const evidenceCheck = (
  ref: GoalAcceptanceEvidenceRef,
  outcome: GoalCompletionOutcome,
  head: O.Option<string>,
  detail: string
) => GoalEvidenceCheck.make({ ref, outcome, observedHead: head, detail });

const readLocalEvidence = Effect.fn("Goals.Completion.localEvidence")(function* (
  root: string,
  ref: GoalAcceptanceEvidenceRef,
  head: string
) {
  if (ref.kind !== "yeet-verdict")
    return evidenceCheck(
      ref,
      "unknown",
      O.none(),
      `${ref.kind} reference needs an independently head-bound provider; no evidence inferred from its path.`
    );
  const read = yield* readContainedFileStringNoFollow(root, ref.ref).pipe(Effect.option);
  const verdict =
    O.isSome(read) && O.isSome(read.value.contents)
      ? yield* JsonStringCodec(YeetVerdict).decode(read.value.contents.value).pipe(Effect.option)
      : O.none<YeetVerdict>();
  if (O.isNone(verdict)) return evidenceCheck(ref, "unknown", O.none(), "Yeet verdict absent, invalid or unreadable.");
  const observedHead = verdict.value.resolvedHeadSha;
  const ready = O.map(verdict.value.mergeReady, (value) => value.ready);
  const outcome = Match.value({ observedHead, ready }).pipe(
    Match.when(
      ({ observedHead, ready }) => O.exists(observedHead, (value) => value !== head) || O.contains(false)(ready),
      (): GoalCompletionOutcome => "unsatisfied"
    ),
    Match.when(
      ({ observedHead, ready }) => O.isSome(ready) && O.isSome(observedHead),
      (): GoalCompletionOutcome => "verified"
    ),
    Match.orElse((): GoalCompletionOutcome => "unknown")
  );
  return evidenceCheck(
    ref,
    outcome,
    observedHead,
    "Yeet verdict checked against resolvedHeadSha and mergeReady.ready."
  );
});

const readAcceptedManifest = Effect.fn("Goals.Completion.acceptedManifest")(function* (
  root: string,
  head: string,
  slug: string
) {
  const acceptedText = yield* readGoalCompletionGit(root, ["show", `${head}:goals/${slug}/ops/manifest.json`]).pipe(
    Effect.catchTag("YeetCommandError", () =>
      readGoalCompletionGithub(root, [
        "api",
        `repos/{owner}/{repo}/contents/goals/${slug}/ops/manifest.json?ref=${head}`,
        "-H",
        "Accept: application/vnd.github.raw+json",
      ])
    ),
    Effect.option
  );
  const acceptedParsed = O.flatMap(acceptedText, parseGoalManifestText);
  const acceptedManifest = O.isSome(acceptedParsed)
    ? yield* S.decodeUnknownEffect(GoalManifest)(acceptedParsed.value).pipe(Effect.option)
    : O.none<GoalManifest>();
  return acceptedManifest;
});

const readDeclaredEvidence = Effect.fn("Goals.Completion.declaredEvidence")(function* (
  root: string,
  manifest: GoalManifest,
  head: string,
  gatingOutcome: GoalCompletionOutcome,
  initial: ReadonlyArray<GoalEvidenceCheck>
) {
  let evidence = initial;
  for (const ref of manifest.completionGate.acceptanceEvidence ?? []) {
    evidence = A.append(
      evidence,
      ref.kind === "hosted-required-checks"
        ? evidenceCheck(ref, gatingOutcome, O.some(head), "Hosted required checks at accepted head.")
        : yield* readLocalEvidence(root, ref, head)
    );
  }
  return evidence;
});

// The hosted check records what the head-bound required facts show (a red, a
// missing result, or all green). Overall verification separately needs the
// complete merge-time inventory, so newer green facts can clear an older red to
// unknown without verifying an incomplete inventory.
const hostedRequiredOutcome = (
  verdict: GoalCompletionEvidenceVerdict,
  required: O.Option<ReadonlyArray<string>>,
  facts: ReadonlyArray<GoalRequiredCheckFact>
): GoalCompletionOutcome => {
  if (verdict._tag === "unsatisfied") return "unsatisfied";
  return O.isNone(required) || A.isReadonlyArrayEmpty(facts) || A.some(facts, (fact) => fact.outcome !== "verified")
    ? "unknown"
    : "verified";
};

/**
 * Observes a final PR on GitHub without writing receipt or manifest state.
 *
 * **Example** (Inspect the read-only adapter)
 *
 * ```ts
 * import { observeGoalCompletion } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(typeof observeGoalCompletion)
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export const observeGoalCompletion = Effect.fn("Goals.Completion.observe")(function* (
  root: string,
  slug: string,
  manifest: GoalManifest,
  final: GoalPullRequestRef
) {
  const providedVerifier = yield* Effect.serviceOption(GoalCompletionVerifier);
  const resolve = O.getOrElse(
    O.map(providedVerifier, (verifier) => verifier.resolve),
    () => GoalCompletionVerifier.resolve
  );
  const digest = yield* goalCompletionDeclarationDigest(manifest);
  const verifiedAt = yield* DateTime.now;
  const initial = GoalCompletionObservation.make({
    repository: "unobserved",
    packet: slug,
    declarationDigest: digest,
    acceptedDeclarationDigest: O.none(),
    finalPullRequest: final.number,
    acceptedHead: O.none(),
    merged: O.none(),
    merge: O.none(),
    grandfathered: manifest.completionGate.grandfathered,
    evidence: [],
    nonRequiredReds: [],
    subClaims: [],
    verifiedAt,
  });
  if (initial.grandfathered) return yield* resolve(initial);
  const pullRead = yield* readGoalCompletionJson(
    root,
    ["api", `repos/{owner}/{repo}/pulls/${final.number}`],
    Pull
  ).pipe(Effect.option);
  if (O.isNone(pullRead)) return yield* resolve(initial);
  const pull = pullRead.value;
  const head = pull.head.sha;
  const known = GoalCompletionObservation.make({
    ...initial,
    repository: pull.base.repo.full_name,
    acceptedHead: O.some(head),
    merged: O.some(pull.merged),
  });
  if (!pull.merged) return yield* resolve(known);
  const reads = yield* Effect.gen(function* () {
    const mergeSha = yield* Effect.fromOption(pull.merge_commit_sha).pipe(
      Effect.mapError(() => YeetCommandError.make({ message: "Merged PR has no merge result" }))
    );
    const mergedAt = yield* Effect.fromOption(pull.merged_at).pipe(
      Effect.mapError(() => YeetCommandError.make({ message: "Merged PR has no merge time" }))
    );
    // Project only the decoded fields: a large merge commit's file patches would
    // otherwise truncate the captured response and lose the merge facts.
    const mergeCommit = yield* readGoalCompletionJson(
      root,
      [
        "api",
        `repos/{owner}/{repo}/commits/${mergeSha}`,
        "--jq",
        "{sha: .sha, parents: [.parents[] | {sha: .sha}], commit: {tree: {sha: .commit.tree.sha}}}",
      ],
      Commit
    );
    // GitHub binds this merge result to this PR head for all three workflows. A single-parent
    // result cannot distinguish squash from rebase reliably; retain method=None rather than guess.
    const merge = GoalMergeResult.make({
      mergeCommit: mergeSha,
      tree: mergeCommit.commit.tree.sha,
      mergedAt,
      method: A.length(mergeCommit.parents) === 2 ? O.some("merge") : O.none(),
      baseRef: pull.base.ref,
    });
    const acceptedManifest = yield* readAcceptedManifest(root, head, slug);
    const acceptedDeclarationDigest = O.isSome(acceptedManifest)
      ? O.some(yield* goalCompletionDeclarationDigest(acceptedManifest.value))
      : O.none<string>();
    const pages = yield* readGoalCompletionJson(
      root,
      ["api", `repos/{owner}/{repo}/commits/${head}/check-runs?per_page=100&filter=all`, "--paginate", "--slurp"],
      CheckPages
    );
    const checks = A.flatMap(pages, (page) => page.check_runs);
    const mergeTime = yield* readGoalMergeTimeEvidence(
      root,
      GoalMergeTimeEvidenceRequest.make({
        base: pull.base.ref,
        mergeCommit: mergeSha,
        mergedAt,
        acceptedHead: head,
        checkRuns: checks,
      })
    );
    const requiredChecks = mergeTime.requiredChecks;
    const required = O.map(requiredChecks, (snapshot) => snapshot.contexts);
    const verdict = goalCompletionVerdict({
      merge: O.some(merge),
      acceptedHead: O.some(head),
      requiredChecks,
      requiredCheckFacts: mergeTime.facts,
    });
    const gatingOutcome = hostedRequiredOutcome(verdict, required, mergeTime.facts);
    const hostedEvidence = A.of(
      evidenceCheck(
        hostedRef,
        gatingOutcome,
        O.some(head),
        `Required contexts observed at accepted head before merge; ${O.getOrElse(O.map(required, A.length), () => 0)} contexts. ${describeGoalCompletionEvidence(verdict)} The merge-push rule suite supplies the merge-time ruleset inventory, including rulesets deleted since then; GitHub lists rule suites for one month.`
      )
    );
    const evidence = yield* readDeclaredEvidence(root, manifest, head, gatingOutcome, hostedEvidence);
    const conclusion = (check: GoalObservedCheckRun, atMerge: boolean): GoalCheckConclusion =>
      atMerge &&
      !O.exists(check.completed_at, (time) => DateTime.toEpochMillis(time) <= DateTime.toEpochMillis(mergedAt))
        ? "pending"
        : S.is(GoalCheckConclusion)(check.conclusion)
          ? check.conclusion
          : check.status === "completed"
            ? "unknown"
            : "pending";
    const nonRequiredReds = O.match(required, {
      onNone: A.empty<GoalNonRequiredRed>,
      onSome: (contexts) =>
        A.getSomes(
          A.map(A.dedupe(A.map(checks, (check) => check.name)), (name) => {
            if (A.contains(contexts, name)) return O.none<GoalNonRequiredRed>();
            const matching = A.filter(checks, (check) => check.name === name && check.head_sha === head);
            const final = A.reduce(matching, O.none<GoalObservedCheckRun>(), (found, check) =>
              O.isNone(found) || check.id > found.value.id ? O.some(check) : found
            );
            const beforeMerge = A.filter(matching, (check) =>
              O.exists(check.started_at, (time) => DateTime.toEpochMillis(time) <= DateTime.toEpochMillis(mergedAt))
            );
            const atMerge = A.reduce(beforeMerge, O.none<GoalObservedCheckRun>(), (found, check) =>
              O.isNone(found) || check.id > found.value.id ? O.some(check) : found
            );
            if (O.isNone(final)) return O.none<GoalNonRequiredRed>();
            const conclusionFinal = conclusion(final.value, false);
            if (conclusionFinal === "success" || conclusionFinal === "neutral" || conclusionFinal === "skipped")
              return O.none<GoalNonRequiredRed>();
            return O.some(
              GoalNonRequiredRed.make({
                lane: name,
                conclusionAtMerge: O.isSome(atMerge) ? conclusion(atMerge.value, true) : "unknown",
                conclusionFinal,
                attribution: "unknown",
              })
            );
          })
        ),
    });
    const timeline = yield* readGoalCompletionJson(
      root,
      ["api", `repos/{owner}/{repo}/issues/${final.number}/timeline?per_page=100`, "--paginate", "--slurp"],
      TimelinePages
    ).pipe(Effect.option);
    const events = O.getOrElse(O.map(timeline, A.flatten), A.empty);
    const readyTimes = A.getSomes(
      A.map(
        A.filter(events, (event) => event.event === "ready_for_review"),
        (event) => O.fromUndefinedOr(event.created_at)
      )
    );
    const lastReady = A.reduce(readyTimes, O.none<DateTime.Utc>(), (found, time) =>
      O.isNone(found) || DateTime.toEpochMillis(time) > DateTime.toEpochMillis(found.value) ? O.some(time) : found
    );
    const suites = yield* readGoalCompletionJson(
      root,
      ["api", `repos/{owner}/{repo}/commits/${head}/check-suites?per_page=100`, "--paginate", "--slurp"],
      S.Struct({ check_suites: S.Array(S.Struct({ created_at: S.DateTimeUtcFromString })) }).pipe(S.Array)
    ).pipe(Effect.option);
    const received = O.flatMap(suites, (pages) =>
      A.reduce(
        A.flatMap(pages, (page) => page.check_suites),
        O.none<DateTime.Utc>(),
        (found, suite) =>
          O.isNone(found) ? O.some(suite.created_at) : O.some(DateTime.min(found.value, suite.created_at))
      )
    );
    const forced = A.getSomes(
      A.map(
        A.filter(events, (event) => event.event === "head_ref_force_pushed"),
        (event) => O.fromUndefinedOr(event.created_at)
      )
    );
    const pushedAt = O.map(received, (first) =>
      A.reduce(forced, first, (left, right) => DateTime.toUtc(DateTime.max(left, right)))
    );
    const readyAt = O.orElse(lastReady, () => (O.isSome(timeline) ? O.some(pull.created_at) : O.none()));
    const window = O.map(O.all({ pushedAt, readyAt }), (instants) =>
      decideYeetReviewWindow({
        ...instants,
        now: mergedAt,
        readyAnchor: O.isSome(lastReady) ? "ready-for-review" : "pr-opened",
        window: YEET_REVIEW_WINDOW_DEFAULT,
      })
    );
    const acceptedDeclaration = O.map(acceptedManifest, (value) => ({
      id: value.initiative.id,
      packetId: value.initiative.packetId,
      operator: value.completionGate.operator,
      requiresPullRequest: value.completionGate.requiresPullRequest,
      requiresMergeable: value.completionGate.requiresMergeable,
      grandfathered: value.completionGate.grandfathered,
      statement: value.completionGate.statement,
    }));
    const currentDeclaration = {
      id: manifest.initiative.id,
      packetId: manifest.initiative.packetId,
      operator: manifest.completionGate.operator,
      requiresPullRequest: manifest.completionGate.requiresPullRequest,
      requiresMergeable: manifest.completionGate.requiresMergeable,
      grandfathered: manifest.completionGate.grandfathered,
      statement: manifest.completionGate.statement,
    };
    const declarationOutcome = O.match(acceptedDeclaration, {
      onNone: (): GoalCompletionOutcome => "unknown",
      onSome: (value): GoalCompletionOutcome =>
        canonicalJsonText(value) === canonicalJsonText(currentDeclaration) ? "verified" : "unsatisfied",
    });
    const subClaims = [
      evidenceCheck(
        GoalAcceptanceEvidenceRef.make({ kind: "packet-history", ref: "accepted-declaration", gating: false }),
        declarationOutcome,
        O.some(head),
        "Accepted-head declaration compared with current identity and gate, excluding retrospective PR/evidence references. Changes are historical sub-claims and never reset lifecycle."
      ),
      evidenceCheck(
        GoalAcceptanceEvidenceRef.make({ kind: "packet-history", ref: "draft-to-ready", gating: false }),
        O.isNone(timeline) ? "unknown" : O.isSome(lastReady) ? "verified" : "unsatisfied",
        O.some(head),
        "ready_for_review event proves transition from draft; caller identity does not prove yeet invocation."
      ),
      evidenceCheck(
        GoalAcceptanceEvidenceRef.make({ kind: "packet-history", ref: "review-window", gating: false }),
        O.match(window, {
          onNone: (): GoalCompletionOutcome => "unknown",
          onSome: (value): GoalCompletionOutcome => (value._tag === "elapsed" ? "verified" : "unsatisfied"),
        }),
        O.some(head),
        O.match(window, {
          onNone: () => "Timeline or GitHub head receipt time unavailable.",
          onSome: (value) =>
            `Review window at merge: ${value._tag}; anchor ${value.anchoredAt}. Check-suite first receipt plus force-push events use Yeet semantics.`,
        })
      ),
      evidenceCheck(
        GoalAcceptanceEvidenceRef.make({ kind: "yeet-verdict", ref: "merge-ready", gating: false }),
        "unknown",
        O.none(),
        "No head-bound Yeet verdict inferred from timeline or successful checks."
      ),
    ];
    return GoalCompletionObservation.make({
      ...known,
      merge: O.some(merge),
      acceptedDeclarationDigest,
      requiredChecks,
      evidence,
      requiredCheckFacts: mergeTime.facts,
      nonRequiredReds,
      subClaims,
    });
  }).pipe(Effect.option);
  return yield* resolve(O.getOrElse(reads, () => known));
});

const receiptLocation = Effect.fn("Goals.Completion.receiptLocation")(function* (root: string) {
  const path = yield* Path.Path;
  const { ledgerRoot } = yield* resolveProofLedgerLocation(root);
  return { ledgerRoot, file: path.join(ledgerRoot, ".beep", "goals", "completion-receipts.ndjson") };
});

/**
 * Reads the latest matching receipt; changed declarations cannot reuse an older verdict.
 *
 * **Example** (Inspect the receipt reader)
 *
 * ```ts
 * import { storedGoalCompletion } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(typeof storedGoalCompletion)
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export const storedGoalCompletion = Effect.fn("Goals.Completion.stored")(function* (
  root: string,
  slug: string,
  manifest: GoalManifest,
  final: GoalPullRequestRef
) {
  const digest = yield* goalCompletionDeclarationDigest(manifest);
  const location = yield* receiptLocation(root);
  const read = yield* readContainedFileStringNoFollow(location.ledgerRoot, location.file);
  const text = O.getOrElse(read.contents, () => "");
  const lines = Str.split(text, "\n");
  const complete = Str.endsWith("\n")(text) ? lines : A.dropRight(lines, 1);
  const receipts = A.getSomes(A.map(complete, ReceiptJson.decodeOption));
  const remote = yield* readGoalCompletionGit(root, ["remote", "get-url", "origin"]).pipe(Effect.option);
  const repository = O.flatMap(remote, (text) =>
    O.flatMap(Str.match(/github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?\s*$/u)(text), (match) => A.get(match, 1))
  );
  const matching = A.filter(
    receipts,
    (receipt) =>
      receipt.packet === slug &&
      receipt.declarationDigest === digest &&
      receipt.finalPullRequest === final.number &&
      O.contains(receipt.repository)(repository)
  );
  const definite = A.filter(
    matching,
    (receipt) =>
      receipt.outcome !== "unknown" ||
      (O.isSome(receipt.merge) &&
        O.exists(receipt.requiredChecks, (snapshot) => snapshot.rulesetReadsComplete) &&
        A.some(
          receipt.evidence,
          (check) => check.ref.kind === "hosted-required-checks" && check.ref.gating && check.outcome !== "unknown"
        ))
  );
  const candidates = A.isReadonlyArrayNonEmpty(definite) ? definite : matching;
  const newest = A.reduce(candidates, O.none<GoalCompletionReceipt>(), (found, receipt) =>
    O.isNone(found) || DateTime.isGreaterThan(receipt.verifiedAt, found.value.verifiedAt) ? O.some(receipt) : found
  );
  if (O.isNone(newest)) return newest;
  const receipt = newest.value;
  return O.some(
    yield* GoalCompletionVerifier.resolve(
      GoalCompletionObservation.make({
        ...receipt,
        merged: O.isSome(receipt.merge) ? O.some(true) : O.none(),
        grandfathered: manifest.completionGate.grandfathered,
      })
    )
  );
});

const readRefreshManifest = Effect.fn("Goals.Completion.refreshManifest")(function* (record: GoalPacketRecord) {
  const parsed = yield* Effect.fromOption(
    O.flatMap(O.fromUndefinedOr(record.manifestText), parseGoalManifestText)
  ).pipe(Effect.mapError(() => YeetCommandError.make({ message: "Requested goal manifest is missing or invalid" })));
  return yield* S.decodeUnknownEffect(GoalManifest)(parsed).pipe(
    Effect.mapError(() => YeetCommandError.make({ message: "Requested goal manifest cannot decode" }))
  );
});
const refreshRecord = Effect.fn("Goals.Completion.refreshRecord")(function* (
  root: string,
  record: GoalPacketRecord,
  explicit: boolean,
  location: { readonly ledgerRoot: string; readonly file: string }
) {
  const decoded = readRefreshManifest(record);
  const manifest = yield* explicit ? decoded.pipe(Effect.asSome) : decoded.pipe(Effect.option);
  if (O.isNone(manifest)) return;
  if (manifest.value.completionGate.grandfathered) {
    if (explicit) yield* Console.log(`[goals:completion] ${record.slug}: grandfathered (no receipt needed)`);
    return;
  }
  const finalRead = Effect.fromOption(
    A.findFirst(goalPullRequestRefs(manifest.value), (ref) => ref.role === "final")
  ).pipe(Effect.mapError(() => YeetCommandError.make({ message: "Requested goal has no final pull request" })));
  const final = yield* explicit ? finalRead.pipe(Effect.asSome) : finalRead.pipe(Effect.option);
  if (O.isNone(final)) return;
  const receipt = yield* observeGoalCompletion(root, record.slug, manifest.value, final.value);
  if (O.isNone(receipt.merge)) {
    yield* Console.log(
      `[goals:completion] ${record.slug} #${final.value.number}: ${receipt.outcome} (no post-merge receipt written)`
    );
    return;
  }
  yield* appendContainedFileString(location.ledgerRoot, location.file, `${yield* ReceiptJson.encode(receipt)}\n`);
  yield* Console.log(`[goals:completion] ${record.slug} #${final.value.number}: ${receipt.outcome}`);
});
const refresh = Effect.fn("Goals.Completion.refresh")(function* (slug: O.Option<string>) {
  const root = yield* findRepoRoot();
  const records = yield* listGoalPackets(root);
  const location = yield* receiptLocation(root);
  if (O.exists(slug, (value) => !A.some(records, (record) => record.slug === value)))
    return yield* YeetCommandError.make({ message: "Requested goal packet does not exist" });
  const selected = O.match(slug, {
    onNone: () => records,
    onSome: (value) => A.filter(records, (record) => record.slug === value),
  });
  yield* Effect.forEach(selected, (record) => refreshRecord(root, record, O.isSome(slug), location));
});
/**
 * Explicit sole writer for derived completion receipts; doctor never calls this command.
 *
 * **Example** (Inspect the completion command)
 *
 * ```ts
 * import { goalsCompletionCommand } from "@beep/repo-cli/commands/Goals/Completion"
 * console.log(goalsCompletionCommand.name)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const goalsCompletionCommand = Command.make("completion").pipe(
  Command.withSubcommands([
    Command.make("refresh", { slug: Flag.String("slug").pipe(Flag.optional) }, ({ slug }) => refresh(slug)).pipe(
      Command.withDescription("Explicitly observe GitHub and append clone-scoped goal completion receipts")
    ),
  ])
);
