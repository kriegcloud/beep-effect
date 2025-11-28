import { Db } from "@beep/core-db";
import * as DocumentsDbSchema from "@beep/documents-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect, TransactionContext } = Db.make(DocumentsDbSchema);
export const DocumentsTxContext = TransactionContext;
export type Layer = _Layer.Layer<DocumentsDb, SqlError | ConfigError, SqlClient>;

export class DocumentsDb extends Context.Tag("@beep/documents-infra/DocumentsDb")<
  DocumentsDb,
  Db.Db<typeof DocumentsDbSchema>
>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
