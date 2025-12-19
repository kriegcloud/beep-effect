import { serverEnv } from "@beep/shared-infra/ServerEnv";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpServer from "@effect/platform/HttpServer";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as Layer from "effect/Layer";
import * as HttpRouter from "./HttpRouter.layer.ts";

export const layer = Layer.launch(
  HttpRouter.layer.pipe(
    Layer.provide(BunHttpServer.layer({ port: serverEnv.app.api.port })),
    Layer.provide([FetchHttpClient.layer, HttpServer.layerContext])
  )
);
