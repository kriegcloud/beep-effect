import { Db } from "@beep/core-db";
import * as KnowledgeManagementDbSchema from "@beep/knowledge-management-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect, TransactionContext } = Db.make(KnowledgeManagementDbSchema);
export const KnowledgeManagementTxContext = TransactionContext;
export type Layer = _Layer.Layer<KnowledgeManagementDb, SqlError | ConfigError, SqlClient>;

export class KnowledgeManagementDb extends Context.Tag("@beep/knowledge-management-infra/KnowledgeManagementDb")<
  KnowledgeManagementDb,
  Db.Db<typeof KnowledgeManagementDbSchema>
>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
