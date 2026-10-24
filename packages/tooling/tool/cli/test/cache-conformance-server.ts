/**
 * In-test Remote Cache server and target helpers shared by the conformance tests.
 */
import { CacheConformanceBearers, CacheConformanceTarget } from "@beep/repo-cli/commands/Cache";
import { BunHttpServer } from "@effect/platform-bun";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Headers from "effect/http/Headers";
import * as HttpServer from "effect/http/HttpServer";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as Redacted from "effect/Redacted";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";
import type { CacheConformanceRun } from "@beep/repo-cli/commands/Cache";

export const secrets = {
  reader: "conformance-reader-secret-71f3",
  writer: "conformance-writer-secret-9a0c",
  foreign: "conformance-foreign-secret-44be",
  unknown: "conformance-unknown-secret-d215",
};
export const teamId = "team_conformance";
export const foreignTeamId = "team_foreign";
export const bearers = CacheConformanceBearers.make({
  reader: Redacted.make(secrets.reader),
  writer: Redacted.make(secrets.writer),
  foreign: Redacted.make(secrets.foreign),
  unknown: Redacted.make(secrets.unknown),
});

export type ServerMode = {
  readonly putStatus: number;
  readonly readFault: O.Option<number>;
  readonly readersWrite: boolean;
  /** When false, any single `teamId` selector is accepted and names the namespace. */
  readonly bindTenant: boolean;
  /** When true, uploads keep their tag but reads never return it. */
  readonly dropTags: boolean;
  /** When true, an artifact stored without a tag reads as 404 (tag-passthrough shim behaviour). */
  readonly hideUntagged: boolean;
};
export const goodMode: ServerMode = {
  putStatus: 200,
  readFault: O.none(),
  readersWrite: false,
  bindTenant: true,
  dropTags: false,
  hideUntagged: false,
};

type Stored = { readonly body: Uint8Array; readonly headers: Readonly<Record<string, string>> };
const metadataHeaders = ["x-artifact-duration", "x-artifact-tag", "x-artifact-sha", "x-artifact-dirty-hash"];

// Small policy-complete Remote Cache server used only by these tests.
export const makeConformanceServer = Effect.fn("test.makeConformanceServer")(function* (mode: ServerMode) {
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
      A.every(
        selectors,
        ([name, value]) => name === "teamId" && (mode.bindTenant ? value === principal.value.namespace : value !== "")
      );
    if (!selectorOk) return HttpServerResponse.empty({ status: 403 });
    const namespace = mode.bindTenant ? principal.value.namespace : O.getOrElse(A.head(selectors), () => ["", ""])[1];
    if (pathname === "/v8/artifacts/status" && request.method === "GET")
      return HttpServerResponse.uint8Array(new TextEncoder().encode('{"status":"enabled"}'), {
        contentType: "application/json",
      });
    if (!Str.startsWith("/v8/artifacts/")(pathname)) return HttpServerResponse.empty({ status: 404 });
    const hash = Str.slice("/v8/artifacts/".length)(pathname);
    if (hash === "events") return HttpServerResponse.empty({ status: 404 });
    if (!/^[a-f0-9]{16,128}$/.test(hash)) return HttpServerResponse.empty({ status: 400 });
    const key = `${namespace}/${hash}`;
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
    if (O.isNone(stored) || (mode.hideUntagged && !R.has(stored.value.headers, "x-artifact-tag")))
      return HttpServerResponse.empty({ status: 404 });
    return HttpServerResponse.uint8Array(stored.value.body, {
      contentType: "application/octet-stream",
      headers: {
        "x-artifact-duration": "0",
        ...(mode.dropTags ? R.remove(stored.value.headers, "x-artifact-tag") : stored.value.headers),
      },
    });
  });
  const server = yield* BunHttpServer.make({ hostname: "127.0.0.1", port: 0 });
  yield* server.serve(app);
  return { url: HttpServer.formatAddress(server.address), tags: Ref.get(tags) };
});

export const targetFor = (options: {
  readonly url: string;
  readonly readerWriterSplit?: boolean;
  readonly tenantBinding?: boolean;
}) =>
  CacheConformanceTarget.make({
    schemaVersion: "cache-conformance-target/v1",
    profile: "local-container",
    topology: "owned-fixture",
    baseUrl: new URL(options.url),
    backend: { id: "in-test", release: "in-test@0", digest: "none" },
    namespace: { teamId, foreignTeamId },
    credentials: { reader: "READER", writer: "WRITER", foreign: "FOREIGN", unknown: "UNKNOWN" },
    policy: { readerWriterSplit: options.readerWriterSplit ?? true, tenantBinding: options.tenantBinding ?? true },
    requestTimeoutMs: 5000,
  });

export const repoRoot = Effect.gen(function* () {
  const path = yield* Path.Path;
  return yield* path.fromFileUrl(new URL("../../../../../", import.meta.url));
});

export const caseOf: {
  (id: string): (report: CacheConformanceRun) => CacheConformanceRun["cases"][number];
  (report: CacheConformanceRun, id: string): CacheConformanceRun["cases"][number];
} = dual(2, (report: CacheConformanceRun, id: string) =>
  A.findFirst(report.cases, (entry) => entry.id === id).pipe(O.getOrThrow)
);
