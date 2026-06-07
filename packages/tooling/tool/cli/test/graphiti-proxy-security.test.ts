import {
  backupDirectoryNameFromEpochMillisForTesting,
  GraphitiProxyConfig,
  isFastMcpRequestBody,
  makeGraphitiProxyForwarderService,
  resolveGraphitiStackDirForTesting,
  shouldInstallProxyServiceForTesting,
  shouldRecoverGraphitiStackForTesting,
} from "@beep/repo-cli/test/Graphiti";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { Duration, Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  HttpClient,
  HttpClientError,
  HttpClientResponse,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";

const makeWebHandlerClient = (handler: (request: Request) => Promise<Response>) =>
  HttpClient.make((request, url) =>
    Effect.tryPromise({
      try: () =>
        Effect.runPromise(
          Effect.gen(function* () {
            const response = yield* Effect.promise(() =>
              Promise.resolve(
                handler(
                  new Request(url.toString(), {
                    method: request.method,
                    headers: request.headers,
                  })
                )
              )
            );
            return HttpClientResponse.fromWeb(request, response);
          })
        ),
      catch: (cause) =>
        new HttpClientError.HttpClientError({
          reason: new HttpClientError.TransportError({ request, cause }),
        }),
    })
  );

const makeProxyConfig = () =>
  GraphitiProxyConfig.make({
    upstream: "http://127.0.0.1:8000/mcp",
    dependencyHealthEnabled: false,
  });

const makeServerRequest = (url: string) => HttpServerRequest.fromWeb(new Request(`http://proxy.local${url}`));
const readResponseText = (response: HttpServerResponse.HttpServerResponse) =>
  Effect.promise(() => HttpServerResponse.toWeb(response).text());
const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);
const utf8Encoder = new TextEncoder();
const provideWebHandlerClient =
  (handler: (request: Request) => Promise<Response>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, Exclude<R, HttpClient.HttpClient>> =>
    effect.pipe(Effect.provideService(HttpClient.HttpClient, makeWebHandlerClient(handler)));

layer(NodeServices.layer)("Graphiti proxy security", (it) => {
  it.effect(
    "forwards the configured /mcp endpoint subtree and preserves query parameters",
    Effect.fn(function* () {
      let capturedUrl = "";
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const response = yield* forwarder.forward(makeServerRequest("/mcp?cursor=abc")).pipe(
        provideWebHandlerClient((request) => {
          capturedUrl = request.url;
          return Promise.resolve(new Response("ok", { status: 200 }));
        })
      );

      expect(capturedUrl).toBe("http://127.0.0.1:8000/mcp?cursor=abc");
      expect(response.status).toBe(200);
      const responseText = yield* readResponseText(response);
      expect(responseText).toBe("ok");
    })
  );

  it.effect(
    "forwards nested MCP subpaths under the configured endpoint",
    Effect.fn(function* () {
      let capturedUrl = "";
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const response = yield* forwarder.forward(makeServerRequest("/mcp/resources?cursor=abc")).pipe(
        provideWebHandlerClient((request) => {
          capturedUrl = request.url;
          return Promise.resolve(new Response("nested", { status: 200 }));
        })
      );

      expect(capturedUrl).toBe("http://127.0.0.1:8000/mcp/resources?cursor=abc");
      expect(response.status).toBe(200);
      const responseText = yield* readResponseText(response);
      expect(responseText).toBe("nested");
    })
  );

  it.effect(
    "normalizes trailing slashes on the configured upstream endpoint before forwarding",
    Effect.fn(function* () {
      let capturedUrl = "";
      const forwarder = makeGraphitiProxyForwarderService(
        GraphitiProxyConfig.make({
          upstream: "http://127.0.0.1:8000/mcp/",
          dependencyHealthEnabled: false,
        })
      );
      const response = yield* forwarder.forward(makeServerRequest("/mcp?cursor=abc")).pipe(
        provideWebHandlerClient((request) => {
          capturedUrl = request.url;
          return Promise.resolve(new Response("normalized", { status: 200 }));
        })
      );

      expect(capturedUrl).toBe("http://127.0.0.1:8000/mcp?cursor=abc");
      expect(response.status).toBe(200);
      const responseText = yield* readResponseText(response);
      expect(responseText).toBe("normalized");
    })
  );

  it.effect(
    "returns streaming upstream responses without waiting for the body to close",
    Effect.fn(function* () {
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const result = yield* forwarder.forward(makeServerRequest("/mcp")).pipe(
        Effect.provideService(
          HttpClient.HttpClient,
          makeWebHandlerClient(() => {
            const body = new ReadableStream<Uint8Array>({
              start: (controller) => {
                controller.enqueue(new TextEncoder().encode("event: message\ndata: {}\n\n"));
              },
            });

            return Promise.resolve(
              new Response(body, {
                status: 200,
                headers: {
                  "content-type": "text/event-stream",
                },
              })
            );
          })
        ),
        Effect.timeoutOption(Duration.millis(250))
      );

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value.status).toBe(200);
      }
    })
  );

  it.effect(
    "classifies startup and status MCP bodies for the fast lane",
    Effect.fn(function* () {
      const slowBody = yield* encodeJson({
        id: 1,
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          arguments: {
            query: "slow",
          },
          name: "search_memory_facts",
        },
      });
      const initializeBody = yield* encodeJson({
        id: 2,
        jsonrpc: "2.0",
        method: "initialize",
        params: {},
      });
      const statusBody = yield* encodeJson({
        id: 3,
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          arguments: {},
          name: "get_status",
        },
      });

      expect(isFastMcpRequestBody(O.some(utf8Encoder.encode(slowBody)))).toBe(false);
      expect(isFastMcpRequestBody(O.some(utf8Encoder.encode(initializeBody)))).toBe(true);
      expect(isFastMcpRequestBody(O.some(utf8Encoder.encode(statusBody)))).toBe(true);
      expect(isFastMcpRequestBody(O.none())).toBe(true);
    })
  );

  it.effect(
    "rejects alternate proxy paths before forwarding upstream",
    Effect.fn(function* () {
      let forwarded = false;
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const response = yield* forwarder.forward(makeServerRequest("/other")).pipe(
        provideWebHandlerClient(() => {
          forwarded = true;
          return Promise.resolve(new Response("unexpected", { status: 200 }));
        })
      );

      expect(forwarded).toBe(false);
      expect(response.status).toBe(404);
      const responseText = yield* readResponseText(response);
      expect(responseText).toContain("only forwards /mcp");
    })
  );

  it.effect(
    "rejects absolute-form request targets that could override the upstream host",
    Effect.fn(function* () {
      let forwarded = false;
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const request = makeServerRequest("/mcp").modify({ url: "https://evil.invalid/mcp" });
      const response = yield* forwarder.forward(request).pipe(
        provideWebHandlerClient(() => {
          forwarded = true;
          return Promise.resolve(new Response("unexpected", { status: 200 }));
        })
      );

      expect(forwarded).toBe(false);
      expect(response.status).toBe(400);
      const responseText = yield* readResponseText(response);
      expect(responseText).toContain("absolute-form request targets");
    })
  );

  it("recovers the backing stack only when recovery is enabled and a container is unhealthy", () => {
    expect(
      shouldRecoverGraphitiStackForTesting({
        falkor: "unhealthy",
        force: false,
        graphiti: "healthy",
        recoverOnUnhealthy: true,
      })
    ).toBe(true);
    expect(
      shouldRecoverGraphitiStackForTesting({
        falkor: "healthy",
        force: false,
        graphiti: "healthy",
        recoverOnUnhealthy: true,
      })
    ).toBe(false);
    expect(
      shouldRecoverGraphitiStackForTesting({
        falkor: "unhealthy",
        force: false,
        graphiti: "healthy",
        recoverOnUnhealthy: false,
      })
    ).toBe(false);
    expect(
      shouldRecoverGraphitiStackForTesting({
        falkor: "healthy",
        force: true,
        graphiti: "healthy",
        recoverOnUnhealthy: false,
      })
    ).toBe(true);
  });

  it("resolves restore stack directory with CLI precedence over environment and default", () => {
    expect(resolveGraphitiStackDirForTesting(O.some("/tmp/cli"), O.some("/tmp/env"))).toBe("/tmp/cli");
    expect(resolveGraphitiStackDirForTesting(O.none(), O.some("/tmp/env"))).toBe("/tmp/env");
    expect(resolveGraphitiStackDirForTesting(O.none(), O.none())).toBe("/home/elpresidank/graphiti-mcp");
  });

  it("uses a stable timestamped backup directory name", () => {
    expect(backupDirectoryNameFromEpochMillisForTesting(0)).toBe("data-1970-01-01T000000000Z");
  });

  it("reinstalls the proxy service when the unit points at a stale checkout or upstream", () => {
    const currentUnit = [
      "[Service]",
      "WorkingDirectory=/repo",
      "ExecStart=/home/elpresidank/.bun/bin/bun run beep graphiti proxy",
      "Environment=GRAPHITI_PROXY_HOST=127.0.0.1",
      "Environment=GRAPHITI_PROXY_PORT=8123",
      "Environment=GRAPHITI_PROXY_UPSTREAM=http://127.0.0.1:8000/mcp",
    ].join("\n");

    expect(
      shouldInstallProxyServiceForTesting({
        repoRoot: "/repo",
        unitText: currentUnit,
        upstream: "http://127.0.0.1:8000/mcp",
      })
    ).toBe(false);
    expect(
      shouldInstallProxyServiceForTesting({
        repoRoot: "/new-repo",
        unitText: currentUnit,
        upstream: "http://127.0.0.1:8000/mcp",
      })
    ).toBe(true);
    expect(
      shouldInstallProxyServiceForTesting({
        repoRoot: "/repo",
        unitText: currentUnit,
        upstream: "http://127.0.0.1:9000/mcp",
      })
    ).toBe(true);
  });
});
