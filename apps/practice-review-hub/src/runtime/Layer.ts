/**
 * Runtime layers of the review hub: one MCP endpoint behind a Tailscale login
 * allow-list, bound to the loopback interface.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { makeReviewFilesLayer, ReviewFilesConfig } from "@beep/law-practice-server/ReviewFiles";
import { QuestionQueueLive } from "@beep/law-practice-use-cases/QuestionQueue";
import { ReviewHub, ReviewHubLive, ReviewHubToolkit } from "@beep/law-practice-use-cases/ReviewHub";
import { ReviewQueueLive } from "@beep/law-practice-use-cases/ReviewQueue";
import { sanitizedToolkit, statelessMcpProtocols } from "@beep/mcp-kit";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as McpServer from "effect/ai/McpServer";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import { Headers, HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type { ReviewHubConfig } from "../Config.ts";

/**
 * Header `tailscale serve` sets to the caller's tailnet login.
 *
 * @category constants
 * @since 0.0.0
 */
export const TAILSCALE_LOGIN_HEADER = "tailscale-user-login";

const FORBIDDEN = 403;

// Every request, on every path, must carry an allowed login before any route runs.
const loginAllowList = (allowedLogins: ReadonlyArray<string>) => {
  const allowed = HashSet.fromIterable(allowedLogins);
  return HttpRouter.middleware(
    (httpEffect) =>
      Effect.flatMap(HttpServerRequest.HttpServerRequest, (request) =>
        O.exists(Headers.get(request.headers, TAILSCALE_LOGIN_HEADER), (login) => HashSet.has(allowed, login))
          ? httpEffect
          : Effect.succeed(HttpServerResponse.empty({ status: FORBIDDEN }))
      ),
    { global: true }
  );
};

// Each tool calls the hub operation of the same purpose.
const ReviewHubToolsLive = ReviewHubToolkit.toLayer(
  Effect.map(ReviewHub, (hub) => ({
    review_lock_batch: hub.lockBatch,
    review_open_items: hub.openItems,
    review_record_answer: hub.recordAnswer,
    review_record_verdict: hub.recordVerdict,
  }))
);

/**
 * The hub's MCP endpoint at `/mcp`, behind the login allow-list, over the
 * stores the caller provides.
 *
 * **Details**
 *
 * A request without a `Tailscale-User-Login` header, or with a login not on
 * `allowedLogins`, gets an empty 403 before any tool runs. The endpoint speaks
 * the stateless MCP revision from `@beep/mcp-kit`. It needs an `HttpRouter`
 * and the three review stores.
 *
 * **Example** (Make the hub layer)
 *
 * ```ts
 * import * as Layer from "effect/Layer"
 * import { makeReviewHubLayer } from "@/runtime/Layer"
 *
 * console.log(Layer.isLayer(makeReviewHubLayer(["attorney@example.test"]))) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeReviewHubLayer = (allowedLogins: ReadonlyArray<string>) =>
  Layer.merge(
    sanitizedToolkit(ReviewHubToolkit).pipe(
      Layer.provide(ReviewHubToolsLive),
      Layer.provide(ReviewHubLive),
      Layer.provide(Layer.merge(ReviewQueueLive, QuestionQueueLive))
    ),
    loginAllowList(allowedLogins)
  ).pipe(
    // `layerHttp` fails only on a malformed path or an empty protocol list, both literals here.
    Layer.provideMerge(
      McpServer.layerHttp({
        name: "practice-review-hub",
        version: "0.0.0",
        path: "/mcp",
        protocols: statelessMcpProtocols,
      }).pipe(Layer.orDie)
    )
  );

/**
 * The hub served on `127.0.0.1` at the configured port, over JSONL stores in
 * the configured data directory.
 *
 * **Details**
 *
 * The hub never listens on another interface: `tailscale serve` exposes the
 * loopback port on the tailnet and sets the login header.
 *
 * **Example** (Make the hub server)
 *
 * ```ts
 * import * as Layer from "effect/Layer"
 * import * as S from "effect/Schema"
 * import { ReviewHubConfig } from "@/Config"
 * import { makeReviewHubServer } from "@/runtime/Layer"
 *
 * const config = S.decodeUnknownSync(ReviewHubConfig)({
 *   allowedLogins: ["attorney@example.test"],
 *   dataDirectory: "/var/lib/practice-review-hub",
 *   port: 8787
 * })
 * console.log(Layer.isLayer(makeReviewHubServer(config))) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeReviewHubServer = (config: ReviewHubConfig) =>
  HttpRouter.serve(makeReviewHubLayer(config.allowedLogins)).pipe(
    Layer.provide(makeReviewFilesLayer(ReviewFilesConfig.make({ dataDirectory: config.dataDirectory }))),
    Layer.provide(BunHttpServer.layer({ hostname: "127.0.0.1", port: config.port }))
  );
