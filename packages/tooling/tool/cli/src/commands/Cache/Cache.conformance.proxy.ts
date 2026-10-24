/**
 * Scoped loopback reverse proxy that injects explicit faults into artifact reads.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { Sha256HexFromBytes } from "@beep/schema";
import { O } from "@beep/utils";
import { BunHttpServer } from "@effect/platform-bun";
import * as A from "effect/Array";
import * as Clock from "effect/Clock";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Headers from "effect/http/Headers";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientRequest from "effect/http/HttpClientRequest";
import * as HttpServer from "effect/http/HttpServer";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as Match from "effect/Match";
import * as Redacted from "effect/Redacted";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import {
  CacheConformanceBearers,
  CacheConformanceExchange,
  CacheConformanceProxyEvent,
  CacheConformanceTarget,
} from "./Cache.conformance.schemas.ts";
import { classifyCacheConformanceStatus } from "./Cache.conformance.wire.ts";
import { corruptCacheArtifactBody, tamperCacheArtifactTag } from "./Cache.protocol.fixture.ts";
import { CacheCommandError } from "./Cache.schemas.ts";
import type { Sha256Hex } from "@beep/schema";
import type {
  CacheConformanceCredentialRole,
  CacheConformanceFault,
  CacheConformanceMethod,
  CacheConformanceOperationId,
  CacheConformanceOutcome,
  CacheConformanceRoute,
  CacheConformanceSelectorShape,
} from "./Cache.conformance.schemas.ts";

const $I = $RepoCliId.create("commands/Cache/Cache.conformance.proxy");

/**
 * Proxy configuration: the target to forward to, the run bearers used only to
 * label roles, and how long a `timeout` fault holds a response.
 *
 * **Example** (Inspect proxy options)
 * ```ts
 * import { CacheConformanceProxyOptions } from "@beep/repo-cli/commands/Cache"
 * console.assert("holdMs" in CacheConformanceProxyOptions.fields)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class CacheConformanceProxyOptions extends S.Opaque<
  CacheConformanceProxyOptions,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    target: CacheConformanceTarget,
    bearers: CacheConformanceBearers,
    holdMs: S.Int.check(S.isBetween({ minimum: 1, maximum: 300_000 })),
  }).pipe(
    $I.annoteSchema("CacheConformanceProxyOptions", {
      description: "Upstream target, role-labelling bearers and the timeout fault's hold duration.",
    })
  )
) {}

const hashBytes = S.decodeEffect(Sha256HexFromBytes);
const bodyLimit = 64 * 1024 * 1024;
const eventLimit = 5000;
const captureLimit = 64;
const hopHeaders = [
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding",
  "content-encoding",
  "keep-alive",
];
const withoutHop = Headers.removeMany(hopHeaders);
const ArtifactHash = S.String.check(S.isPattern(/^[0-9a-fA-F]{1,128}$/));
const isArtifactHash = S.is(ArtifactHash);
const empty = new Uint8Array();
// Bun prints the error that ends a response body stream; the message says the
// abort is the injected fault, not a proxy failure.
// A plain string keeps Bun's print to one line (an Error adds a stack).
const injectedAbort = (fault: "reset" | "truncated-body") =>
  `conformance fault proxy: injected ${fault} (intentional connection abort, not a failure)`;

type Delivered = {
  readonly status: O.Option<number>;
  readonly headers: Headers.Headers;
  readonly body: Uint8Array;
  readonly outcome: O.Option<CacheConformanceOutcome>;
  readonly response: HttpServerResponse.HttpServerResponse;
};

type Captured = { readonly body: Uint8Array; readonly tag: string };

const deliver = (
  status: number,
  headers: Headers.Headers,
  body: Uint8Array,
  head: boolean
): HttpServerResponse.HttpServerResponse => {
  const kept = Headers.remove(withoutHop(headers), "content-type");
  return head
    ? HttpServerResponse.empty({
        status,
        headers: O.match(Headers.get(headers, "content-length"), {
          onNone: () => kept,
          onSome: (length) => Headers.set(kept, "content-length", length),
        }),
      })
    : HttpServerResponse.uint8Array(body, {
        status,
        headers: kept,
        contentType: O.getOrElse(Headers.get(headers, "content-type"), () => "application/octet-stream"),
      });
};

const statusOnly = (status: number): Delivered => ({
  status: O.some(status),
  headers: Headers.empty,
  body: empty,
  outcome: O.none(),
  response: HttpServerResponse.empty({ status }),
});

/**
 * Start a scoped loopback reverse proxy in front of a conformance target.
 *
 * **Details**
 * Requests are forwarded unchanged except for an explicit fault selected with
 * `setScenario`, which applies only to artifact `GET`/`HEAD` reads:
 * `missing-tag`, `tampered-tag` and `tampered-body` rewrite a successful
 * upstream response (tag and byte tampering reuse the protocol fixture's code);
 * `truncated-body` sends part of the body and then aborts the connection;
 * `wrong-team` replays a body and tag the proxy captured on an upload for the
 * same hash under a different team; `status-429` and `status-503` answer
 * without forwarding; `timeout` holds the response for `holdMs`; `reset`
 * aborts before any byte is sent. Events use the exchange receipt vocabulary
 * and describe what the client was delivered: never a URL, bearer, tag value
 * or body. A 404 is classed as a miss only when no upload of that hash in that
 * namespace passed through this proxy.
 *
 * **Example** (Scope a proxy)
 * ```ts
 * import { makeCacheConformanceFaultProxy } from "@beep/repo-cli/commands/Cache"
 * console.assert(typeof makeCacheConformanceFaultProxy === "function")
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export const makeCacheConformanceFaultProxy = Effect.fn("CacheConformance.makeFaultProxy")(function* (
  options: CacheConformanceProxyOptions
) {
  const client = yield* HttpClient.HttpClient;
  const { target, bearers } = options;
  const upstream = Str.replace(/\/+$/, "")(target.baseUrl.href);
  const scenario = yield* Ref.make<{ readonly id: string; readonly fault: CacheConformanceFault }>({
    id: "initial",
    fault: "none",
  });
  const events = yield* Ref.make(A.empty<CacheConformanceProxyEvent>());
  const written = yield* Ref.make(HashSet.empty<string>());
  const captures = yield* Ref.make(HashMap.empty<string, Captured>());
  // Later entries win, so a single-token topology labels its bearer `writer`.
  const roles = HashMap.make<ReadonlyArray<readonly [string, CacheConformanceCredentialRole]>>(
    [`Bearer ${Redacted.value(bearers.unknown)}`, "unknown"],
    [`Bearer ${Redacted.value(bearers.foreign)}`, "foreign"],
    [`Bearer ${Redacted.value(bearers.reader)}`, "reader"],
    [`Bearer ${Redacted.value(bearers.writer)}`, "writer"]
  );
  const roleOf = (authorization: O.Option<string>): CacheConformanceCredentialRole =>
    O.match(authorization, {
      onNone: () => "missing",
      onSome: (value) => O.getOrElse(HashMap.get(roles, value), () => "unknown"),
    });
  const selectorOf = (team: O.Option<string>): CacheConformanceSelectorShape =>
    O.match(team, {
      onNone: () => "empty",
      onSome: (value) =>
        value === target.namespace.teamId
          ? "team-id"
          : value === target.namespace.foreignTeamId
            ? "foreign-team-id"
            : "run-epoch",
    });

  const forward = Effect.fnUntraced(function* (request: HttpServerRequest.HttpServerRequest, body: Uint8Array) {
    const base = HttpClientRequest.make(request.method)(`${upstream}${request.url}`).pipe(
      HttpClientRequest.setHeaders(withoutHop(request.headers))
    );
    const outgoing =
      request.method === "PUT" || request.method === "POST"
        ? HttpClientRequest.bodyUint8Array(
            base,
            body,
            O.getOrElse(Headers.get(request.headers, "content-type"), () => "application/octet-stream")
          )
        : base;
    return yield* client.execute(outgoing).pipe(
      Effect.flatMap((response) =>
        response.arrayBuffer.pipe(
          Effect.map((buffer) => ({
            status: O.some(response.status),
            headers: response.headers,
            body: new Uint8Array(buffer),
          }))
        )
      ),
      Effect.timeoutOption(Duration.millis(target.requestTimeoutMs)),
      Effect.map(O.getOrElse(() => ({ status: O.none<number>(), headers: Headers.empty, body: empty }))),
      Effect.orElseSucceed(() => ({ status: O.none<number>(), headers: Headers.empty, body: empty }))
    );
  });

  const rewrite = (
    fault: CacheConformanceFault,
    head: boolean,
    reply: { readonly status: O.Option<number>; readonly headers: Headers.Headers; readonly body: Uint8Array }
  ): Delivered =>
    O.match(reply.status, {
      onNone: () => ({ ...statusOnly(502), outcome: O.none() }),
      onSome: (status): Delivered => {
        const plain: Delivered = {
          status: reply.status,
          headers: reply.headers,
          body: reply.body,
          outcome: O.none(),
          response: deliver(status, reply.headers, reply.body, head),
        };
        if (status !== 200) return plain;
        return Match.value(fault).pipe(
          Match.when("missing-tag", (): Delivered => {
            const headers = Headers.remove(reply.headers, "x-artifact-tag");
            return { ...plain, headers, response: deliver(status, headers, reply.body, head) };
          }),
          Match.when("tampered-tag", (): Delivered => {
            const headers = O.match(Headers.get(reply.headers, "x-artifact-tag"), {
              onNone: () => reply.headers,
              onSome: (tag) => Headers.set(reply.headers, "x-artifact-tag", tamperCacheArtifactTag(tag)),
            });
            return { ...plain, headers, response: deliver(status, headers, reply.body, head) };
          }),
          Match.when("tampered-body", (): Delivered => {
            const body = corruptCacheArtifactBody(reply.body);
            return { ...plain, body, response: deliver(status, reply.headers, body, head) };
          }),
          Match.when("truncated-body", (): Delivered => {
            const partial = reply.body.subarray(0, Math.floor(reply.body.byteLength / 2));
            const kept = withoutHop(reply.headers);
            // A chunk followed by a delayed failure ships headers and part of
            // the body, then aborts: a client-visible truncated transfer.
            return {
              ...plain,
              body: partial,
              outcome: O.some("truncated-body"),
              response: HttpServerResponse.stream(
                Stream.concat(
                  Stream.make(partial),
                  Stream.fromEffect(Duration.millis(50).pipe(Effect.sleep)).pipe(
                    Stream.drain,
                    Stream.concat(Stream.fail(injectedAbort("truncated-body")))
                  )
                ),
                { status, headers: kept }
              ),
            };
          }),
          Match.orElse(() => plain)
        );
      },
    });

  const respond = Effect.fnUntraced(function* (
    request: HttpServerRequest.HttpServerRequest,
    fault: CacheConformanceFault,
    team: O.Option<string>,
    hash: O.Option<string>,
    body: Uint8Array
  ) {
    const head = request.method === "HEAD";
    return yield* Match.value(fault).pipe(
      Match.when("status-429", () => Effect.succeed(statusOnly(429))),
      Match.when("status-503", () => Effect.succeed(statusOnly(503))),
      Match.when("timeout", () =>
        Effect.sleep(Duration.millis(options.holdMs)).pipe(
          Effect.as<Delivered>({ ...statusOnly(504), outcome: O.some("timeout") })
        )
      ),
      Match.when("reset", () =>
        Effect.succeed<Delivered>({
          status: O.none(),
          headers: Headers.empty,
          body: empty,
          outcome: O.some("transport-error"),
          response: HttpServerResponse.stream(Stream.fail(injectedAbort("reset"))),
        })
      ),
      Match.when("wrong-team", () =>
        Ref.get(captures).pipe(
          Effect.map((all) =>
            A.findFirst(
              A.fromIterable(all),
              ([key]) =>
                O.exists(hash, (value) => Str.endsWith(`\0${value}`)(key)) &&
                !O.exists(team, (value) => Str.startsWith(`${value}\0`)(key))
            ).pipe(
              O.match({
                onNone: () => statusOnly(404),
                onSome: ([, captured]): Delivered => {
                  const headers = Headers.fromInput({
                    "content-type": "application/octet-stream",
                    "x-artifact-tag": captured.tag,
                  });
                  return {
                    status: O.some(200),
                    headers,
                    body: captured.body,
                    outcome: O.none(),
                    response: deliver(200, headers, captured.body, head),
                  };
                },
              })
            )
          )
        )
      ),
      Match.orElse(() => forward(request, body).pipe(Effect.map((reply) => rewrite(fault, head, reply))))
    );
  });

  const app = Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const started = yield* Clock.currentTimeMillis;
    const current = yield* Ref.get(scenario);
    const [pathname = "", query = ""] = Str.split(request.url, "?");
    const team = O.fromNullishOr(new URLSearchParams(query).get("teamId"));
    const segment = Str.startsWith("/v8/artifacts/")(pathname)
      ? O.some(Str.slice("/v8/artifacts/".length)(pathname))
      : O.none<string>();
    const hash = O.filter(segment, (value) => value !== "events" && value !== "status");
    const route: CacheConformanceRoute = O.isSome(hash)
      ? "/v8/artifacts/{hash}"
      : pathname === "/v8/artifacts/status"
        ? "/v8/artifacts/status"
        : pathname === "/v8/artifacts/events"
          ? "/v8/artifacts/events"
          : "/v8/artifacts";
    const method: CacheConformanceMethod =
      request.method === "PUT" || request.method === "POST" || request.method === "HEAD" ? request.method : "GET";
    const read = O.isSome(hash) && (method === "GET" || method === "HEAD");
    const fault: CacheConformanceFault = read ? current.fault : "none";
    const body =
      method === "PUT" || method === "POST"
        ? yield* request.arrayBuffer.pipe(
            Effect.map((buffer) => new Uint8Array(buffer)),
            Effect.orElseSucceed(() => empty)
          )
        : empty;
    const delivered = yield* respond(request, fault, team, hash, body);
    const key = `${O.getOrElse(team, () => "")}\0${O.getOrElse(hash, () => "")}`;
    const uploaded = method === "PUT" && O.exists(delivered.status, (status) => status >= 200 && status < 300);
    if (uploaded) {
      yield* Ref.update(written, HashSet.add(key));
      yield* O.match(Headers.get(request.headers, "x-artifact-tag"), {
        onNone: () => Effect.void,
        onSome: (tag) =>
          Ref.update(captures, (all) =>
            HashMap.size(all) < captureLimit ? HashMap.set(all, key, { body, tag }) : all
          ),
      });
    }
    const neverWritten = !HashSet.has(yield* Ref.get(written), key);
    const tag = Headers.get(delivered.headers, "x-artifact-tag");
    const operationId: O.Option<CacheConformanceOperationId> = O.isSome(hash)
      ? O.some(method === "PUT" ? "uploadArtifact" : method === "HEAD" ? "artifactExists" : "downloadArtifact")
      : route === "/v8/artifacts/status"
        ? O.some("getArtifactStatus")
        : route === "/v8/artifacts/events"
          ? O.some("recordCacheEvents")
          : O.some("queryArtifacts");
    const finished = yield* Clock.currentTimeMillis;
    const exchange = CacheConformanceExchange.make({
      step: Str.slice(0, 96)(`proxy-${Str.toLowerCase(method)}-${current.id}`),
      role: roleOf(Headers.get(request.headers, "authorization")),
      method,
      route,
      operationId,
      strictScored: fault === "none",
      selector: selectorOf(team),
      hash: O.match(hash, { onNone: () => "none", onSome: (value) => (isArtifactHash(value) ? "valid" : "non-hex") }),
      outcome: O.getOrElse(delivered.outcome, () =>
        O.match(delivered.status, {
          onNone: (): CacheConformanceOutcome => "transport-error",
          onSome: classifyCacheConformanceStatus(neverWritten),
        })
      ),
      status: delivered.status,
      contentType: Headers.get(delivered.headers, "content-type").pipe(O.map(Str.slice(0, 128))),
      requestBytes: S.Natural.make(body.byteLength),
      requestSha256: body.byteLength > 0 ? O.some(yield* hashBytes(body)) : O.none<Sha256Hex>(),
      requestTagSha256: yield* O.match(Headers.get(request.headers, "x-artifact-tag"), {
        onNone: () => Effect.succeed(O.none<Sha256Hex>()),
        onSome: (value) => hashBytes(new TextEncoder().encode(value)).pipe(Effect.asSome),
      }),
      responseBytes: S.Natural.make(delivered.body.byteLength),
      responseSha256:
        O.isSome(delivered.status) && method !== "HEAD" ? O.some(yield* hashBytes(delivered.body)) : O.none(),
      tagPresent: O.isSome(tag),
      tagSha256: O.isSome(tag) ? O.some(yield* hashBytes(new TextEncoder().encode(tag.value))) : O.none(),
      durationPresent: O.isSome(Headers.get(delivered.headers, "x-artifact-duration")),
      elapsedMs: S.Natural.make(Math.max(0, Math.round(finished - started))),
    });
    const event = CacheConformanceProxyEvent.make({
      scenario: current.id,
      fault,
      upstreamStatus:
        fault === "status-429" ||
        fault === "status-503" ||
        fault === "timeout" ||
        fault === "reset" ||
        fault === "wrong-team"
          ? O.none()
          : delivered.status,
      exchange,
    });
    yield* Ref.update(events, (all) => (all.length < eventLimit ? A.append(all, event) : all));
    return delivered.response;
  });
  const server = yield* BunHttpServer.make({ hostname: "127.0.0.1", port: 0, maxRequestBodySize: bodyLimit });
  yield* server.serve(app);
  return {
    url: HttpServer.formatAddress(server.address),
    events: Ref.get(events),
    setScenario: (id: string, fault: CacheConformanceFault) => Ref.set(scenario, { id, fault }),
  };
}, CacheCommandError.mapError("Cannot run the conformance fault proxy."));
