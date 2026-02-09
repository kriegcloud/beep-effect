import { $RuntimeServerId } from "@beep/identity/packages";
import { Comment, Discussion, Document, DocumentVersion } from "@beep/documents-domain/entities";
import { Handlers as DocumentsHandlers, DocumentsDb, DocumentsRepos } from "@beep/documents-server";
import { Rpc as KnowledgeDomainRpc } from "@beep/knowledge-domain";
import { Rpc as KnowledgeServerRpc, KnowledgeRepos } from "@beep/knowledge-server";
import { Policy } from "@beep/shared-domain";
import { SharedRpcs } from "@beep/shared-domain";
import { SharedServerRpcs } from "@beep/shared-server/rpc";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import { AuthContextRpcMiddlewaresLayer } from "./AuthContext.layer";

const $I = $RuntimeServerId.create("Rpc.layer");

export class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()($I`RpcLogger`, {
  wrap: true,
  optional: true,
}) {}

export const RpcLoggerLive: Layer.Layer<RpcLogger, never, never> = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: F.constant(exit),
        onFailure: (cause) =>
          Effect.andThen(
            Effect.annotateLogs(Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause), {
              "rpc.method": opts.rpc._tag,
              "rpc.clientId": opts.clientId,
            }),
            exit
          ),
      })
    )
  )
);

const SharedRpcLayer = RpcServer.layerHttpRouter({
  group: SharedRpcs.V1.Rpcs.middleware(RpcLogger),
  path: "/v1/shared/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(SharedServerRpcs.layer),
  Layer.provide(AuthContextRpcMiddlewaresLayer)
);

const DocumentsRpcs = Document.DocumentRpcs.Rpcs
  .merge(Discussion.DiscussionRpcs.Rpcs)
  .merge(Comment.CommentRpcs.Rpcs)
  .merge(DocumentVersion.DocumentVersionRpcs.Rpcs)
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(RpcLogger);

const DocumentsRpcLayer = RpcServer.layerHttpRouter({
  group: DocumentsRpcs,
  path: "/v1/documents/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(AuthContextRpcMiddlewaresLayer),
  // Provide Documents slice handler implementations and DB repos (sequential to satisfy dependencies).
  Layer.provide(
    DocumentsHandlers.DocumentsHandlersLive.pipe(
      Layer.provide(DocumentsRepos.layer),
      Layer.provide(DocumentsDb.layer)
    )
  )
);

const KnowledgeRpcs = KnowledgeDomainRpc.Batch.Rpcs
  .merge(KnowledgeDomainRpc.Entity.Rpcs)
  .merge(KnowledgeDomainRpc.Relation.Rpcs)
  .merge(KnowledgeDomainRpc.GraphRag.Rpcs)
  .merge(KnowledgeDomainRpc.Evidence.Rpcs)
  .merge(KnowledgeDomainRpc.MeetingPrep.Rpcs)
  .merge(KnowledgeDomainRpc.Ontology.Rpcs)
  .merge(KnowledgeDomainRpc.Extraction.Rpcs)
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(RpcLogger);

const KnowledgeRpcLayer = RpcServer.layerHttpRouter({
  group: KnowledgeRpcs,
  path: "/v1/knowledge/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(AuthContextRpcMiddlewaresLayer),
  // Provide Knowledge slice handler implementations and DB repos (sequential to satisfy dependencies).
  Layer.provide(KnowledgeServerRpc.V1.layer.pipe(Layer.provide(KnowledgeRepos.layer)))
);

export const layer = Layer.mergeAll(SharedRpcLayer, DocumentsRpcLayer, KnowledgeRpcLayer);
// const rpcLayer = RpcServer.layerHttpRouter({
//   group: SharedRpcs.V1.Rpcs,
//   path: "/v1/shared/rpc",
//   protocol: "websocket",
//   spanPrefix: "rpc",
//   disableFatalDefects: true,
// }).pipe(Layer.provide(Layer.mergeAll(SharedServerRpcs.layer)), Layer.provide(AuthContextLive.layer));
//
// const rpcsLayer = Layer.mergeAll(rpcLayer).pipe(Layer.provide(AuthContextLive.layer));
//
// export const layer = RpcServer.layerHttpRouter({
//   group: SharedRpcs.V1.Rpcs.middleware(RpcLogger),
//   path: "/v1/documents/rpc",
//   protocol: "websocket",
//   spanPrefix: "rpc",
//   disableFatalDefects: true,
// }).pipe(Layer.provideMerge(rpcsLayer), Layer.provide(RpcLoggerLive), Layer.provide(RpcSerialization.layerNdjson));
