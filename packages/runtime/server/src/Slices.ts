import { CommsRepos } from "@beep/comms-infra";
import { CommsDb } from "@beep/comms-infra/db";
import type { ResendService } from "@beep/core-email";
import { DocumentsRepos } from "@beep/documents-infra";
import { DocumentsDb } from "@beep/documents-infra/db";
import type { AuthEmailService, IamConfig } from "@beep/iam-infra";
import { AuthService, IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import { PartyDb } from "@beep/party-infra/db";
import { TasksDb } from "@beep/tasks-infra/db";
import type * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import type * as ConfigError from "effect/ConfigError";
import * as Layer from "effect/Layer";
import * as CoreServices from "./CoreServices.ts";

export type SliceDatabaseClients =
  | DocumentsDb.DocumentsDb
  | TasksDb.TasksDb
  | CommsDb.CommsDb
  | PartyDb.PartyDb
  | IamDb.IamDb;
export type SliceDatabaseClientsLive = Layer.Layer<
  SliceDatabaseClients,
  ConfigError.ConfigError | SqlError.SqlError,
  SqlClient.SqlClient
>;
export const SliceDatabaseClientsLive: SliceDatabaseClientsLive = Layer.mergeAll(
  IamDb.IamDb.Live,
  DocumentsDb.DocumentsDb.Live,
  TasksDb.TasksDb.Live,
  CommsDb.CommsDb.Live,
  PartyDb.PartyDb.Live
);

type SliceRepositories = DocumentsRepos.DocumentsRepos | CommsRepos.CommsRepos | IamRepos.IamRepos;

export type SliceReposLive = Layer.Layer<
  SliceRepositories,
  ConfigError.ConfigError | SqlError.SqlError,
  SqlClient.SqlClient
>;

export const SliceReposLive: SliceReposLive = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  CommsRepos.layer,
  IamRepos.layer
);

export type CoreSliceServices =
  | SqlClient.SqlClient
  | SliceDatabaseClients
  | ResendService
  | IamConfig
  | AuthEmailService
  | SliceRepositories;

export type CoreSliceServicesLive = Layer.Layer<CoreSliceServices, ConfigError.ConfigError | SqlError.SqlError, never>;

export const CoreSliceServicesLive: CoreSliceServicesLive = SliceReposLive.pipe(
  Layer.provideMerge(Layer.provideMerge(SliceDatabaseClientsLive, CoreServices.CoreServicesLive))
);

export type Slices = CoreSliceServices | AuthService;

export type SlicesLive = Layer.Layer<Slices, never, never>;

export const SlicesLive: SlicesLive = AuthService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(CoreSliceServicesLive),
  Layer.orDie
);
