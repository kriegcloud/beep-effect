import { DocumentVersion } from "@beep/documents-domain/entities";
import { DocumentVersionRepo } from "@beep/documents-server/db";
import * as Effect from "effect/Effect";

/**
 * RPC handlers for DocumentVersion operations used by evidence highlighting.
 *
 * Evidence drift is forbidden (C-05): callers MUST request content by documentVersionId, not "latest".
 */
export const DocumentVersionHandlersLive = DocumentVersion.DocumentVersionRpcs.Rpcs.toLayer(
  Effect.gen(function* () {
    const repo = yield* DocumentVersionRepo;

    return {
      "DocumentVersion.getContent": (payload) =>
        repo.findByIdOrFail(payload.id).pipe(
          Effect.catchTags({
            // Hardening: do not defect in demo-critical handlers. Treat DB issues as "not found" to avoid
            // leaking details and to keep caller behavior deterministic.
            DatabaseError: () =>
              Effect.fail(new DocumentVersion.DocumentVersionErrors.DocumentVersionNotFoundError({ id: payload.id })),
            VersionNotFoundError: () => Effect.fail(new DocumentVersion.DocumentVersionErrors.DocumentVersionNotFoundError({ id: payload.id })),
          }),
          Effect.filterOrFail(
            // Treat org mismatch as not found to avoid cross-org existence leaks.
            (row) => row.organizationId === payload.organizationId,
            () => new DocumentVersion.DocumentVersionErrors.DocumentVersionNotFoundError({ id: payload.id })
          ),
          Effect.map((row) => ({
            documentId: row.documentId,
            documentVersionId: row.id,
            content: row.content,
          })),
          Effect.withSpan("DocumentVersionHandlers.getContent", {
            attributes: { id: payload.id, organizationId: payload.organizationId },
          })
        ),
    };
  })
);
