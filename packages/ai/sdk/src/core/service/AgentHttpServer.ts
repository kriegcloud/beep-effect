import { BunHttpServer } from "@effect/platform-bun";
import * as Layer from "effect/Layer";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { AgentHttpApi } from "./AgentHttpApi.js";
import { layer as AgentHttpHandlers } from "./AgentHttpHandlers.js";

export type AgentHttpServerOptions = {
  readonly port?: number;
};

export const layer = (options: AgentHttpServerOptions = {}) => {
  const port = options.port ?? 3000;
  const apiLayer = HttpApiBuilder.layer(AgentHttpApi).pipe(Layer.provide(AgentHttpHandlers));

  return HttpRouter.serve(apiLayer).pipe(Layer.provide(BunHttpServer.layer({ port })));
};
