import { DomainRpc } from "@beep/shared-domain/DomainApi";
import type { EventStreamEvents, Ka } from "@beep/shared-domain/EventStreamRpc";
import * as Policy from "@beep/shared-domain/Policy";
import { EventStreamHub } from "@beep/shared-infra/EventStreamHub";
import { UploadThingApi } from "@beep/shared-infra/internal/upload/uploadthing-api";
import * as HttpServer from "@effect/platform/HttpServer";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { constant } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Mailbox from "effect/Mailbox";
import * as Stream from "effect/Stream";

import { AuthContextHttpMiddlewareLive } from "./CurrentUserRpcMiddlewareLive";

class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()("RpcLogger", {
  wrap: true,
  optional: true,
}) {}

const RpcLoggerLive = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: () => exit,
        onFailure: (cause) =>
          Effect.zipRight(
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

// Create handlers for the prefixed DomainRpc group
const DomainRpcHandlersLive = DomainRpc.toLayer(
  Effect.gen(function* () {
    const eventStreamHub = yield* EventStreamHub;
    const uploadThingApi = yield* UploadThingApi;

    const ka: [Ka] = [{ _tag: "Ka" }];
    const kaStream = Stream.tick("3 seconds").pipe(Stream.map(constant(ka)));

    return DomainRpc.of({
      v1eventStream_connect: Effect.fnUntraced(function* () {
        const { user: currentUser } = yield* Policy.AuthContext;
        const connectionId = crypto.randomUUID();
        const mailbox = yield* Mailbox.make<EventStreamEvents.Type>();

        yield* Effect.acquireRelease(
          eventStreamHub.registerConnection(currentUser.id, {
            connectionId,
            mailbox,
          }),
          () => eventStreamHub.unregisterConnection(currentUser.id, connectionId)
        );

        const eventStream = Mailbox.toStream(mailbox).pipe(
          Stream.groupedWithin(25, "50 millis"),
          Stream.map((chunk) => Chunk.toArray(chunk))
        );

        return Stream.merge(eventStream, kaStream, { haltStrategy: "either" });
      }, Stream.unwrapScoped),

      v1files_initiateUpload: (payload) =>
        uploadThingApi.initiateUpload(payload).pipe(
          Effect.map(({ key, url, fields }) => ({
            presignedUrl: url,
            fields,
            fileKey: key,
          }))
        ),
    });
  })
).pipe(Layer.provide(EventStreamHub.Default), Layer.provide(UploadThingApi.Default));

const RpcHandlersLive = Layer.mergeAll(
  DomainRpcHandlersLive,
  RpcLoggerLive,
  RpcSerialization.layerNdjson,
  HttpServer.layerContext
).pipe(Layer.provideMerge(AuthContextHttpMiddlewareLive));

export const { handler, dispose } = RpcServer.toWebHandler(DomainRpc.middleware(RpcLogger), {
  layer: RpcHandlersLive,
  spanPrefix: "rpc",
  disableFatalDefects: true,
});
