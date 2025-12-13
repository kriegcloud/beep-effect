import { AllowedHeaders } from "@beep/constants";
import { AuthContextHttpMiddlewareLive } from "@beep/runtime-server/rpcs/AuthContextMiddlewareLive.ts";
import { BS } from "@beep/schema";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { FetchHttpClient } from "@effect/platform";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpApiScalar from "@effect/platform/HttpApiScalar";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServer from "@effect/platform/HttpServer";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Layer } from "effect";
import { SignInRoutes } from "./auth/routes/v1/iam/sign-in.ts";
import { SignUpRoutes } from "./auth/routes/v1/iam/sign-up.ts";
import { DomainApi } from "./DomainApi.ts";

// import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
// import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";

// Merge all group handler implementations
const ApiHandlersLayer = Layer.mergeAll(SignInRoutes, SignUpRoutes);

// Create the top-level HttpApi layer
// This requires all ApiGroup services (signIn, signUp) to be provided
const DomainApiLayer = HttpApiBuilder.api(DomainApi).pipe(Layer.provide(ApiHandlersLayer));

// Merge all layers that require the Api service
// Both HttpApiBuilder.serve() and HttpApiScalar.layer() need Api
const ApiConsumersLayer = Layer.mergeAll(
  HttpApiBuilder.serve(HttpMiddleware.logger),
  HttpApiScalar.layer({ path: "/v1/docs" }),
  HttpApiBuilder.middlewareOpenApi({ path: "/v1/docs/openapi.json" })
);

// Create the server Layer
// Provide DomainApiLayer to all the layers that need it
const ServerLayer = ApiConsumersLayer.pipe(
  // Provide the API implementation to all consumers
  Layer.provide(DomainApiLayer),
  // Provide CORS configuration
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: serverEnv.security.trustedOrigins,
      allowedMethods: BS.HttpMethod.pickOptions("GET", "POST", "PUT", "DELETE", "PATCH"),
      allowedHeaders: AllowedHeaders.Options,
      credentials: true,
    })
  ),
  // Log the server's listening address
  HttpServer.withLogAddress,
  // Provide auth context middleware
  Layer.provide(AuthContextHttpMiddlewareLive),
  // Provide the Bun HTTP server
  Layer.provide(BunHttpServer.layer({ port: 8080 })),
  // Provide HTTP server context
  Layer.provide(HttpServer.layerContext),
  // Provide FetchHttpClient for any outbound HTTP needs
  Layer.provide(FetchHttpClient.layer)
);

// Launch the server
Layer.launch(ServerLayer).pipe(BunRuntime.runMain);
