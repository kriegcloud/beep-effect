import { DocumentsDb } from "@beep/documents-infra/db";
import { IamDb } from "@beep/iam-infra/db";
import { Db } from "@beep/shared-infra/Db";
import { SharedDb } from "@beep/shared-infra/db";
import type { PgClientServices } from "@beep/shared-infra/internal/db/pg";
import { UploadService } from "@beep/shared-infra/Upload";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import * as Layer from "effect/Layer";

export type DbClients = SharedDb.SharedDb | IamDb.IamDb | DocumentsDb.DocumentsDb;

const sliceClientsLayer: Layer.Layer<DbClients | UploadService, never, Db.SliceDbRequirements | S3Service> =
  Layer.mergeAll(SharedDb.layer, IamDb.layer, DocumentsDb.layer, UploadService.layer);

const persistenceInfraLayer: Layer.Layer<PgClientServices | S3Service, never, never> = Layer.mergeAll(
  Db.layer,
  S3Service.defaultLayer
);

export type Services = PgClientServices | UploadService | DbClients | S3Service;

export const layer: Layer.Layer<Services, never, never> = sliceClientsLayer.pipe(
  Layer.provideMerge(persistenceInfraLayer)
);
