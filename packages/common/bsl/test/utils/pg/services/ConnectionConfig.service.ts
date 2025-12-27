import type { ConnectionOptions } from "node:tls";
import { $SharedServerId } from "@beep/identity/packages";
import { thunk } from "@beep/utils/thunk";
import * as Config from "effect/Config";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import * as Pg from "pg";

const $I = $SharedServerId.create("internal/db/pg/services/ConnectionConfigService");

Pg.types.setTypeParser(Pg.types.builtins.DATE, F.identity);
Pg.types.setTypeParser(Pg.types.builtins.TIMESTAMP, F.identity);
Pg.types.setTypeParser(Pg.types.builtins.TIMESTAMPTZ, F.identity);
Pg.types.setTypeParser(Pg.types.builtins.JSON, F.identity);
Pg.types.setTypeParser(Pg.types.builtins.JSONB, F.identity);

const types = Pg.types;

export interface PgClientConfig {
  readonly host: string;
  readonly port: number;
  readonly path?: string | undefined;
  readonly ssl: boolean | ConnectionOptions | undefined;
  readonly database: string | undefined;
  readonly user: string;
  readonly password: Redacted.Redacted;

  readonly idleTimeout: Duration.DurationInput;
  readonly connectTimeout: Duration.DurationInput;

  readonly maxConnections?: number | undefined;
  readonly minConnections?: number | undefined;
  readonly connectionTTL?: Duration.DurationInput | undefined;

  readonly application_name: string;
  readonly spanAttributes?: Record<string, unknown> | undefined;

  readonly transformResultNames: (str: string) => string;
  readonly transformQueryNames: (str: string) => string;
  readonly transformJson: boolean;
  readonly types: Pg.CustomTypesConfig;
}

const PgConfig = Config.nested("DB_PG")(
  Config.all({
    ssl: Config.boolean("SSL").pipe(Config.withDefault(false)),
    port: Config.port("PORT").pipe(Config.withDefault(5432)),
    user: Config.nonEmptyString("USER").pipe(Config.withDefault("postgres")),
    password: Config.redacted(Config.nonEmptyString("PASSWORD")),
    host: Config.nonEmptyString("HOST").pipe(Config.withDefault("localhost")),
    database: Config.nonEmptyString("DATABASE").pipe(Config.withDefault("postgres")),
    transformQueryNames: Config.succeed(Str.camelToSnake),
    transformResultNames: Config.succeed(Str.snakeToCamel),
    transformJson: Config.succeed(true),
    types: Config.succeed(types),
    idleTimeout: F.pipe(Duration.seconds(10), Config.succeed),
    connectTimeout: F.pipe(Duration.seconds(10), Config.succeed),
    application_name: Config.succeed("@beep/shared-server"),
  })
).pipe(thunk);

export interface Shape {
  readonly config: PgClientConfig;
}

export type ServiceEffect = Effect.Effect<Shape, never, never>;

const serviceEffect: ServiceEffect = F.pipe(Effect.Do, Effect.bind("config", PgConfig), Effect.orDie);

export class ConnectionConfig extends Effect.Service<ConnectionConfig>()($I`ConnectionConfig`, {
  accessors: true,
  dependencies: [],
  effect: serviceEffect,
}) {}

export const layer: Layer.Layer<ConnectionConfig, never, never> = ConnectionConfig.Default;
