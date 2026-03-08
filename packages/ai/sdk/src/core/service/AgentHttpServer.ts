import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import { Layer } from "effect";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { AgentHttpApi } from "./AgentHttpApi.js";
import { layer as AgentHttpHandlers } from "./AgentHttpHandlers.js";
import { AgentServerAccess, type AgentServerAccessOptions, makeAgentServerAccess } from "./AgentServerAccess.js";

/**
 * @since 0.0.0
 */
export type AgentHttpServerOptions = AgentServerAccessOptions &
  Readonly<{
    readonly port?: number;
  }>;

/**
 * @since 0.0.0
 */
export const layer = (options: AgentHttpServerOptions = {}) => {
  const port = options.port ?? 3000;
  const hostname = options.hostname ?? "127.0.0.1";
  const accessLayer = Layer.effect(
    AgentServerAccess,
    makeAgentServerAccess({
      hostname,
      ...(options.authToken === undefined ? {} : { authToken: options.authToken }),
    })
  );
  const apiLayer = HttpApiBuilder.layer(AgentHttpApi).pipe(
    Layer.provide(AgentHttpHandlers),
    Layer.provide(accessLayer)
  );

  return HttpRouter.serve(apiLayer).pipe(Layer.provide(BunHttpServer.layer({ hostname, port })));
};
