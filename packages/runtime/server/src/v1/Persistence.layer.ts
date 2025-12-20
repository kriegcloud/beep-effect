import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import { Db } from "@beep/shared-server/Db";
import { SharedDb } from "@beep/shared-server/db";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import * as Layer from "effect/Layer";

export type DbClients = SharedDb.SharedDb | IamDb.IamDb | DocumentsDb.DocumentsDb;

const sliceClientsLayer: Layer.Layer<DbClients, never, Db.SliceDbRequirements | S3Service> = Layer.mergeAll(
  SharedDb.layer,
  IamDb.layer,
  DocumentsDb.layer
);

const persistenceInfraLayer: Layer.Layer<Db.SliceDbRequirements | S3Service, never, never> = Layer.mergeAll(
  Db.layer,
  S3Service.defaultLayer
);

export type Services = Db.SliceDbRequirements | DbClients | S3Service;

export const layer: Layer.Layer<Services, never, never> = sliceClientsLayer.pipe(
  Layer.provideMerge(persistenceInfraLayer)
);
