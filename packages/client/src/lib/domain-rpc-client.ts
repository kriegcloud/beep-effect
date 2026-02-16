import { envVars } from "@/lib/env-vars";
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import { DomainRpc } from "@example/domain/domain-api";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { hasProperty } from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";

export const addRpcErrorLogging = <Client>(client: Client): Client => {
  const isStream = (u: unknown): u is Stream.Stream<unknown, unknown, unknown> =>
    hasProperty(u, Stream.StreamTypeId);

  const wrapCall = <F extends (...args: Array<unknown>) => unknown>(
    fn: F,
    path: ReadonlyArray<string>,
  ): F => {
    const rpcId = path.join(".");
    const logCause = (cause: unknown) => Effect.logError(`[RPC] ${rpcId} failed`, cause);

    return function (this: ThisParameterType<F>, ...args: Parameters<F>): ReturnType<F> {
      const result = fn.apply(this, args);
      if (Effect.isEffect(result)) {
        return result.pipe(Effect.tapErrorCause(logCause)) as ReturnType<F>;
      }
      if (isStream(result)) {
        return result.pipe(Stream.tapErrorCause(logCause)) as ReturnType<F>;
      }
      return result as ReturnType<F>;
    } as F;
  };

  const visit = (node: unknown, path: ReadonlyArray<string>) => {
    if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        const nextPath = [...path, key];
        if (typeof value === "function") {
          (node as Record<string, unknown>)[key] = wrapCall(value, nextPath);
          continue;
        }
        visit(value, nextPath);
      }
    }
    return node;
  };

  return visit(client, []) as Client;
};

const RpcConfigLive = RpcClient.layerProtocolSocket({
  retryTransientErrors: true,
  retrySchedule: Schedule.spaced("2 seconds"),
}).pipe(
  Layer.provide([
    BrowserSocket.layerWebSocket(
      `${envVars.API_URL.toString().replace(/^http:/, "ws:").replace(/^https:/, "wss:")}rpc`,
    ),
    RpcSerialization.layerNdjson,
  ]),
);

export class DomainRpcClient extends Effect.Service<DomainRpcClient>()("@example/DomainRpcClient", {
  dependencies: [RpcConfigLive],
  scoped: RpcClient.make(DomainRpc).pipe(Effect.map((client) => addRpcErrorLogging(client))),
}) {}
