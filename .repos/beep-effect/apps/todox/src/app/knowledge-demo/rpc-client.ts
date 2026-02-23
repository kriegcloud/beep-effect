"use client";

import { Rpc as KnowledgeRpc } from "@beep/knowledge-domain";
import { makeAtomRuntime } from "@beep/runtime-client";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket";
import * as RpcClient from "@effect/rpc/RpcClient";
import type { RpcClientError } from "@effect/rpc/RpcClientError";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as Str from "effect/String";
import * as React from "react";

const KnowledgeRpcs = KnowledgeRpc.Batch.Rpcs.merge(KnowledgeRpc.Entity.Rpcs)
  .merge(KnowledgeRpc.Relation.Rpcs)
  .merge(KnowledgeRpc.GraphRag.Rpcs)
  .merge(KnowledgeRpc.Evidence.Rpcs)
  .merge(KnowledgeRpc.MeetingPrep.Rpcs);

type KnowledgeRpcClient = RpcClient.FromGroup<typeof KnowledgeRpcs, RpcClientError>;

type StartKnowledgeBatchPayload = Parameters<KnowledgeRpcClient["batch_start"]>[0];
type GetKnowledgeBatchStatusPayload = Parameters<KnowledgeRpcClient["batch_getStatus"]>[0];
type QueryKnowledgeGraphPayload = Parameters<KnowledgeRpcClient["graphrag_query"]>[0];

interface RpcInput<Payload> {
  readonly payload: Payload;
  readonly sessionToken: null | string;
}

export type StartKnowledgeBatchSuccess = KnowledgeRpc.Batch.StartBatch.Success;
export type GetKnowledgeBatchStatusSuccess = KnowledgeRpc.Batch.GetBatchStatus.Success;
export type QueryKnowledgeGraphSuccess = KnowledgeRpc.GraphRag.Query.Success;

const knowledgeRpcEndpoint = `${F.pipe(
  clientEnv.apiUrl.toString(),
  Str.replace(/^http:/, "ws:"),
  Str.replace(/^https:/, "wss:")
)}/v1/knowledge/rpc`;

const KnowledgeRpcProtocolLive = RpcClient.layerProtocolSocket({
  retryTransientErrors: true,
  retrySchedule: Schedule.spaced("2 seconds"),
}).pipe(Layer.provide([BrowserSocket.layerWebSocket(knowledgeRpcEndpoint), RpcSerialization.layerNdjson]));

const atomRuntime = makeAtomRuntime(() => KnowledgeRpcProtocolLive);

const withSessionHeaders = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  sessionToken: null | string
): Effect.Effect<A, E, R> => {
  if (sessionToken === null) {
    return effect;
  }

  return RpcClient.withHeaders(effect, {
    authorization: `Bearer ${sessionToken}`,
  });
};

const withKnowledgeRpcClient = <A, E, R>(
  run: (client: KnowledgeRpcClient) => Effect.Effect<A, E, R>,
  sessionToken: null | string
): Effect.Effect<A, E, R> =>
  Effect.scoped(
    Effect.gen(function* () {
      const client = yield* RpcClient.make(KnowledgeRpcs);
      return yield* withSessionHeaders(run(client), sessionToken);
    }).pipe(Effect.provide(KnowledgeRpcProtocolLive))
  );

const startKnowledgeBatchAtom = atomRuntime.fn(({ payload, sessionToken }: RpcInput<StartKnowledgeBatchPayload>) =>
  withKnowledgeRpcClient(
    (client) =>
      client.batch_start({
        ...payload,
        documents: payload.documents.map((document) =>
          KnowledgeRpc.Batch.StartBatch.BatchDocument.make({
            documentId: document.documentId,
            text: document.text,
          })
        ),
      }),
    sessionToken
  )
);

const getKnowledgeBatchStatusAtom = atomRuntime.fn(
  ({ payload, sessionToken }: RpcInput<GetKnowledgeBatchStatusPayload>) =>
    withKnowledgeRpcClient((client) => client.batch_getStatus(payload), sessionToken)
);

const queryKnowledgeGraphAtom = atomRuntime.fn(({ payload, sessionToken }: RpcInput<QueryKnowledgeGraphPayload>) =>
  withKnowledgeRpcClient((client) => client.graphrag_query(payload), sessionToken)
);

export const useKnowledgeRpcClient = (sessionToken: null | string) => {
  const startKnowledgeBatch = useAtomSet(startKnowledgeBatchAtom, { mode: "promise" });
  const getKnowledgeBatchStatus = useAtomSet(getKnowledgeBatchStatusAtom, { mode: "promise" });
  const queryKnowledgeGraph = useAtomSet(queryKnowledgeGraphAtom, { mode: "promise" });

  const startKnowledgeBatchWithAuth = React.useCallback(
    (payload: StartKnowledgeBatchPayload) => startKnowledgeBatch({ payload, sessionToken }),
    [sessionToken, startKnowledgeBatch]
  );

  const getKnowledgeBatchStatusWithAuth = React.useCallback(
    (payload: GetKnowledgeBatchStatusPayload) => getKnowledgeBatchStatus({ payload, sessionToken }),
    [getKnowledgeBatchStatus, sessionToken]
  );

  const queryKnowledgeGraphWithAuth = React.useCallback(
    (payload: QueryKnowledgeGraphPayload) => queryKnowledgeGraph({ payload, sessionToken }),
    [queryKnowledgeGraph, sessionToken]
  );

  return React.useMemo(
    () => ({
      startKnowledgeBatch: startKnowledgeBatchWithAuth,
      getKnowledgeBatchStatus: getKnowledgeBatchStatusWithAuth,
      queryKnowledgeGraph: queryKnowledgeGraphWithAuth,
    }),
    [getKnowledgeBatchStatusWithAuth, queryKnowledgeGraphWithAuth, startKnowledgeBatchWithAuth]
  );
};
