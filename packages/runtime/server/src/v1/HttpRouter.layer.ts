import { AllowedHeaders } from "@beep/constants";
import { IamApi } from "@beep/iam-domain";
import { IamApiLive } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpApiScalar from "@effect/platform/HttpApiScalar";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Layer from "effect/Layer";
import * as AuthContext from "./AuthContext.layer.ts";

const ApiLive = HttpLayerRouter.addHttpApi(IamApi).pipe(
  Layer.provide(Layer.mergeAll(IamApiLive)),
  Layer.provide(HttpServer.layerContext)
);
const HealthRoute = HttpLayerRouter.use((router) => router.add("GET", "/v1/health", HttpServerResponse.text("OK")));
const AllRoutes = Layer.mergeAll(ApiLive, HealthRoute);

// Merge all layers that require the Api service
// Both HttpApiBuilder.serve() and HttpApiScalar.layer() need Api
const ApiConsumersLayer = Layer.mergeAll(
  HttpApiBuilder.serve(HttpMiddleware.logger),
  HttpApiScalar.layer({ path: "/v1/docs" }),
  HttpApiBuilder.middlewareOpenApi({ path: "/v1/docs/openapi.json" })
);

export const layer = ApiConsumersLayer.pipe(
  // Provide the API implementation to all consumers
  Layer.provide(AllRoutes),
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
  Layer.provide(AuthContext.layer)
);
