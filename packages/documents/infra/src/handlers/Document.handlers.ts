import { Document } from "@beep/documents-domain/entities";
import { DocumentRepo } from "@beep/documents-infra/adapters/repos/Document.repo";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";

/**
 * RPC handlers for Document entity operations.
 * Each handler implements the corresponding RPC defined in Document.rpc.ts
 *
 * Error handling strategy:
 * - Expected errors (e.g., DocumentNotFoundError) pass through to the RPC layer
 * - Unexpected errors (e.g., DbError) are converted to defects via Effect.orDie
 */
export const DocumentHandlersLive = Document.DocumentRpcs.Rpcs.toLayer(
  Effect.gen(function* () {
    const repo = yield* DocumentRepo;

    // Decode function that applies defaults from the insert schema
    const decodeDocumentInsert = S.decode(Document.Model.insert);

    return {
      get: (payload) =>
        repo
          .findByIdOrFail(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.get", { attributes: { id: payload.id } })
          ),

      listByUser: (payload) =>
        repo
          .listByUser({
            userId: payload.userId,
            organizationId: payload.organizationId,
          })
          .pipe(
            Effect.map(Stream.fromIterable),
            Effect.catchTag("DbError", Effect.die),
            Stream.unwrap,
            Stream.withSpan("DocumentHandlers.listByUser")
          ),

      list: (payload) =>
        repo
          .list({
            organizationId: payload.organizationId,
            ...(payload.parentDocumentId !== undefined && { parentDocumentId: payload.parentDocumentId }),
            ...(payload.search !== undefined && { search: payload.search }),
            ...(payload.cursor !== undefined && { cursor: payload.cursor }),
            ...(payload.limit !== undefined && { limit: payload.limit }),
          })
          .pipe(
            Effect.map(Stream.fromIterable),
            Effect.catchTag("DbError", Effect.die),
            Stream.unwrap,
            Stream.withSpan("DocumentHandlers.list")
          ),

      "Document.listTrash": (payload) =>
        Effect.gen(function* () {
          const authContext = yield* AuthContext;
          return yield* repo.listArchived({
            organizationId: payload.organizationId,
            userId: authContext.user.id,
            ...(payload.search !== undefined && { search: payload.search }),
          });
        }).pipe(
          Effect.map(Stream.fromIterable),
          Effect.catchTag("DbError", Effect.die),
          Stream.unwrap,
          Stream.withSpan("DocumentHandlers.listTrash")
        ),

      listChildren: (payload) =>
        repo
          .listChildren({
            parentDocumentId: payload.parentDocumentId,
          })
          .pipe(
            Effect.map(Stream.fromIterable),
            Effect.catchTag("DbError", Effect.die),
            Stream.unwrap,
            Stream.withSpan("DocumentHandlers.listChildren")
          ),

      search: (payload) =>
        repo
          .search({
            query: payload.query,
            organizationId: payload.organizationId,
            ...(payload.userId !== undefined && { userId: payload.userId }),
            ...(payload.includeArchived !== undefined && { includeArchived: payload.includeArchived }),
            ...(payload.limit !== undefined && { limit: payload.limit }),
            ...(payload.offset !== undefined && { offset: payload.offset }),
          })
          .pipe(
            Effect.map((results) =>
              Stream.fromIterable(
                results.map((r) => ({
                  ...r,
                  title: O.fromNullable(r.title),
                  content: O.fromNullable(r.content),
                }))
              )
            ),
            Effect.catchTag("DbError", Effect.die),
            Stream.unwrap,
            Stream.withSpan("DocumentHandlers.search")
          ),

      create: (payload) =>
        Effect.gen(function* () {
          const authContext = yield* AuthContext;
          // Decode to apply defaults from the insert schema
          const insertData = yield* decodeDocumentInsert({
            organizationId: payload.organizationId,
            userId: authContext.user.id,
            title: payload.title,
            content: payload.content,
            contentRich: payload.contentRich,
            parentDocumentId: payload.parentDocumentId,
          });
          return yield* repo.insert(insertData);
        }).pipe(
          Effect.catchTag("DbError", Effect.die),
          Effect.catchTag("ParseError", Effect.die),
          Effect.withSpan("DocumentHandlers.create")
        ),

      update: (payload) =>
        repo
          .update(payload)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.update", { attributes: { id: payload.id } })
          ),

      archive: (payload) =>
        repo
          .archive(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.archive", { attributes: { id: payload.id } })
          ),

      restore: (payload) =>
        repo
          .restore(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.restore", { attributes: { id: payload.id } })
          ),

      publish: (payload) =>
        repo
          .publish(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.publish", { attributes: { id: payload.id } })
          ),

      unpublish: (payload) =>
        repo
          .unpublish(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.unpublish", { attributes: { id: payload.id } })
          ),

      lock: (payload) =>
        repo
          .lock(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.lock", { attributes: { id: payload.id } })
          ),

      unlock: (payload) =>
        repo
          .unlock(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("DocumentHandlers.unlock", { attributes: { id: payload.id } })
          ),

      delete: (payload) =>
        repo.findByIdOrFail(payload.id).pipe(
          Effect.flatMap(() => repo.hardDelete(payload.id)),
          Effect.catchTag("DbError", Effect.die),
          Effect.withSpan("DocumentHandlers.delete", { attributes: { id: payload.id } })
        ),
    };
  })
);
