import {
  buildCacheConformanceCorpus,
  CacheConformanceBearers,
  CacheConformancePaths,
  CacheConformanceRun,
  CacheConformanceTarget,
  renderCacheConformanceCorpus,
  runCacheConformance,
  syncCacheConformanceCorpus,
} from "@beep/repo-cli/commands/Cache";
import { BunHttpServer } from "@effect/platform-bun";
import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as HashMap from "effect/HashMap";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as Headers from "effect/http/Headers";
import * as HttpServer from "effect/http/HttpServer";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as Redacted from "effect/Redacted";
import * as Ref from "effect/Ref";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const RunJson = S.fromJsonString(CacheConformanceRun, { space: 2 });
const secrets = {
  reader: "conformance-reader-secret-71f3",
  writer: "conformance-writer-secret-9a0c",
  foreign: "conformance-foreign-secret-44be",
  unknown: "conformance-unknown-secret-d215",
};
const teamId = "team_conformance";
const foreignTeamId = "team_foreign";
const bearers = CacheConformanceBearers.make({
  reader: Redacted.make(secrets.reader),
  writer: Redacted.make(secrets.writer),
  foreign: Redacted.make(secrets.foreign),
  unknown: Redacted.make(secrets.unknown),
});

type ServerMode = {
  readonly putStatus: number;
  readonly readFault: O.Option<number>;
  readonly readersWrite: boolean;
};
const goodMode: ServerMode = { putStatus: 200, readFault: O.none(), readersWrite: false };

type Stored = { readonly body: Uint8Array; readonly headers: Readonly<Record<string, string>> };
const metadataHeaders = ["x-artifact-duration", "x-artifact-tag", "x-artifact-sha", "x-artifact-dirty-hash"];

// Small policy-complete Remote Cache server used only by these tests.
const makeServer = Effect.fn("test.makeConformanceServer")(function* (mode: ServerMode) {
  const store = yield* Ref.make(HashMap.empty<string, Stored>());
  const tags = yield* Ref.make(A.empty<string>());
  const principals = HashMap.make(
    [`Bearer ${secrets.reader}`, { role: "reader", namespace: teamId }],
    [`Bearer ${secrets.writer}`, { role: "writer", namespace: teamId }],
    [`Bearer ${secrets.foreign}`, { role: "writer", namespace: foreignTeamId }]
  );
  const app = Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const [pathname = "", query = ""] = Str.split(request.url, "?");
    const principal = HashMap.get(
      principals,
      O.getOrElse(Headers.get(request.headers, "authorization"), () => "")
    );
    if (O.isNone(principal)) return HttpServerResponse.empty({ status: 401 });
    const selectors = A.fromIterable(new URLSearchParams(query).entries());
    const selectorOk =
      selectors.length === 1 &&
      A.every(selectors, ([name, value]) => name === "teamId" && value === principal.value.namespace);
    if (!selectorOk) return HttpServerResponse.empty({ status: 403 });
    if (pathname === "/v8/artifacts/status" && request.method === "GET")
      return HttpServerResponse.uint8Array(new TextEncoder().encode('{"status":"enabled"}'), {
        contentType: "application/json",
      });
    if (!Str.startsWith("/v8/artifacts/")(pathname)) return HttpServerResponse.empty({ status: 404 });
    const hash = Str.slice("/v8/artifacts/".length)(pathname);
    if (hash === "events") return HttpServerResponse.empty({ status: 404 });
    if (!/^[a-f0-9]{16,128}$/.test(hash)) return HttpServerResponse.empty({ status: 400 });
    const key = `${principal.value.namespace}/${hash}`;
    if (request.method === "PUT") {
      if (principal.value.role !== "writer" && !mode.readersWrite) return HttpServerResponse.empty({ status: 403 });
      if (!O.contains(Headers.get(request.headers, "content-type"), "application/octet-stream"))
        return HttpServerResponse.empty({ status: 415 });
      const duration = Headers.get(request.headers, "x-artifact-duration");
      if (O.exists(duration, (value) => !/^\d+$/.test(value))) return HttpServerResponse.empty({ status: 400 });
      const body = yield* request.arrayBuffer.pipe(
        Effect.map((buffer) => O.some(new Uint8Array(buffer))),
        Effect.orElseSucceed(() => O.none<Uint8Array>())
      );
      if (O.isNone(body)) return HttpServerResponse.empty({ status: 400 });
      const headers = R.fromEntries(
        A.getSomes(
          A.map(metadataHeaders, (name) => O.map(Headers.get(request.headers, name), (value) => [name, value] as const))
        )
      );
      yield* O.match(Headers.get(request.headers, "x-artifact-tag"), {
        onNone: () => Effect.void,
        onSome: (tag) => Ref.update(tags, A.append(tag)),
      });
      yield* Ref.update(store, HashMap.set(key, { body: body.value, headers }));
      return HttpServerResponse.uint8Array(new TextEncoder().encode('{"urls":[]}'), {
        status: mode.putStatus,
        contentType: "application/json",
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") return HttpServerResponse.empty({ status: 405 });
    if (request.method === "GET" && O.isSome(mode.readFault))
      return HttpServerResponse.empty({ status: mode.readFault.value });
    const stored = HashMap.get(yield* Ref.get(store), key);
    if (O.isNone(stored)) return HttpServerResponse.empty({ status: 404 });
    return HttpServerResponse.uint8Array(stored.value.body, {
      contentType: "application/octet-stream",
      headers: { "x-artifact-duration": "0", ...stored.value.headers },
    });
  });
  const server = yield* BunHttpServer.make({ hostname: "127.0.0.1", port: 0 });
  yield* server.serve(app);
  return { url: HttpServer.formatAddress(server.address), tags: Ref.get(tags) };
});

const targetFor = (url: string, overrides: Partial<{ profile: "local-container"; readerWriterSplit: boolean }> = {}) =>
  CacheConformanceTarget.make({
    schemaVersion: "cache-conformance-target/v1",
    profile: overrides.profile ?? "local-container",
    topology: "owned-fixture",
    baseUrl: new URL(url),
    backend: { id: "in-test", release: "in-test@0", digest: "none" },
    namespace: { teamId, foreignTeamId },
    credentials: { reader: "READER", writer: "WRITER", foreign: "FOREIGN", unknown: "UNKNOWN" },
    policy: { readerWriterSplit: overrides.readerWriterSplit ?? true, tenantBinding: true },
    requestTimeoutMs: 5000,
  });

const repoRoot = Effect.gen(function* () {
  const path = yield* Path.Path;
  return yield* path.fromFileUrl(new URL("../../../../../", import.meta.url));
});

const runAgainst = Effect.fn("test.runAgainst")(function* (mode: ServerMode, split = true) {
  const server = yield* makeServer(mode);
  const corpus = yield* buildCacheConformanceCorpus(yield* repoRoot);
  const report = yield* runCacheConformance(corpus, targetFor(server.url, { readerWriterSplit: split }), bearers);
  return { report, tags: yield* server.tags };
});

const caseOf = (report: CacheConformanceRun, id: string) =>
  A.findFirst(report.cases, (entry) => entry.id === id).pipe(O.getOrThrow);

const Services = Layer.mergeAll(NodeServices.layer, FetchHttpClient.layer);

it.layer(Services, { timeout: "60 seconds", excludeTestServices: true })("cache conformance corpus", (it) => {
  it.effect("regenerates byte-identically and matches the committed corpus", () =>
    Effect.gen(function* () {
      const root = yield* repoRoot;
      const first = yield* renderCacheConformanceCorpus(yield* buildCacheConformanceCorpus(root));
      const second = yield* renderCacheConformanceCorpus(yield* buildCacheConformanceCorpus(root));
      expect(first).toBe(second);
      assertTrue(Str.endsWith("}\n")(first));
      yield* syncCacheConformanceCorpus(root, true);
      const corpus = yield* buildCacheConformanceCorpus(root);
      expect(A.map(corpus.cases, (entry) => entry.id)).toEqual(
        A.makeBy(32, (index) => `RC-${Str.padStart(3, "0")(`${index + 1}`)}`)
      );
      expect(A.filter(corpus.cases, (entry) => entry.executor === "native").length).toBe(6);
    })
  );

  it.effect("detects drift with --check and rejects a tampered OpenAPI blob", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* repoRoot;
      const scratch = yield* fs.makeTempDirectoryScoped({ prefix: "cache-conformance-" });
      for (const relative of [CacheConformancePaths.openapi, CacheConformancePaths.plan]) {
        yield* fs.makeDirectory(path.dirname(path.join(scratch, relative)), { recursive: true });
        yield* fs.copyFile(path.join(root, relative), path.join(scratch, relative));
      }
      yield* fs.makeDirectory(path.dirname(path.join(scratch, CacheConformancePaths.corpus)), { recursive: true });
      yield* syncCacheConformanceCorpus(scratch, false);
      yield* syncCacheConformanceCorpus(scratch, true);
      const corpusPath = path.join(scratch, CacheConformancePaths.corpus);
      const committed = yield* fs.readFileString(corpusPath);
      yield* fs.writeFileString(corpusPath, Str.replace("RC-032", "RC-099")(committed));
      const drift = yield* syncCacheConformanceCorpus(scratch, true).pipe(Effect.result);
      drift.pipe(Result.isFailure, assertTrue);
      if (Result.isFailure(drift)) expect(drift.failure.message).toContain("is stale");
      const openapiPath = path.join(scratch, CacheConformancePaths.openapi);
      yield* fs.writeFileString(openapiPath, `${yield* fs.readFileString(openapiPath)} `);
      const tampered = yield* buildCacheConformanceCorpus(scratch).pipe(Effect.result);
      tampered.pipe(Result.isFailure, assertTrue);
      if (Result.isFailure(tampered)) expect(tampered.failure.message).toContain("does not match the pinned");
    })
  );
});

it.layer(Services, { timeout: "120 seconds", excludeTestServices: true })("cache conformance wire runner", (it) => {
  it.effect("passes a policy-complete server and labels absent optional routes", () =>
    Effect.gen(function* () {
      const { report } = yield* runAgainst(goodMode);
      const failures = A.filter(
        report.cases,
        (entry) =>
          entry.verdicts["strict-openapi"].verdict === "fail" ||
          entry.verdicts["beep-security-policy"].verdict === "fail"
      );
      expect(A.map(failures, (entry) => [entry.id, entry.verdicts])).toEqual([]);
      for (const id of ["RC-007", "RC-008"])
        expect(caseOf(report, id).verdicts["strict-openapi"].verdict).toBe("unsupported-optional");
      expect(caseOf(report, "RC-002").verdicts["strict-openapi"].verdict).toBe("pass");
      const native = caseOf(report, "RC-017");
      expect(native.exchanges).toEqual([]);
      expect(native.verdicts["published-stable-client"].verdict).toBe("not-executed");
      expect(native.verdicts["strict-openapi"].verdict).toBe("not-applicable");
      expect(caseOf(report, "RC-010").verdicts["published-stable-client"].verdict).toBe("not-executed");
      const strict = A.findFirst(report.summary, (row) => row.dimension === "strict-openapi").pipe(O.getOrThrow);
      expect(strict.pass + strict.unsupportedOptional).toBe(19);
    })
  );

  it.effect("scores a 201 upload as a strict deviation without failing the policy", () =>
    Effect.gen(function* () {
      const { report } = yield* runAgainst({ ...goodMode, putStatus: 201 });
      const upload = caseOf(report, "RC-002").verdicts["strict-openapi"];
      expect(upload.verdict).toBe("fail");
      if (upload.verdict === "fail") expect(upload.expectation).toBe("documented-status:uploadArtifact");
      expect(caseOf(report, "RC-012").verdicts["beep-security-policy"].verdict).toBe("pass");
      expect(caseOf(report, "RC-012").verdicts["strict-openapi"].verdict).toBe("fail");
    })
  );

  it.effect("classifies a 500 read as a server fault, never a miss", () =>
    Effect.gen(function* () {
      const { report } = yield* runAgainst({ ...goodMode, readFault: O.some(500) });
      const miss = caseOf(report, "RC-010");
      const get = A.findFirst(miss.exchanges, (exchange) => exchange.method === "GET").pipe(O.getOrThrow);
      expect(get.outcome).toBe("server-error");
      expect(get.status).toEqual(O.some(500));
      expect(miss.verdicts["strict-openapi"].verdict).toBe("fail");
      const head = A.findFirst(miss.exchanges, (exchange) => exchange.method === "HEAD").pipe(O.getOrThrow);
      expect(head.outcome).toBe("miss");
    })
  );

  it.effect("fails reader writes on a server without a reader/writer split", () =>
    Effect.gen(function* () {
      const { report } = yield* runAgainst({ ...goodMode, readersWrite: true }, false);
      const boundary = caseOf(report, "RC-012").verdicts["beep-security-policy"];
      expect(boundary.verdict).toBe("fail");
      if (boundary.verdict === "fail") {
        expect(boundary.expectation).toBe("reader-put-denied");
        expect(boundary.detail).toContain("does not claim a reader/writer split");
      }
    })
  );

  it.effect("never serializes bearers or tag values and round-trips through JSON", () =>
    Effect.gen(function* () {
      const { report, tags } = yield* runAgainst(goodMode);
      expect(tags.length).toBeGreaterThan(0);
      const encoded = yield* S.encodeEffect(RunJson)(report);
      for (const secret of [...R.values(secrets), ...tags]) expect(encoded).not.toContain(secret);
      expect(encoded).not.toContain("127.0.0.1");
      const decoded = yield* S.decodeEffect(RunJson)(encoded);
      expect(yield* S.encodeEffect(RunJson)(decoded)).toBe(encoded);
    })
  );

  it.effect("refuses a non-loopback base URL for the local-container profile", () =>
    Effect.gen(function* () {
      const corpus = yield* buildCacheConformanceCorpus(yield* repoRoot);
      const refused = yield* runCacheConformance(corpus, targetFor("http://cache.example.com"), bearers).pipe(
        Effect.result
      );
      refused.pipe(Result.isFailure, assertTrue);
      if (Result.isFailure(refused)) expect(refused.failure.message).toContain("non-loopback");
    })
  );
});
