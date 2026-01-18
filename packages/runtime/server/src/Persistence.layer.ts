import { CalendarDb } from "@beep/calendar-server/db";
import { CommsDb } from "@beep/comms-server/db";
import { CustomizationDb } from "@beep/customization-server/db";
import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server/db";
import { Upload } from "@beep/shared-server/services";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import * as Layer from "effect/Layer";

export type DbClients = SharedDb.Db | IamDb.Db | DocumentsDb.Db | CustomizationDb.Db | CommsDb.Db | CalendarDb.Db | KnowledgeDb.Db;

const sliceClientsLayer: Layer.Layer<DbClients | Upload.Service, never, DbClient.SliceDbRequirements | S3Service> =
  Layer.mergeAll(
    SharedDb.layer,
    IamDb.layer,
    DocumentsDb.layer,
    Upload.layer,
    CustomizationDb.layer,
    CommsDb.layer,
    CalendarDb.layer,
    KnowledgeDb.layer,
  );

const persistenceInfraLayer: Layer.Layer<DbClient.SliceDbRequirements | S3Service, never, never> = Layer.mergeAll(
  DbClient.layer,
  S3Service.defaultLayer
);

export type Services = DbClient.SliceDbRequirements | DbClients | S3Service | Upload.Service;

/**
 * Persistence infrastructure layer providing database clients and storage services.
 *
 * This layer wires together:
 * - Slice-specific database clients (Iam, Documents, Shared, Customization, Comms)
 * - Shared database connection pool and configuration
 * - S3 storage service for file uploads
 * - Upload service for managing file transfers
 *
 * @example
 * ```typescript
 * import * as Persistence from "@beep/runtime-server/Persistence.layer";
 * import { SharedDb } from "@beep/shared-server/db";
 * import { Upload } from "@beep/shared-server/services";
 * import * as Effect from "effect/Effect";
 *
 * // Access database client directly
 * const program = Effect.gen(function* () {
 *   const db = yield* SharedDb.Db;
 *   const result = yield* db.query("SELECT * FROM users LIMIT 10");
 *   return result;
 * });
 *
 * // Access upload service
 * const uploadProgram = Effect.gen(function* () {
 *   const upload = yield* Upload.Service;
 *   const url = yield* upload.getSignedUrl({ key: "files/document.pdf" });
 *   return url;
 * });
 *
 * // Provide persistence layer
 * const runnable = program.pipe(Effect.provide(Persistence.layer));
 * ```
 */
export const layer: Layer.Layer<Services, never, never> = sliceClientsLayer.pipe(
  Layer.provideMerge(persistenceInfraLayer)
);
