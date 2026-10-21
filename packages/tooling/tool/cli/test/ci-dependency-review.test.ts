/**
 * #1882: manifest-aware dependency review over recorded GitHub compare
 * responses. No test touches the network: a recorded `GithubPolicyClient`
 * answers each exact `gh api` argument list, and any other request fails.
 *
 * The recorded files under `fixtures/dependency-review/` are trimmed real
 * replies of `gh api --paginate --slurp .../dependency-graph/compare/...`
 * captured on 2026-10-21 (see that directory's README).
 */

import {
  CiCommandError,
  classifyGithubFailure,
  DependencyChange,
  DependencyGraphComparePages,
  DependencyReview,
  DependencyReviewLive,
  DependencyReviewRequest,
  decideLicense,
  dependencyReviewFailure,
  dependencyReviewFixturePolicy,
  GithubApiReply,
  GithubPolicyClient,
  isFixtureManifest,
  renderDependencyReview,
  runDependencyReview,
} from "@beep/repo-cli/commands/Ci";
import { describe, expect, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import inventory from "./fixtures/dependency-review/manifest-inventory.json" with { type: "json" };
import pr911Recorded from "./fixtures/dependency-review/pr-911-photo-face-uv-lock.json" with { type: "json" };
import pr1592Recorded from "./fixtures/dependency-review/pr-1592-lockfile-fixtures.json" with { type: "json" };
import type { DependencyReviewVerdict } from "@beep/repo-cli/commands/Ci";

const sha = (digit: string): string => A.join(A.replicate(digit, 40), "");
const request = (base: string, head: string) => DependencyReviewRequest.make({ base: sha(base), head: sha(head) });
const compareArgs = (review: DependencyReviewRequest): string =>
  `--paginate --slurp repos/{owner}/{repo}/dependency-graph/compare/${review.base}...${review.head}?per_page=100`;
const ok = (output: string) => GithubApiReply.make({ exitCode: 0, output, truncated: false });
const failed = (output: string) => GithubApiReply.make({ exitCode: 1, output, truncated: false });
const encodePages = S.encodeEffect(S.fromJsonString(DependencyGraphComparePages));
const decodePages = S.decodeUnknownEffect(DependencyGraphComparePages);

// Real recorded pull-request ranges.
const PR_911 = DependencyReviewRequest.make({
  base: "19d8b3df005dd9768e003a9efc716d84bf0ad12a",
  head: "9fc17c2ed94893ac831ed12b4370c70dfc48a0af",
});
const PR_1592 = DependencyReviewRequest.make({
  base: "cb64e0484f218a0b04bd8356aef2ceb463644a7c",
  head: "b56c98a04992a430463a10204a62cd8b3ac6f8a3",
});

// Synthetic ranges, each answered by rows derived from the recorded replies.
const LOOK_ALIKE = request("1", "2");
const LICENSES = request("3", "4");
const SCOPE_AND_REMOVAL = request("5", "6");
const REPOSITORY_LICENSE = request("7", "8");
const LICENSE_LOOKUP_DENIED = request("9", "a");
const HTTP_403 = request("b", "c");
const HTTP_404 = request("d", "e");
const RATE_LIMIT = request("f", "0");
const HTTP_429 = request("0", "1");
const MALFORMED_SHAPE = request("1", "3");
const MALFORMED_JSON = request("1", "4");
const TRUNCATED = request("1", "5");
const SPAWN_FAILURE = request("1", "6");
const EMPTY = request("1", "7");
const MISSING_HEAD = DependencyReviewRequest.make({
  base: sha("1"),
  head: A.join(A.replicate("deadbeef", 5), ""),
});
const COMMIT_LOOKUP = /^--jq \.sha repos\/\{owner\}\/\{repo\}\/commits\/([0-9a-f]{40})$/u;

const recordedLodashFixture = (pages: DependencyGraphComparePages): DependencyChange =>
  O.getOrThrow(
    A.findFirst(
      A.flatten(pages),
      (row) => row.manifest === "scratchpad/test/lockfiles/fixtures/npm/v1/package-lock.json"
    )
  );
const recordedUrllib3 = (pages: DependencyGraphComparePages): DependencyChange =>
  O.getOrThrow(A.findFirst(A.flatten(pages), (row) => row.name === "urllib3"));
const recordedVitestDevelopment = (pages: DependencyGraphComparePages): DependencyChange =>
  O.getOrThrow(A.findFirst(A.flatten(pages), (row) => row.name === "vitest"));

const RecordedGithub = Layer.effect(
  GithubPolicyClient,
  Effect.gen(function* () {
    const pr911Pages = yield* decodePages(pr911Recorded);
    const pr1592Pages = yield* decodePages(pr1592Recorded);
    const pr911 = yield* encodePages(pr911Pages);
    const pr1592 = yield* encodePages(pr1592Pages);
    const lodash = recordedLodashFixture(pr1592Pages);
    const urllib3 = recordedUrllib3(pr911Pages);
    const vitest = recordedVitestDevelopment(pr1592Pages);
    const moved = (manifest: string) => DependencyChange.make({ ...lodash, manifest });
    const licensed = (license: string | null, name: string) =>
      DependencyChange.make({ ...urllib3, name, license, vulnerabilities: [] });
    const replies = HashMap.make(
      [compareArgs(PR_911), ok(pr911)],
      [compareArgs(PR_1592), ok(pr1592)],
      [
        compareArgs(LOOK_ALIKE),
        ok(
          yield* encodePages([
            [
              moved("scratchpad/tests/fixtures/npm/v1/package-lock.json"),
              moved("packages/tooling/test-fixtures/package-lock.json"),
              moved("fixtures/test/package-lock.json"),
              moved("packages/demo/test/fixtures-loader/package-lock.json"),
            ],
          ])
        ),
      ],
      [
        compareArgs(LICENSES),
        ok(
          yield* encodePages([
            [
              licensed("GPL-3.0-or-later", "gpl-or-later"),
              licensed("MIT OR AGPL-3.0-only", "agpl-choice"),
              licensed("MIT AND GPL-3.0", "gpl-conjunction"),
              licensed("GPL-3.0 WITH Classpath-exception-2.0", "gpl-exception"),
              licensed("LGPL-3.0-only", "lgpl"),
              licensed("NOASSERTION", "no-assertion"),
              licensed("Custom proprietary terms", "unresolved"),
            ],
          ])
        ),
      ],
      [
        compareArgs(SCOPE_AND_REMOVAL),
        ok(
          yield* encodePages([
            [
              DependencyChange.make({ ...vitest, manifest: "apps/oip-web/package.json" }),
              DependencyChange.make({ ...urllib3, change_type: "removed" }),
            ],
          ])
        ),
      ],
      [
        compareArgs(REPOSITORY_LICENSE),
        ok(
          yield* encodePages([
            [
              DependencyChange.make({
                ...urllib3,
                name: "agpl-repo",
                license: null,
                source_repository_url: "https://github.com/example/agpl-repo",
                vulnerabilities: [],
              }),
              DependencyChange.make({
                ...urllib3,
                name: "unlicensed-repo",
                license: null,
                source_repository_url: "https://github.com/example/unlicensed-repo",
                vulnerabilities: [],
              }),
            ],
          ])
        ),
      ],
      ["repos/example/agpl-repo/license", ok('{"license":{"spdx_id":"AGPL-3.0"}}')],
      ["repos/example/unlicensed-repo/license", failed("gh: Not Found (HTTP 404)")],
      [
        compareArgs(LICENSE_LOOKUP_DENIED),
        ok(
          yield* encodePages([
            [
              DependencyChange.make({
                ...urllib3,
                license: null,
                source_repository_url: "https://github.com/example/forbidden-repo",
              }),
            ],
          ])
        ),
      ],
      ["repos/example/forbidden-repo/license", failed("gh: Resource not accessible by integration (HTTP 403)")],
      [compareArgs(HTTP_403), failed("gh: Resource not accessible by integration (HTTP 403)")],
      [compareArgs(HTTP_404), failed("gh: Not Found (HTTP 404)")],
      [compareArgs(RATE_LIMIT), failed("gh: API rate limit exceeded for installation ID 4242. (HTTP 403)")],
      [compareArgs(HTTP_429), failed("gh: You have exceeded a secondary rate limit. (HTTP 429)")],
      [compareArgs(MALFORMED_SHAPE), ok('[[{"change_type":"modified","manifest":"package.json"}]]')],
      [compareArgs(MALFORMED_JSON), ok("<html>bad gateway</html>")],
      [compareArgs(TRUNCATED), GithubApiReply.make({ exitCode: 0, output: "[[", truncated: true })],
      [compareArgs(EMPTY), ok("[[]]")],
      // GitHub's real reply for an unknown commit range: 200 and no rows.
      [compareArgs(MISSING_HEAD), ok("[]")]
    );
    // Every commit resolves to itself except MISSING_HEAD's head, which gets
    // GitHub's recorded reply for an unknown SHA.
    const commitReply = (commit: string) =>
      commit === MISSING_HEAD.head ? failed(`gh: No commit found for SHA: ${commit} (HTTP 422)`) : ok(`${commit}\n`);
    const respond = (args: ReadonlyArray<string>) => {
      const key = A.join(args, " ");
      const commit = pipe(
        Str.match(COMMIT_LOOKUP)(key),
        O.flatMap((match) => O.fromUndefinedOr(match[1]))
      );
      if (O.isSome(commit)) return Effect.succeed(commitReply(commit.value));
      return key === compareArgs(SPAWN_FAILURE)
        ? Effect.fail(CiCommandError.make({ message: "GitHub policy request failed; state is unknown." }))
        : Effect.succeed(
            O.getOrElse(HashMap.get(replies, key), () => failed(`gh: unrecorded request ${key} (HTTP 418)`))
          );
    };
    return GithubPolicyClient.of({
      read: Effect.fn("RecordedGithub.read")(() =>
        Effect.fail(CiCommandError.make({ message: "read is not used by dependency review" }))
      ),
      write: Effect.fn("RecordedGithub.write")(() =>
        Effect.fail(CiCommandError.make({ message: "write is not used by dependency review" }))
      ),
      request: respond,
    });
  })
);

const review = (target: DependencyReviewRequest) => DependencyReview.use((service) => service.review(target));
const findings = (verdict: DependencyReviewVerdict) =>
  verdict._tag === "fail" ? A.map(verdict.findings, (finding) => `${finding._tag}:${finding.name}`) : [];

describe("dependency review fixture policy", () => {
  it("classifies the recorded dependency-graph manifest inventory exactly", () => {
    const isFixture = isFixtureManifest(dependencyReviewFixturePolicy);
    const misclassified = A.filter(
      inventory.manifests,
      (entry) => isFixture(entry.path) !== (entry.classification === "synthetic-fixture")
    );
    expect(misclassified).toEqual([]);
    expect(A.length(A.filter(inventory.manifests, (entry) => entry.classification === "synthetic-fixture"))).toBe(
      inventory.syntheticFixtureCount
    );
  });

  it("matches whole path segments only", () => {
    const isFixture = isFixtureManifest(dependencyReviewFixturePolicy);
    expect(isFixture("scratchpad/test/workspaces/fixtures/peers/npm/package-lock.json")).toBe(true);
    expect(isFixture("packages/tooling/library/repo-utils/test/fixtures/mock-monorepo/package.json")).toBe(true);
    expect(isFixture("test/fixtures/package.json")).toBe(true);
    expect(isFixture("scratchpad/tests/fixtures/npm/package-lock.json")).toBe(false);
    expect(isFixture("packages/tooling/test-fixtures/package-lock.json")).toBe(false);
    expect(isFixture("fixtures/test/package-lock.json")).toBe(false);
    expect(isFixture("packages/demo/test/fixtures-loader/package.json")).toBe(false);
    expect(isFixture("scratchpad/package.json")).toBe(false);
  });
});

describe("dependency review license decisions", () => {
  it("reproduces the pinned action's deny semantics", () => {
    const deny = ["AGPL-3.0", "GPL-3.0"] as const;
    const decide = decideLicense(deny);
    expect(decide("GPL-3.0")).toBe("denied");
    expect(decide("GPL-3.0-only")).toBe("denied");
    expect(decide("GPL-3.0-or-later")).toBe("denied");
    expect(decide("GPL-2.0-or-later")).toBe("denied");
    expect(decide("GPL-2.0+")).toBe("denied");
    expect(decide("AGPL-1.0-or-later")).toBe("denied");
    expect(decide("MIT OR GPL-3.0")).toBe("denied");
    expect(decide("GPL-2.0-only")).toBe("allowed");
    expect(decide("AGPL-1.0")).toBe("allowed");
    expect(decide("LGPL-3.0-only")).toBe("allowed");
    expect(decide("MIT AND GPL-3.0")).toBe("allowed");
    expect(decide("GPL-3.0 WITH Classpath-exception-2.0")).toBe("allowed");
    expect(decide("LicenseRef-github-NONE")).toBe("allowed");
    expect(decide("MIT AND OTHER")).toBe("allowed");
    expect(decide("NOASSERTION")).toBe("unlicensed");
    expect(decide(null)).toBe("unlicensed");
    expect(decide("Custom proprietary terms")).toBe("unresolved");
  });

  it("classifies gh failures", () => {
    expect(classifyGithubFailure("gh: No commit found for SHA: abc (HTTP 422)")).toBe("not-found");
    expect(classifyGithubFailure("gh: Resource not accessible by integration (HTTP 403)")).toBe("permission-denied");
    expect(classifyGithubFailure("gh: Bad credentials (HTTP 401)")).toBe("permission-denied");
    expect(classifyGithubFailure("gh: API rate limit exceeded for user ID 1. (HTTP 403)")).toBe("rate-limited");
    expect(classifyGithubFailure("gh: secondary limit (HTTP 429)")).toBe("rate-limited");
    expect(classifyGithubFailure("gh: Not Found (HTTP 404)")).toBe("not-found");
    expect(classifyGithubFailure("error connecting to api.github.com")).toBe("request-failed");
  });
});

it.layer(Layer.provideMerge(DependencyReviewLive, RecordedGithub), { timeout: "30 seconds" })(
  "dependency review over recorded compare responses",
  (it) => {
    it.effect("fails on a high transitive advisory in a production lockfile (PR #911)", () =>
      Effect.gen(function* () {
        const verdict = yield* review(PR_911);
        expect(verdict._tag).toBe("fail");
        // certifi and urllib3 are transitive in photo-face's uv.lock: neither
        // is a direct pyproject dependency at that head; pytest is moderate.
        expect(findings(verdict)).toEqual(["vulnerability:certifi", "vulnerability:urllib3"]);
        expect(
          verdict._tag === "fail" &&
            A.every(
              verdict.findings,
              (finding) => finding.manifest === "packages/tooling/tool/cli/python/photo-face/uv.lock"
            )
        ).toBe(true);
        assertSome(dependencyReviewFailure(verdict), "Dependency review failed: 2 finding(s) in production manifests.");
      })
    );

    it.effect("excludes only fixture manifests and passes the PR that tripped the action (PR #1592)", () =>
      Effect.gen(function* () {
        const verdict = yield* review(PR_1592);
        expect(verdict._tag).toBe("pass");
        if (verdict._tag !== "pass") return;
        expect(verdict.counts.rows).toBe(18);
        expect(verdict.counts.excludedRows).toBe(16);
        expect(verdict.counts.reviewedRows).toBe(2);
        expect(verdict.counts.excludedManifests).toContain(
          "scratchpad/test/lockfiles/fixtures/npm/v1/package-lock.json"
        );
        expect(verdict.counts.excludedManifests).toContain("scratchpad/test/lockfiles/fixtures/pnpm/v2/pnpm-lock.yaml");
        assertNone(dependencyReviewFailure(verdict));
        const lines = renderDependencyReview(verdict, PR_1592, dependencyReviewFixturePolicy);
        expect(lines).toContain(
          `fixture policy: **/test/**/fixtures/** (${dependencyReviewFixturePolicy.rules[0].reason})`
        );
        assertSome(A.last(lines), "verdict: pass");
      })
    );

    it.effect("still fails a production path that only resembles a fixture root", () =>
      Effect.gen(function* () {
        const verdict = yield* review(LOOK_ALIKE);
        expect(verdict._tag).toBe("fail");
        if (verdict._tag !== "fail") return;
        expect(A.map(verdict.findings, (finding) => finding.manifest)).toEqual([
          "scratchpad/tests/fixtures/npm/v1/package-lock.json",
          "packages/tooling/test-fixtures/package-lock.json",
          "fixtures/test/package-lock.json",
          "packages/demo/test/fixtures-loader/package-lock.json",
        ]);
        expect(verdict.counts.excludedRows).toBe(0);
      })
    );

    it.effect("fails denied and unresolved licenses and reports unlicensed rows", () =>
      Effect.gen(function* () {
        const verdict = yield* review(LICENSES);
        expect(findings(verdict)).toEqual([
          "denied-license:gpl-or-later",
          "denied-license:agpl-choice",
          "unresolved-license:unresolved",
        ]);
        expect(verdict._tag === "fail" && verdict.counts.unlicensedRows).toBe(1);
      })
    );

    it.effect("keeps the action's runtime scope and additions-only rules", () =>
      Effect.gen(function* () {
        expect((yield* review(SCOPE_AND_REMOVAL))._tag).toBe("pass");
        expect((yield* review(EMPTY))._tag).toBe("pass");
      })
    );

    it.effect("resolves a missing license from the source repository", () =>
      Effect.gen(function* () {
        const verdict = yield* review(REPOSITORY_LICENSE);
        expect(findings(verdict)).toEqual(["denied-license:agpl-repo"]);
        expect(verdict._tag === "fail" && verdict.counts.unlicensedRows).toBe(1);
      })
    );

    it.effect("exits 0 only on pass, 1 on fail or unknown, and 64 on malformed SHAs", () =>
      Effect.gen(function* () {
        const exitCode = (refs: { readonly base: string; readonly head: string }) =>
          runDependencyReview(refs).pipe(
            Effect.exit,
            Effect.map(
              Exit.match({
                onSuccess: () => 0,
                onFailure: (cause) =>
                  pipe(
                    Cause.findErrorOption(cause),
                    O.map((error) => error.exitCode),
                    O.getOrElse(() => -1)
                  ),
              })
            )
          );
        expect(yield* exitCode(PR_1592)).toBe(0);
        expect(yield* exitCode(PR_911)).toBe(1);
        expect(yield* exitCode(HTTP_403)).toBe(1);
        expect(yield* exitCode(MISSING_HEAD)).toBe(1);
        expect(yield* exitCode({ base: "abc", head: PR_911.head })).toBe(64);
      })
    );

    it.effect("turns every GitHub failure into unknown, which fails the job", () =>
      Effect.gen(function* () {
        const cases = [
          [HTTP_403, "permission-denied"],
          [HTTP_404, "not-found"],
          [RATE_LIMIT, "rate-limited"],
          [HTTP_429, "rate-limited"],
          [MALFORMED_SHAPE, "malformed-response"],
          [MALFORMED_JSON, "malformed-response"],
          [TRUNCATED, "request-failed"],
          [SPAWN_FAILURE, "request-failed"],
          [LICENSE_LOOKUP_DENIED, "permission-denied"],
          [MISSING_HEAD, "not-found"],
        ] as const;
        for (const [target, reason] of cases) {
          const verdict = yield* review(target);
          expect(verdict._tag === "unknown" && verdict.reason).toBe(reason);
          assertSome(
            dependencyReviewFailure(verdict),
            `Dependency review state is unknown (${reason}); failing closed.`
          );
          const lines = renderDependencyReview(verdict, target, dependencyReviewFixturePolicy);
          expect(pipe(A.last(lines), O.exists(Str.startsWith(`verdict: unknown (${reason})`)))).toBe(true);
        }
      })
    );
  }
);
