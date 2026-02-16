"use client";

import { Rpc as KnowledgeRpc } from "@beep/knowledge-domain";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket";
import * as RpcClient from "@effect/rpc/RpcClient";
import type { RpcClientError } from "@effect/rpc/RpcClientError";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as Str from "effect/String";

const KnowledgeRpcs = KnowledgeRpc.Batch.Rpcs.merge(KnowledgeRpc.Entity.Rpcs)
  .merge(KnowledgeRpc.Relation.Rpcs)
  .merge(KnowledgeRpc.GraphRag.Rpcs)
  .merge(KnowledgeRpc.Evidence.Rpcs)
  .merge(KnowledgeRpc.MeetingPrep.Rpcs);

type KnowledgeRpcClient = RpcClient.FromGroup<typeof KnowledgeRpcs, RpcClientError>;

const knowledgeRpcEndpoint = `${F.pipe(
  clientEnv.apiUrl.toString(),
  Str.replace(/^http:/, "ws:"),
  Str.replace(/^https:/, "wss:")
)}/v1/knowledge/rpc`;

const KnowledgeRpcProtocolLive = RpcClient.layerProtocolSocket({
  retryTransientErrors: true,
  retrySchedule: Schedule.spaced("2 seconds"),
}).pipe(
  Layer.provide([BrowserSocket.layerWebSocket(knowledgeRpcEndpoint), RpcSerialization.layerNdjson])
);

const withKnowledgeRpcClient = <A, E, R>(
  run: (client: KnowledgeRpcClient) => Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  Effect.scoped(
    Effect.gen(function* () {
      const client = yield* RpcClient.make(KnowledgeRpcs);
      return yield* run(client);
    }).pipe(Effect.provide(KnowledgeRpcProtocolLive))
  );

export const startKnowledgeBatch = (payload: Parameters<KnowledgeRpcClient["batch_start"]>[0]) =>
  withKnowledgeRpcClient((client) => client.batch_start(payload));

export const getKnowledgeBatchStatus = (payload: Parameters<KnowledgeRpcClient["batch_getStatus"]>[0]) =>
  withKnowledgeRpcClient((client) => client.batch_getStatus(payload));

export const queryKnowledgeGraph = (payload: Parameters<KnowledgeRpcClient["graphrag_query"]>[0]) =>
  withKnowledgeRpcClient((client) => client.graphrag_query(payload));
