import { DocumentsRepos } from "@beep/documents-infra";
import { DocumentsDb } from "@beep/documents-infra/db";
import { IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import { SharedRepos } from "@beep/shared-infra";
import { Db } from "@beep/shared-infra/Db";
import { SharedDb } from "@beep/shared-infra/db";
import * as Reactivity from "@effect/experimental/Reactivity";
import * as Layer from "effect/Layer";

export type DbClients = IamDb.IamDb | DocumentsDb.DocumentsDb | SharedDb.SharedDb;
export type DbClientsLive = Layer.Layer<DbClients, never, Db.PgClientServices>;

const DbClientsLive: DbClientsLive = Layer.mergeAll(
  IamDb.IamDb.Live,
  DocumentsDb.DocumentsDb.Live,
  SharedDb.SharedDb.Live
).pipe(Layer.provide(Reactivity.layer));

export type Repositories = IamRepos.IamRepos | DocumentsRepos.DocumentsRepos | SharedRepos.SharedRepos;

export type RepositoriesLive = Layer.Layer<Repositories | DbClients, never, Db.PgClientServices>;

const RepositoriesLive: RepositoriesLive = Layer.mergeAll(IamRepos.layer, DocumentsRepos.layer, SharedRepos.layer).pipe(
  Layer.provideMerge(DbClientsLive),
  Layer.orDie // TODO make retry
);

export type DbProvides = DbClients | Repositories | Db.PgClientServices;
export const DbLive: Layer.Layer<DbProvides, never, never> = RepositoriesLive.pipe(
  Layer.provideMerge(Db.layer),
  Layer.orDie
);
