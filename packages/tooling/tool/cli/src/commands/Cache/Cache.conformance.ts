/**
 * Score a Remote Cache target against the generated conformance corpus.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  CacheConformanceBearers,
  CacheConformanceCaseResult,
  CacheConformanceCaseVerdicts,
  CacheConformanceDimension,
  CacheConformanceRun,
  CacheConformanceVerdictCounts,
} from "./Cache.conformance.schemas.ts";
import { CacheConformanceWireCheck, runCacheConformanceWireCase } from "./Cache.conformance.wire.ts";
import { CacheCommandError } from "./Cache.schemas.ts";
import type {
  CacheConformanceCase,
  CacheConformanceCorpus,
  CacheConformanceExchange,
  CacheConformanceOperation,
  CacheConformanceTarget,
  CacheConformanceVerdict,
} from "./Cache.conformance.schemas.ts";
import type { CacheConformanceWireOutcome } from "./Cache.conformance.wire.ts";

const $I = $RepoCliId.create("commands/Cache/Cache.conformance");

const LoopbackIpv4 = S.String.check(S.isPattern(/^127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/)).pipe(
  $I.annoteSchema("LoopbackIpv4", { description: "An IPv4 address inside 127.0.0.0/8." })
);
const isLoopbackIpv4 = S.is(LoopbackIpv4);
const loopbackNames = HashSet.make("localhost", "[::1]", "::1");
const isLoopbackHost = (hostname: string) =>
  HashSet.has(loopbackNames, hostname) || Str.endsWith(".localhost")(hostname) || isLoopbackIpv4(hostname);

/**
 * Refuse a target whose base URL crosses its declared profile boundary.
 *
 * **Details**
 * The `local-container` profile only accepts `http`/`https` loopback hosts, so
 * a local lab run cannot write to a reachable shared or production endpoint.
 *
 * **Example** (Check a target boundary)
 * ```ts
 * import { assertCacheConformanceTargetBoundary } from "@beep/repo-cli/commands/Cache"
 * console.assert(typeof assertCacheConformanceTargetBoundary === "function")
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const assertCacheConformanceTargetBoundary = Effect.fn("CacheConformance.assertTargetBoundary")(function* (
  target: CacheConformanceTarget
) {
  const url = target.baseUrl;
  if (url.protocol !== "http:" && url.protocol !== "https:")
    return yield* CacheCommandError.new("Conformance targets must use http or https.");
  if (target.profile === "local-container" && !isLoopbackHost(url.hostname))
    return yield* CacheCommandError.new("The local-container profile refuses a non-loopback baseUrl.");
  if (target.namespace.teamId === target.namespace.foreignTeamId)
    return yield* CacheCommandError.new("The target namespace and foreign namespace must differ.");
  return target;
});

/**
 * Read the four bearers named by a target into `Redacted` values.
 *
 * **Details**
 * Only the environment variable names live in the target file. Missing or
 * empty values fail before any request is sent, as do an unknown bearer equal
 * to a valid one and reused bearers where the target claims a role split or
 * tenant binding. The error names the variables, never their values.
 *
 * **Example** (Load run bearers)
 * ```ts
 * import { loadCacheConformanceBearers } from "@beep/repo-cli/commands/Cache"
 * console.assert(typeof loadCacheConformanceBearers === "function")
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadCacheConformanceBearers = Effect.fn("CacheConformance.loadBearers")(function* (
  target: CacheConformanceTarget
) {
  const names = target.credentials;
  const values = yield* Config.all({
    reader: Config.Redacted(names.reader),
    writer: Config.Redacted(names.writer),
    foreign: Config.Redacted(names.foreign),
    unknown: Config.Redacted(names.unknown),
  }).pipe(
    Effect.mapError(() =>
      CacheCommandError.new(
        `Set ${names.reader}, ${names.writer}, ${names.foreign} and ${names.unknown} to the target's bearers.`
      )
    )
  );
  const [reader, writer, foreign, unknown] = A.map(
    [values.reader, values.writer, values.foreign, values.unknown],
    Redacted.value
  );
  const valid = HashSet.make(reader, writer, foreign);
  // A topology without a role split or per-tenant credentials genuinely hands
  // every caller the same bearer, so reuse is allowed exactly where the target
  // does not claim the separation; the unknown bearer is always distinct.
  if (
    A.some([reader, writer, foreign, unknown], Str.isEmpty) ||
    HashSet.has(valid, unknown) ||
    (target.policy.readerWriterSplit && reader === writer) ||
    (target.policy.tenantBinding && (foreign === reader || foreign === writer))
  )
    return yield* CacheCommandError.new(
      "Bearers must be non-empty, the unknown bearer must match no valid one, and claimed role or tenant separation needs distinct bearers."
    );
  return yield* S.decodeUnknownEffect(S.toType(CacheConformanceBearers))(values).pipe(
    CacheCommandError.mapError("Cannot hold the run bearers.")
  );
});

const failureOf = (checks: ReadonlyArray<CacheConformanceWireCheck>): CacheConformanceVerdict => {
  const failed = A.filter(checks, (check) => !check.ok);
  return A.match(failed, {
    onEmpty: (): CacheConformanceVerdict =>
      A.isReadonlyArrayNonEmpty(checks)
        ? { verdict: "pass" }
        : { verdict: "not-executed", reason: "The executor recorded no expectation for this dimension." },
    onNonEmpty: ([first, ...rest]): CacheConformanceVerdict => ({
      verdict: "fail",
      expectation: first.id,
      detail: A.join(
        A.map([first, ...rest], (check) => `${check.id}: ${check.detail}`),
        " | "
      ),
    }),
  });
};

const documentedChecks = (
  exchanges: ReadonlyArray<CacheConformanceExchange>,
  operations: ReadonlyArray<CacheConformanceOperation>
) =>
  A.flatMap(exchanges, (exchange) =>
    O.flatMap(exchange.strictScored ? exchange.operationId : O.none(), (id) =>
      O.map(
        A.findFirst(operations, (operation) => operation.operationId === id),
        (operation) => {
          const documented = A.map(operation.responses, (response) => response.status);
          const shape = A.findFirst(operation.responses, (response) => O.contains(exchange.status, response.status));
          const statusOk = O.isSome(shape);
          const mediaOk = O.match(
            O.flatMap(shape, (response) => response.contentType),
            {
              onNone: () => true,
              onSome: (media) =>
                exchange.method === "HEAD" ||
                O.exists(exchange.contentType, (actual) => Str.startsWith(media)(Str.toLowerCase(actual))),
            }
          );
          const observed = O.match(exchange.status, { onNone: () => exchange.outcome, onSome: (code) => `${code}` });
          return [
            CacheConformanceWireCheck.make({
              id: `documented-status:${id}`,
              ok: statusOk,
              detail: `${exchange.step} answered ${observed}; documented ${A.join(
                A.map(documented, (code) => `${code}`),
                ", "
              )}`,
            }),
            CacheConformanceWireCheck.make({
              id: `documented-content-type:${id}`,
              ok: mediaOk,
              detail: `${exchange.step} content type ${O.getOrElse(exchange.contentType, () => "absent")}`,
            }),
          ];
        }
      )
    ).pipe(O.getOrElse(() => []))
  );

const strictVerdict = (outcome: CacheConformanceWireOutcome, operations: ReadonlyArray<CacheConformanceOperation>) =>
  O.match(outcome.unsupported, {
    onSome: (reason): CacheConformanceVerdict => ({ verdict: "unsupported-optional", reason }),
    onNone: () => failureOf(A.appendAll(documentedChecks(outcome.exchanges, operations), outcome.strict)),
  });

const unscoredByWire = Match.type<CacheConformanceDimension>().pipe(
  Match.when(
    (dimension) => dimension === "published-stable-client" || dimension === "published-canary-client",
    () => "Client acceptance is scored only by native runs (cache protocol-run)."
  ),
  Match.when("observability", () => "Needs backend log capture; the wire runner records only direct receipts."),
  Match.when("performance-envelope", () => "Needs measured load on a deployed replica."),
  Match.orElse(() => "The wire runner does not score this dimension.")
);

const skippedReason = (entry: CacheConformanceCase) =>
  entry.executor === "native"
    ? `Requires the pinned native Turbo executables; executed by cache protocol-run. ${entry.reason}`
    : `Requires a deployed boundary or measured load the local lab cannot supply. ${entry.reason}`;

const verdictsFor = (
  entry: CacheConformanceCase,
  verdict: (dimension: CacheConformanceDimension) => CacheConformanceVerdict
) => {
  const scored = HashSet.fromIterable(entry.dimensions);
  const pick = (dimension: CacheConformanceDimension): CacheConformanceVerdict =>
    HashSet.has(scored, dimension) ? verdict(dimension) : { verdict: "not-applicable" };
  return CacheConformanceCaseVerdicts.make({
    "strict-openapi": pick("strict-openapi"),
    "published-stable-client": pick("published-stable-client"),
    "published-canary-client": pick("published-canary-client"),
    "beep-security-policy": pick("beep-security-policy"),
    observability: pick("observability"),
    "performance-envelope": pick("performance-envelope"),
  });
};

const scoreCase = Effect.fn("CacheConformance.scoreCase")(function* (
  entry: CacheConformanceCase,
  corpus: CacheConformanceCorpus,
  target: CacheConformanceTarget,
  bearers: CacheConformanceBearers
) {
  if (entry.executor !== "wire")
    return CacheConformanceCaseResult.make({
      id: entry.id,
      executor: entry.executor,
      exchanges: [],
      notes: [],
      verdicts: verdictsFor(entry, () => ({ verdict: "not-executed", reason: skippedReason(entry) })),
    });
  const outcome = yield* runCacheConformanceWireCase(entry.id, target, bearers, corpus.operations);
  const strict = strictVerdict(outcome, corpus.operations);
  const policy = failureOf(outcome.policy);
  return CacheConformanceCaseResult.make({
    id: entry.id,
    executor: entry.executor,
    exchanges: outcome.exchanges,
    notes: A.map(outcome.notes, Str.slice(0, 512)),
    verdicts: verdictsFor(entry, (dimension) =>
      Match.value(dimension).pipe(
        Match.when("strict-openapi", () => strict),
        Match.when("beep-security-policy", () => policy),
        Match.orElse((other): CacheConformanceVerdict => ({ verdict: "not-executed", reason: unscoredByWire(other) }))
      )
    ),
  });
});

const countVerdicts = (results: ReadonlyArray<CacheConformanceCaseResult>, dimension: CacheConformanceDimension) => {
  const verdicts = A.map(results, (result) => result.verdicts[dimension].verdict);
  const count = (kind: CacheConformanceVerdict["verdict"]) =>
    S.Natural.make(A.filter(verdicts, (verdict) => verdict === kind).length);
  return CacheConformanceVerdictCounts.make({
    dimension,
    pass: count("pass"),
    fail: count("fail"),
    unsupportedOptional: count("unsupported-optional"),
    notApplicable: count("not-applicable"),
    notExecuted: count("not-executed"),
  });
};

/**
 * Run every corpus case against one target and score each dimension separately.
 *
 * **Details**
 * `wire` cases execute over `HttpClient` with a per-request timeout; `native`
 * and `lab` cases are reported `not-executed` with their reason. Strict OpenAPI
 * and Beep security policy are scored independently, so a documented-status
 * deviation such as a `201` upload never hides or causes a policy verdict.
 *
 * **Example** (Plan a conformance run)
 * ```ts
 * import { runCacheConformance } from "@beep/repo-cli/commands/Cache"
 * console.assert(typeof runCacheConformance === "function")
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const runCacheConformance = Effect.fn("CacheConformance.run")(function* (
  corpus: CacheConformanceCorpus,
  target: CacheConformanceTarget,
  bearers: CacheConformanceBearers
) {
  yield* assertCacheConformanceTargetBoundary(target);
  const startedAt = DateTime.formatIso(yield* DateTime.now);
  const cases = yield* Effect.forEach(corpus.cases, (entry) => scoreCase(entry, corpus, target, bearers));
  return CacheConformanceRun.make({
    profile: target.profile,
    topology: target.topology,
    backend: target.backend,
    policy: target.policy,
    corpus: { openapiSha256: corpus.openapi.sha256, sourcePlanSha256: corpus.sourcePlan.sha256 },
    startedAt,
    cases,
    summary: A.map(CacheConformanceDimension.literals, (dimension) => countVerdicts(cases, dimension)),
  });
});

/**
 * Render a run report as two-space JSON with a trailing newline.
 *
 * **Example** (Reference the report codec)
 * ```ts
 * import { encodeCacheConformanceRun } from "@beep/repo-cli/commands/Cache"
 * console.assert(typeof encodeCacheConformanceRun === "function")
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const encodeCacheConformanceRun = Effect.fn("CacheConformance.encodeRun")(function* (
  report: CacheConformanceRun
) {
  return `${yield* S.encodeEffect(S.fromJsonString(CacheConformanceRun, { space: 2 }))(report)}\n`;
}, CacheCommandError.mapError("Cannot encode the conformance run report."));
