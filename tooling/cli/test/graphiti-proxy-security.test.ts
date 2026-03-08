import { GraphitiProxyConfig } from "@beep/repo-cli/commands/Graphiti/internal/ProxyConfig";
import { makeGraphitiProxyForwarderService } from "@beep/repo-cli/commands/Graphiti/internal/ProxyServices";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { Effect } from "effect";
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
      try: async () => {
        const response = await handler(
          new Request(url.toString(), {
            method: request.method,
            headers: request.headers,
          })
        );
        return HttpClientResponse.fromWeb(request, response);
      },
      catch: (cause) =>
        new HttpClientError.HttpClientError({
          reason: new HttpClientError.TransportError({ request, cause }),
        }),
    })
  );

const makeProxyConfig = () =>
  new GraphitiProxyConfig({
    upstream: "http://127.0.0.1:8000/mcp",
    dependencyHealthEnabled: false,
  });

const makeServerRequest = (url: string) => HttpServerRequest.fromWeb(new Request(`http://proxy.local${url}`));
const readResponseText = (response: HttpServerResponse.HttpServerResponse) =>
  Effect.promise(() => HttpServerResponse.toWeb(response).text());

layer(NodeServices.layer)("Graphiti proxy security", (it) => {
  it.effect(
    "forwards the configured /mcp endpoint subtree and preserves query parameters",
    Effect.fn(function* () {
      let capturedUrl = "";
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const response = yield* forwarder.forward(makeServerRequest("/mcp?cursor=abc")).pipe(
        Effect.provideService(
          HttpClient.HttpClient,
          makeWebHandlerClient(async (request) => {
            capturedUrl = request.url;
            return new Response("ok", { status: 200 });
          })
        )
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
        Effect.provideService(
          HttpClient.HttpClient,
          makeWebHandlerClient(async (request) => {
            capturedUrl = request.url;
            return new Response("nested", { status: 200 });
          })
        )
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
        new GraphitiProxyConfig({
          upstream: "http://127.0.0.1:8000/mcp/",
          dependencyHealthEnabled: false,
        })
      );
      const response = yield* forwarder.forward(makeServerRequest("/mcp/?cursor=abc")).pipe(
        Effect.provideService(
          HttpClient.HttpClient,
          makeWebHandlerClient(async (request) => {
            capturedUrl = request.url;
            return new Response("normalized", { status: 200 });
          })
        )
      );

      expect(capturedUrl).toBe("http://127.0.0.1:8000/mcp?cursor=abc");
      expect(response.status).toBe(200);
      const responseText = yield* readResponseText(response);
      expect(responseText).toBe("normalized");
    })
  );

  it.effect(
    "rejects alternate proxy paths before forwarding upstream",
    Effect.fn(function* () {
      let forwarded = false;
      const forwarder = makeGraphitiProxyForwarderService(makeProxyConfig());
      const response = yield* forwarder.forward(makeServerRequest("/metrics")).pipe(
        Effect.provideService(
          HttpClient.HttpClient,
          makeWebHandlerClient(async () => {
            forwarded = true;
            return new Response("unexpected", { status: 200 });
          })
        )
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
        Effect.provideService(
          HttpClient.HttpClient,
          makeWebHandlerClient(async () => {
            forwarded = true;
            return new Response("unexpected", { status: 200 });
          })
        )
      );

      expect(forwarded).toBe(false);
      expect(response.status).toBe(400);
      const responseText = yield* readResponseText(response);
      expect(responseText).toContain("absolute-form request targets");
    })
  );
});
