/**
 * Manifest-aware dependency review over the GitHub dependency-graph compare API.
 *
 * **Details**
 *
 * The review first resolves both commits (the compare API answers an empty
 * list for an unknown commit), then reads
 * `GET /repos/{owner}/{repo}/dependency-graph/compare/{base}...{head}`
 * through {@link GithubPolicyClient}, drops only the rows whose manifest
 * matches the declared fixture-path policy, and applies the thresholds the
 * pinned `actions/dependency-review-action` step enforced: added runtime rows
 * fail on a high or critical advisory, on a license a denied license alone can
 * satisfy, or on a license string that is not valid SPDX. Any GitHub read that
 * fails, and any reply that does not decode, yields the `unknown` verdict.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { SpdxExpression } from "@beep/spdx/SpdxExpression";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { dual, pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { GithubPolicyClient } from "./CiGovernance.ts";
import {
  DependencyGraphComparePages,
  DependencyReviewCounts,
  DependencyReviewFinding,
  DependencyReviewUnavailableError,
  DependencyReviewVerdict,
  dependencyReviewSettings,
} from "./DependencyReviewSchemas.ts";
import type { GithubApiReply } from "./CiGovernance.ts";
import type {
  AdvisorySeverity,
  DeniedLicense,
  DependencyChange,
  DependencyReviewRequest,
  DependencyReviewSettings,
  DependencyReviewThresholds,
  DependencyReviewUnknownReason,
  FixturePathPolicy,
} from "./DependencyReviewSchemas.ts";

const $I = $RepoCliId.create("commands/Ci/DependencyReview");

const DETAIL_LIMIT = 500;
const LOOKUP_CONCURRENCY = 4;
const TRUNCATED_LICENSE_LENGTH = 255;

const matchSegments = (pattern: ReadonlyArray<string>, path: ReadonlyArray<string>): boolean =>
  O.match(A.head(pattern), {
    onNone: () => A.isReadonlyArrayEmpty(path),
    onSome: (segment) =>
      segment === "**"
        ? matchSegments(A.drop(pattern, 1), path) ||
          (A.isReadonlyArrayNonEmpty(path) && matchSegments(pattern, A.drop(path, 1)))
        : O.exists(A.head(path), (head) => head === segment) && matchSegments(A.drop(pattern, 1), A.drop(path, 1)),
  });

/**
 * Whether a repository-relative manifest path falls under a declared fixture
 * root.
 *
 * **Details**
 *
 * Patterns match whole `/`-separated segments; `**` matches zero or more of
 * them. A path that merely resembles a fixture root (`test-fixtures/`,
 * `tests/fixtures/`, `fixtures/` without a preceding `test/`) does not match.
 *
 * **Example** (Classify a fixture and a look-alike)
 *
 * ```ts
 * import { dependencyReviewFixturePolicy, isFixtureManifest } from "@beep/repo-cli/commands/Ci"
 *
 * const isFixture = isFixtureManifest(dependencyReviewFixturePolicy)
 * console.log(isFixture("scratchpad/test/workspaces/fixtures/peers/npm/package-lock.json")) // true
 * console.log(isFixture("packages/tooling/test-fixtures/package-lock.json")) // false
 * ```
 *
 * @param policy - The declared fixture-path policy.
 * @returns A predicate over manifest paths.
 * @category predicates
 * @since 0.0.0
 */
export const isFixtureManifest =
  (policy: FixturePathPolicy) =>
  (manifest: string): boolean =>
    A.some(policy.rules, (rule) => matchSegments(Str.split(rule.pattern, "/"), Str.split(manifest, "/")));

/**
 * How one added row's license string fares against the denied licenses.
 *
 * **Example** (Recognize a denied decision)
 *
 * ```ts
 * import { LicenseDecision } from "@beep/repo-cli/commands/Ci"
 *
 * console.log(LicenseDecision.is.denied("denied")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const LicenseDecision = LiteralKit(["allowed", "denied", "unresolved", "unlicensed"]).pipe(
  $I.annoteSchema("LicenseDecision", { description: "License outcome of one added compare row." })
);

/**
 * One license decision.
 *
 * @category models
 * @since 0.0.0
 */
export type LicenseDecision = typeof LicenseDecision.Type;

class LicenseLeaf extends S.Opaque<LicenseLeaf, { readonly brand: unique symbol }>()(
  S.Struct({
    key: S.String,
    license: S.String,
    plus: S.Boolean,
    exception: S.Option(S.String),
  }).pipe($I.annoteSchema("LicenseLeaf", { description: "One normalized license term of an SPDX expression." }))
) {}

// Version families of the denied licenses, oldest first, after `-only` and
// `-or-later` normalization (the spdx-ranges data the action consults).
const LICENSE_VERSION_RANGES: ReadonlyArray<ReadonlyArray<string>> = [
  ["AGPL-1.0", "AGPL-3.0"],
  ["GPL-1.0", "GPL-2.0", "GPL-3.0"],
];

const leafOf = (id: string, plus: boolean, exception: O.Option<string>): LicenseLeaf => {
  const [license, normalizedPlus] = Str.endsWith("-or-later")(id)
    ? [Str.slice(0, -"-or-later".length)(id), true]
    : Str.endsWith("-only")(id)
      ? [Str.slice(0, -"-only".length)(id), false]
      : [id, plus];
  const key = `${license}${normalizedPlus ? "+" : ""}${O.match(exception, { onNone: () => "", onSome: (name) => `WITH ${name}` })}`;
  return LicenseLeaf.make({ key, license, plus: normalizedPlus, exception });
};

const simpleLeaf = (node: SpdxExpression, exception: O.Option<string>): LicenseLeaf =>
  node._tag === "License" ? leafOf(node.id, node.plus, exception) : leafOf(node.toString(), false, exception);

const sameLeaf = (self: LicenseLeaf, that: LicenseLeaf): boolean => self.key === that.key;
const mergeGroups = (left: ReadonlyArray<LicenseLeaf>, right: ReadonlyArray<LicenseLeaf>) =>
  A.dedupeWith(A.appendAll(left, right), sameLeaf);

// Expand an expression into OR-ed groups of AND-ed terms.
const expand: (expression: SpdxExpression) => ReadonlyArray<ReadonlyArray<LicenseLeaf>> =
  Match.type<SpdxExpression>().pipe(
    Match.tagsExhaustive({
      License: (node) => [[simpleLeaf(node, O.none())]],
      LicenseRef: (node) => [[simpleLeaf(node, O.none())]],
      WithException: (node) => [[simpleLeaf(node.license, O.some(node.exception))]],
      Or: (node) => A.appendAll(expand(node.left), expand(node.right)),
      And: (node) => pipe(expand(node.left), A.cartesianWith(expand(node.right), mergeGroups)),
    })
  );

const rangeIndex = (range: ReadonlyArray<string>, license: string) =>
  A.findFirstIndex(range, (entry) => entry === license);

const deniedByRange = (denied: string, base: string): boolean =>
  denied === base ||
  A.some(LICENSE_VERSION_RANGES, (range) =>
    pipe(
      O.all([rangeIndex(range, denied), rangeIndex(range, base)]),
      O.exists(([deniedIndex, baseIndex]) => deniedIndex >= baseIndex)
    )
  );

const leafDenied = (leaf: LicenseLeaf, denied: DeniedLicense): boolean =>
  O.isNone(leaf.exception) && (leaf.plus ? deniedByRange(denied, leaf.license) : leaf.license === denied);

const OTHER_TOKEN = /(?<![\w-])OTHER(?![\w-])/gu;

/**
 * Decide one added row's license against the denied licenses.
 *
 * **Details**
 *
 * This reproduces the pinned action's deny check. `null` and `NOASSERTION`
 * are `unlicensed`, which is reported but does not fail. ClearlyDefined's bare
 * `OTHER` token becomes `LicenseRef-clearlydefined-OTHER`. A string that is not
 * a valid SPDX expression is `unresolved`, which fails. Otherwise the
 * expression is expanded into its OR-ed alternatives and is `denied` when one
 * alternative is a single denied license: `-only` is the license itself,
 * `-or-later` and `+` cover every later version in the family, and a `WITH`
 * exception never matches a bare denied license. `MIT OR GPL-3.0` is denied
 * because GPL-3.0 alone satisfies it; `MIT AND GPL-3.0` is not, as in the
 * action.
 *
 * **Example** (Decide three licenses)
 *
 * ```ts
 * import { decideLicense } from "@beep/repo-cli/commands/Ci"
 *
 * const deny = ["AGPL-3.0", "GPL-3.0"] as const
 * console.log(decideLicense("GPL-2.0-or-later", deny)) // "denied"
 * console.log(decideLicense("MIT", deny)) // "allowed"
 * console.log(decideLicense("not a license", deny)) // "unresolved"
 * ```
 *
 * @param license - The row's license string, or `null` when GitHub has none.
 * @param denied - The denied licenses.
 * @returns The license decision.
 * @category predicates
 * @since 0.0.0
 */
export const decideLicense: {
  (denied: ReadonlyArray<DeniedLicense>): (license: string | null) => LicenseDecision;
  (license: string | null, denied: ReadonlyArray<DeniedLicense>): LicenseDecision;
} = dual(
  2,
  (license: string | null, denied: ReadonlyArray<DeniedLicense>): LicenseDecision =>
    license === null || license === "NOASSERTION"
      ? "unlicensed"
      : Result.match(
          SpdxExpression.parseResult(Str.replaceAll(OTHER_TOKEN, "LicenseRef-clearlydefined-OTHER")(license)),
          {
            onFailure: () => "unresolved",
            onSuccess: (expression) =>
              A.some(
                expand(expression),
                (group) =>
                  A.length(group) === 1 && A.some(group, (leaf) => A.some(denied, (entry) => leafDenied(leaf, entry)))
              )
                ? "denied"
                : "allowed",
          }
        )
);

// Checked in order, against lowercased gh output: a rate limit also answers 403.
const GITHUB_FAILURE_MARKERS: ReadonlyArray<readonly [DependencyReviewUnknownReason, ReadonlyArray<string>]> = [
  ["rate-limited", ["(http 429)", "rate limit"]],
  ["permission-denied", ["(http 401)", "(http 403)"]],
  ["not-found", ["(http 404)", "no commit found"]],
];

/**
 * Map a failed `gh api` reply to the reason the review is unknown.
 *
 * **Example** (Classify a permission failure)
 *
 * ```ts
 * import { classifyGithubFailure } from "@beep/repo-cli/commands/Ci"
 *
 * console.log(classifyGithubFailure("gh: Resource not accessible by integration (HTTP 403)")) // "permission-denied"
 * console.log(classifyGithubFailure("gh: API rate limit exceeded for installation. (HTTP 403)")) // "rate-limited"
 * ```
 *
 * @param output - The merged output of the failed `gh api` call.
 * @returns The unknown-verdict reason.
 * @category utilities
 * @since 0.0.0
 */
export const classifyGithubFailure = (output: string): DependencyReviewUnknownReason =>
  pipe(
    GITHUB_FAILURE_MARKERS,
    A.findFirst(([, markers]) => A.some(markers, (marker) => Str.includes(marker)(Str.toLowerCase(output)))),
    O.match({ onNone: () => "request-failed", onSome: ([reason]) => reason })
  );

const unavailable = (reason: DependencyReviewUnknownReason, detail: string) =>
  DependencyReviewUnavailableError.make({ reason, detail: Str.slice(0, DETAIL_LIMIT)(Str.trim(detail)) });

const replyOutput = Effect.fn("DependencyReview.replyOutput")(function* (endpoint: string, reply: GithubApiReply) {
  if (reply.truncated) return yield* unavailable("request-failed", `${endpoint}: reply exceeded the capture bound`);
  if (reply.exitCode !== 0)
    return yield* unavailable(classifyGithubFailure(reply.output), `${endpoint}: ${reply.output}`);
  return reply.output;
});

const decodeComparePages = S.decodeUnknownEffect(S.fromJsonString(DependencyGraphComparePages));
const RepositoryLicense = S.Struct({
  license: S.NullOr(S.Struct({ spdx_id: S.NullOr(S.String) })),
});
const decodeRepositoryLicense = S.decodeUnknownEffect(S.fromJsonString(RepositoryLicense));
const GITHUB_REPOSITORY_URL = /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/u;

const githubRepository = (url: string | null): O.Option<string> =>
  pipe(
    O.fromNullishOr(url),
    O.flatMap(Str.match(GITHUB_REPOSITORY_URL)),
    O.map((match) => `${match[1]}/${match[2]}`)
  );

const needsRepositoryLicense = (change: DependencyChange): boolean =>
  change.license === null ||
  (Str.length(change.license) === TRUNCATED_LICENSE_LENGTH &&
    !Result.isSuccess(SpdxExpression.parseResult(change.license)));

const severityRank = (severity: AdvisorySeverity): number =>
  Match.value(severity).pipe(
    Match.when("critical", () => 0),
    Match.when("high", () => 1),
    Match.when("moderate", () => 2),
    Match.when("low", () => 3),
    Match.exhaustive
  );

const inScope = (thresholds: DependencyReviewThresholds) => (change: DependencyChange) =>
  A.contains(thresholds.failOnScopes, change.scope ?? "runtime");

const vulnerabilityFinding = (thresholds: DependencyReviewThresholds) => (change: DependencyChange) => {
  const advisories = A.filter(
    change.vulnerabilities,
    (advisory) => severityRank(advisory.severity) <= severityRank(thresholds.failOnSeverity)
  );
  return A.isReadonlyArrayNonEmpty(advisories)
    ? O.some(
        DependencyReviewFinding.cases.vulnerability.make({
          manifest: change.manifest,
          ecosystem: change.ecosystem,
          name: change.name,
          version: change.version,
          advisories,
        })
      )
    : O.none<DependencyReviewFinding>();
};

const licenseFinding = (change: DependencyChange, license: string | null, decision: LicenseDecision) => {
  const target = {
    manifest: change.manifest,
    ecosystem: change.ecosystem,
    name: change.name,
    version: change.version,
    license: license ?? "",
  };
  return Match.value(decision).pipe(
    Match.when("denied", () => O.some(DependencyReviewFinding.cases["denied-license"].make(target))),
    Match.when("unresolved", () => O.some(DependencyReviewFinding.cases["unresolved-license"].make(target))),
    Match.orElse(O.none<DependencyReviewFinding>)
  );
};

/**
 * Reviews one pull request's dependency changes against the fixture policy
 * and thresholds.
 *
 * **Details**
 *
 * `review` never fails: GitHub and decode failures become the `unknown`
 * verdict. The live layer reads GitHub through {@link GithubPolicyClient};
 * tests provide a recorded client instead.
 *
 * **Example** (Reference the contract)
 *
 * ```ts
 * import { DependencyReview } from "@beep/repo-cli/commands/Ci"
 *
 * console.log(DependencyReview.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class DependencyReview extends Context.Service<
  DependencyReview,
  {
    readonly settings: DependencyReviewSettings;
    readonly review: (request: DependencyReviewRequest) => Effect.Effect<DependencyReviewVerdict>;
  }
>()($I`DependencyReview`) {}

/**
 * Build a {@link DependencyReview} over explicit settings.
 *
 * **Example** (Build the repository review layer)
 *
 * ```ts
 * import { dependencyReviewSettings, makeDependencyReviewLayer } from "@beep/repo-cli/commands/Ci"
 * import * as Layer from "effect/Layer"
 *
 * const layer = makeDependencyReviewLayer(dependencyReviewSettings)
 * console.log(Layer.isLayer(layer)) // true
 * ```
 *
 * @param settings - Fixture roots whose rows are excluded, and the severity, scope and license thresholds.
 * @returns A layer requiring {@link GithubPolicyClient}.
 * @category layers
 * @since 0.0.0
 */
export const makeDependencyReviewLayer = (settings: DependencyReviewSettings) =>
  Layer.effect(
    DependencyReview,
    Effect.gen(function* () {
      const client = yield* GithubPolicyClient;
      const { policy, thresholds } = settings;
      const isFixture = isFixtureManifest(policy);

      const read = Effect.fn("DependencyReview.read")(function* (endpoint: string, flags: ReadonlyArray<string>) {
        const reply = yield* client
          .request([...flags, endpoint])
          .pipe(Effect.mapError((error) => unavailable("request-failed", `${endpoint}: ${error.message}`)));
        return yield* replyOutput(endpoint, reply);
      });

      // The compare API answers 200 with an empty list for commits it does
      // not know, which would pass review. Both commits must resolve first.
      const verifyCommit = Effect.fn("DependencyReview.verifyCommit")(function* (sha: string) {
        const endpoint = `repos/{owner}/{repo}/commits/${sha}`;
        const resolved = Str.trim(yield* read(endpoint, ["--jq", ".sha"]));
        if (resolved !== sha)
          return yield* unavailable(
            "not-found",
            `${endpoint}: GitHub resolved "${resolved}", not the requested commit`
          );
      });

      const compare = Effect.fn("DependencyReview.compare")(function* (request: DependencyReviewRequest) {
        yield* verifyCommit(request.base);
        yield* verifyCommit(request.head);
        const endpoint = `repos/{owner}/{repo}/dependency-graph/compare/${request.base}...${request.head}?per_page=100`;
        const output = yield* read(endpoint, ["--paginate", "--slurp"]);
        const pages = yield* decodeComparePages(output).pipe(
          Effect.mapError((error) => unavailable("malformed-response", `${endpoint}: ${error.message}`))
        );
        return A.flatten(pages);
      });

      // GitHub answers 404 for a repository without a detectable license; the
      // action records that as no license. Every other failure is unknown.
      const repositoryLicense = Effect.fn("DependencyReview.repositoryLicense")(function* (repository: string) {
        const endpoint = `repos/${repository}/license`;
        const reply = yield* client
          .request([endpoint])
          .pipe(Effect.mapError((error) => unavailable("request-failed", `${endpoint}: ${error.message}`)));
        if (!reply.truncated && reply.exitCode !== 0 && classifyGithubFailure(reply.output) === "not-found")
          return O.none<string>();
        const output = yield* replyOutput(endpoint, reply);
        const body = yield* decodeRepositoryLicense(output).pipe(
          Effect.mapError((error) => unavailable("malformed-response", `${endpoint}: ${error.message}`))
        );
        return O.fromNullishOr(body.license?.spdx_id);
      });

      const evaluate = Effect.fn("DependencyReview.evaluate")(function* (changes: ReadonlyArray<DependencyChange>) {
        const excluded = A.filter(changes, (change) => isFixture(change.manifest));
        const reviewed = A.filter(changes, (change) => !isFixture(change.manifest));
        const scoped = A.filter(reviewed, inScope(thresholds));
        const added = A.filter(scoped, (change) => change.change_type === "added");
        const repositories = pipe(
          added,
          A.filter(needsRepositoryLicense),
          A.flatMap((change) => O.toArray(githubRepository(change.source_repository_url))),
          A.dedupe
        );
        const looked = yield* Effect.forEach(
          repositories,
          (repository) => repositoryLicense(repository).pipe(Effect.map((license) => [repository, license] as const)),
          { concurrency: LOOKUP_CONCURRENCY }
        );
        const lookups = HashMap.fromIterable(looked);
        const licenseOf = (change: DependencyChange): string | null =>
          needsRepositoryLicense(change)
            ? pipe(
                githubRepository(change.source_repository_url),
                O.flatMap((repository) => HashMap.get(lookups, repository)),
                O.flatten,
                O.getOrElse(() => change.license)
              )
            : change.license;
        const decisions = A.map(added, (change) => {
          const license = licenseOf(change);
          return [change, license, decideLicense(license, thresholds.denyLicenses)] as const;
        });
        const findings = [
          ...A.flatMap(added, (change) => O.toArray(vulnerabilityFinding(thresholds)(change))),
          ...A.flatMap(decisions, ([change, license, decision]) =>
            O.toArray(licenseFinding(change, license, decision))
          ),
        ];
        const counts = DependencyReviewCounts.make({
          rows: A.length(changes),
          excludedRows: A.length(excluded),
          excludedManifests: pipe(
            excluded,
            A.map((change) => change.manifest),
            A.dedupe
          ),
          reviewedRows: A.length(reviewed),
          unlicensedRows: A.length(A.filter(decisions, ([, , decision]) => decision === "unlicensed")),
        });
        return A.isReadonlyArrayNonEmpty(findings)
          ? DependencyReviewVerdict.cases.fail.make({ counts, findings })
          : DependencyReviewVerdict.cases.pass.make({ counts });
      });

      const review = Effect.fn("DependencyReview.review")((request: DependencyReviewRequest) =>
        compare(request).pipe(
          Effect.flatMap(evaluate),
          Effect.catchTag("DependencyReviewUnavailableError", (error) =>
            Effect.succeed(DependencyReviewVerdict.cases.unknown.make({ reason: error.reason, detail: error.detail }))
          )
        )
      );

      return DependencyReview.of({ settings, review });
    })
  );

/**
 * The repository's dependency review: {@link dependencyReviewSettings} over
 * {@link GithubPolicyClient}.
 *
 * **Example** (Reference the layer)
 *
 * ```ts
 * import { DependencyReviewLive } from "@beep/repo-cli/commands/Ci"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(DependencyReviewLive)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const DependencyReviewLive = makeDependencyReviewLayer(dependencyReviewSettings);

const findingLine: (finding: DependencyReviewFinding) => ReadonlyArray<string> =
  Match.type<DependencyReviewFinding>().pipe(
    Match.tagsExhaustive({
      vulnerability: (finding) =>
        A.map(
          finding.advisories,
          (advisory) =>
            `- vulnerability: ${finding.manifest} » ${finding.name}@${finding.version} – ${advisory.advisory_ghsa_id} (${advisory.severity}) ${advisory.advisory_url}`
        ),
      "denied-license": (finding) => [
        `- denied license: ${finding.manifest} » ${finding.name}@${finding.version} – ${finding.license}`,
      ],
      "unresolved-license": (finding) => [
        `- unresolved license: ${finding.manifest} » ${finding.name}@${finding.version} – ${finding.license}`,
      ],
    })
  );

const countLines = (counts: DependencyReviewCounts): ReadonlyArray<string> => [
  `rows: ${counts.rows}; reviewed: ${counts.reviewedRows}; excluded as fixtures: ${counts.excludedRows}; added without a license: ${counts.unlicensedRows}`,
  ...A.map(counts.excludedManifests, (manifest) => `- excluded fixture manifest: ${manifest}`),
];

/**
 * Render a verdict as the plain-text summary the command prints.
 *
 * **Example** (Render a pass)
 *
 * ```ts
 * import {
 *   DependencyReviewCounts,
 *   DependencyReviewRequest,
 *   DependencyReviewVerdict,
 *   dependencyReviewFixturePolicy,
 *   renderDependencyReview,
 * } from "@beep/repo-cli/commands/Ci"
 *
 * const request = DependencyReviewRequest.make({ base: "a".repeat(40), head: "b".repeat(40) })
 * const counts = DependencyReviewCounts.make({ rows: 0, excludedRows: 0, excludedManifests: [], reviewedRows: 0, unlicensedRows: 0 })
 * const verdict = DependencyReviewVerdict.cases.pass.make({ counts })
 * const lines = renderDependencyReview(verdict, request, dependencyReviewFixturePolicy)
 * console.log(lines.at(-1)) // "verdict: pass"
 * ```
 *
 * @param verdict - The review outcome.
 * @param request - The reviewed base and head.
 * @param policy - The fixture policy in force, printed so a policy change is visible in the log.
 * @returns Summary lines.
 * @category utilities
 * @since 0.0.0
 */
export const renderDependencyReview: {
  (
    request: DependencyReviewRequest,
    policy: FixturePathPolicy
  ): (verdict: DependencyReviewVerdict) => ReadonlyArray<string>;
  (
    verdict: DependencyReviewVerdict,
    request: DependencyReviewRequest,
    policy: FixturePathPolicy
  ): ReadonlyArray<string>;
} = dual(
  3,
  (
    verdict: DependencyReviewVerdict,
    request: DependencyReviewRequest,
    policy: FixturePathPolicy
  ): ReadonlyArray<string> => [
    `dependency-review: ${request.base}...${request.head}`,
    ...A.map(policy.rules, (rule) => `fixture policy: ${rule.pattern} (${rule.reason})`),
    ...Match.value(verdict).pipe(
      Match.tagsExhaustive({
        pass: (pass) => [...countLines(pass.counts), "verdict: pass"],
        fail: (fail) => [
          ...countLines(fail.counts),
          ...A.flatMap(fail.findings, findingLine),
          `verdict: fail (${A.length(fail.findings)} finding(s))`,
        ],
        unknown: (unknown) => [`verdict: unknown (${unknown.reason}): ${unknown.detail}`],
      })
    ),
  ]
);

/**
 * The job failure message for a verdict, or none when it passes.
 *
 * **Example** (Unknown fails the job)
 *
 * ```ts
 * import { DependencyReviewVerdict, dependencyReviewFailure } from "@beep/repo-cli/commands/Ci"
 * import * as O from "effect/Option"
 *
 * const verdict = DependencyReviewVerdict.cases.unknown.make({ reason: "not-found", detail: "HTTP 404" })
 * console.log(O.isSome(dependencyReviewFailure(verdict))) // true
 * ```
 *
 * @param verdict - The review outcome.
 * @returns The failure message for `fail` and `unknown`, none for `pass`.
 * @category utilities
 * @since 0.0.0
 */
export const dependencyReviewFailure: (verdict: DependencyReviewVerdict) => O.Option<string> =
  Match.type<DependencyReviewVerdict>().pipe(
    Match.tagsExhaustive({
      pass: () => O.none(),
      fail: (fail) =>
        O.some(`Dependency review failed: ${A.length(fail.findings)} finding(s) in production manifests.`),
      unknown: (unknown) => O.some(`Dependency review state is unknown (${unknown.reason}); failing closed.`),
    })
  );
