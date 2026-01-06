import { CommsDb } from "@beep/comms-server/db";
import { CustomizationDb } from "@beep/customization-server/db";
import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server/db";
import { Upload } from "@beep/shared-server/services";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import * as Layer from "effect/Layer";

export type DbClients = SharedDb.Db | IamDb.Db | DocumentsDb.Db | CustomizationDb.Db | CommsDb.Db;

const sliceClientsLayer: Layer.Layer<DbClients | Upload.Service, never, DbClient.SliceDbRequirements | S3Service> =
  Layer.mergeAll(SharedDb.layer, IamDb.layer, DocumentsDb.layer, Upload.layer, CustomizationDb.layer, CommsDb.layer);

const persistenceInfraLayer: Layer.Layer<DbClient.SliceDbRequirements | S3Service, never, never> = Layer.mergeAll(
  DbClient.layer,
  S3Service.defaultLayer
);

export type Services = DbClient.SliceDbRequirements | DbClients | S3Service | Upload.Service;

export const layer: Layer.Layer<Services, never, never> = sliceClientsLayer.pipe(
  Layer.provideMerge(persistenceInfraLayer)
);
