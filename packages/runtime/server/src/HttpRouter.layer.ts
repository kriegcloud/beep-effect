import { AllowedHeaders } from "@beep/constants";
import { IamApi } from "@beep/iam-domain";
import { IamApiLive } from "@beep/iam-server";

import { BS } from "@beep/schema";
import { serverEnv } from "@beep/shared-server/ServerEnv";
import * as HttpApiScalar from "@effect/platform/HttpApiScalar";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Eq from "effect/Equal";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as AuthContext from "./AuthContext.layer.ts";
import * as Logger from "./Logger.layer.ts";

// import * as Rpc from "./Rpc.layer.ts";

// Register the IAM HttpApi with the HttpLayerRouter
// This is the correct pattern for combining HttpApi with HttpLayerRouter
const IamApiRoutes = HttpLayerRouter.addHttpApi(IamApi, {
  openapiPath: "/v1/docs/openapi.json",
}).pipe(
  // Provide the IAM API handler implementations
  Layer.provideMerge(IamApiLive)
);

// Swagger/Scalar documentation route
const DocsRoute = HttpApiScalar.layerHttpLayerRouter({
  api: IamApi,
  path: "/v1/docs",
});

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
const ProtectedRoutes = Layer.mergeAll(
  IamApiRoutes
  // Rpc.layer
).pipe(Layer.provideMerge(AuthContext.layer));

// Public routes that don't require authentication
const PublicRoutes = Layer.mergeAll(DocsRoute, HealthRoute);

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
  })
);
