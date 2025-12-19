import { DocumentsRepos } from "@beep/documents-infra";
import { DocumentsDb } from "@beep/documents-infra/db";
import { Auth, IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import type { Db } from "@beep/shared-infra/Db";
import { SharedDb } from "@beep/shared-infra/Db";
import type { Email } from "@beep/shared-infra/Email";
import { SharedRepos } from "@beep/shared-infra/repos";
import type * as SqlError from "@effect/sql/SqlError";
import type * as ConfigError from "effect/ConfigError";
import * as Layer from "effect/Layer";
import * as CoreServices from "./CoreServices";

export type SliceDatabaseClients = DocumentsDb.DocumentsDb | IamDb.IamDb | SharedDb.SharedDb;
export type SliceDatabaseClientsLive = Layer.Layer<SliceDatabaseClients, never, Db.PgClientServices>;
export const SliceDatabaseClientsLive: SliceDatabaseClientsLive = Layer.mergeAll(
  IamDb.IamDb.Live,
  DocumentsDb.DocumentsDb.Live,
  SharedDb.SharedDb.Live
);

type SliceRepositories = DocumentsRepos.DocumentsRepos | IamRepos.IamRepos | SharedRepos.SharedRepos;
//
// type L = Layer.Layer.Context<typeof IamRepos.layer>
type SliceReposLive = Layer.Layer<SliceRepositories, never, Db.PgClientServices | SliceDatabaseClients>;
export const SliceReposLive: SliceReposLive = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer
).pipe(Layer.orDie);

export type CoreSliceServices = Db.PgClientServices | SliceDatabaseClients | Email.ResendService | SliceRepositories;

export type CoreSliceServicesLive = Layer.Layer<CoreSliceServices, ConfigError.ConfigError | SqlError.SqlError, never>;

export const CoreSliceServicesLive: CoreSliceServicesLive = SliceReposLive.pipe(
  Layer.provideMerge(Layer.provideMerge(SliceDatabaseClientsLive, CoreServices.CoreServicesLive))
);

export type Slices = CoreSliceServices | Auth.Service;

export type SlicesLive = Layer.Layer<Slices, never, never>;

export const SlicesLive: SlicesLive = Auth.layer.pipe(Layer.provideMerge(CoreSliceServicesLive), Layer.orDie);
