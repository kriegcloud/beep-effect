import { clientEnv } from "@beep/shared-env/ClientEnv";
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

export const addRpcErrorLogging = <Client>(client: Client): Client => {
  const isStream = (u: unknown): u is Stream.Stream<unknown, unknown, unknown> => P.hasProperty(u, Stream.StreamTypeId);
  const wrapCall = <F extends (...args: Array<unknown>) => unknown>(fn: F, path: ReadonlyArray<string>): F => {
    const rpcId = F.pipe(path, A.join("."));
    const logCause = (cause: unknown) => Effect.logError(`[RPC]: ${rpcId} failed`, cause);

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
    if (P.compose(P.isNotNullable, P.isObject)(node)) {
      for (const [key, value] of Struct.entries(node)) {
        const nextPath = [...path, key];
        if (F.isFunction(value)) {
          (node as Record<string, unknown>)[key] = wrapCall(value, nextPath);
          continue;
        }
        visit(value, nextPath);
      }
    }
    return node;
  };

  return visit(client, A.empty()) as Client;
};

export const RpcConfigLive = RpcClient.layerProtocolSocket({
  retryTransientErrors: true,
  retrySchedule: Schedule.spaced("2 seconds"),
}).pipe(
  Layer.provide([
    BrowserSocket.layerWebSocket(
      `${F.pipe(clientEnv.apiUrl.toString(), Str.replace(/^http:/, "ws:"), Str.replace(/^https:/, "wss:"))}rpc`
    ),
    RpcSerialization.layerNdjson,
  ])
);
