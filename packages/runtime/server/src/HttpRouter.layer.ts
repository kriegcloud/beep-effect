import { AllowedHeaders } from "@beep/constants";

import { BS } from "@beep/schema";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Eq from "effect/Equal";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as AuthContext from "./AuthContext.layer";
import { BetterAuthRouterLive } from "./BetterAuthRouter.layer";
import * as GoogleWorkspace from "./GoogleWorkspace.layer";
import * as Logger from "./Logger.layer";
import * as Rpc from "./Rpc.layer";

// Health check route
const HealthRoute = HttpLayerRouter.use((router) => router.add("GET", "/v1/health", HttpServerResponse.text("OK")));

// CORS middleware layer
const CorsMiddleware = HttpLayerRouter.cors({
  allowedOrigins: serverEnv.security.trustedOrigins,
  allowedMethods: BS.HttpMethod.pickOptions("GET", "POST", "PUT", "DELETE", "PATCH"),
  allowedHeaders: AllowedHeaders.Options,
  credentials: true,
});

// Protected routes that require authentication
// GoogleWorkspace.layer requires AuthContext which is provided here
const ProtectedRoutes = Layer.mergeAll(Rpc.layer, GoogleWorkspace.layer).pipe(Layer.provide(AuthContext.layer));

// Public routes that don't require authentication
// BetterAuthRouterLive handles authentication internally via Better Auth
const PublicRoutes = Layer.mergeAll(HealthRoute, BetterAuthRouterLive);

// Merge protected and public routes, apply CORS to all
const AllRoutes = Layer.mergeAll(ProtectedRoutes, PublicRoutes).pipe(Layer.provide(CorsMiddleware));

// Serve all routes with middleware
export const layer = HttpLayerRouter.serve(AllRoutes, {
  middleware: Logger.httpLogger,
  disableLogger: false,
  disableListenLog: false,
}).pipe(
  // Configure tracing and span names
  HttpMiddleware.withTracerDisabledWhen(
    (request) =>
      BS.HttpMethod.is.OPTIONS(request.method) ||
      P.or(Eq.equals("/v1/health"), Eq.equals("/v1/documents/rpc"))(request.url)
  ),
  HttpMiddleware.withSpanNameGenerator((request: HttpServerRequest.HttpServerRequest) => {
    let path = request.url;
    try {
      const host = request.headers.host ?? `${serverEnv.app.apiHost}:${serverEnv.app.apiPort}`;
      const base = `http://${host}`;
      const parsedUrl = new URL(request.url, base);
      path = parsedUrl.pathname;
    } catch {
      path = "[unparseable_url_path]";
    }
    return `http ${request.method} ${path}`;
  }),
  Layer.provideMerge(AuthContext.layer)
);
