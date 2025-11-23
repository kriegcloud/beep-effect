import { Db } from "@beep/core-db";
import * as PartyDbSchema from "@beep/party-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect } = Db.make(PartyDbSchema);

export type Layer = _Layer.Layer<PartyDb, SqlError | ConfigError, SqlClient>;

export class PartyDb extends Context.Tag("@beep/party-infra/PartyDb")<PartyDb, Db.Db<typeof PartyDbSchema>>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
