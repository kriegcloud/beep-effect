import { DbPool } from "@beep/db-scope";
import { serverEnv } from "@beep/env/server";
import { DevTools } from "@effect/experimental";
import { NodeSdk } from "@effect/opentelemetry";
import { FetchHttpClient } from "@effect/platform";
import { NodeSocket } from "@effect/platform-node";
import { PgClient } from "@effect/sql-pg";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Layer, Logger } from "effect";
import * as Str from "effect/String";

const DevToolsLive = DevTools.layerWebSocket().pipe(Layer.provide(NodeSocket.layerWebSocketConstructor));

const PgLive = PgClient.layer({
  port: serverEnv.db.pg.port,
  host: serverEnv.db.pg.host,
  username: serverEnv.db.pg.user,
  password: serverEnv.db.pg.password,
  ssl: serverEnv.db.pg.ssl,
  transformResultNames: Str.snakeToCamel,
});

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: `${serverEnv.app.name}-server` },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

export type ServerLayerType =
  | typeof NodeSdkLive
  | typeof DevToolsLive
  | typeof PgLive
  | typeof FetchHttpClient.layer
  | typeof Logger.pretty;

export const layer = Layer.mergeAll(
  NodeSdkLive,
  DevToolsLive,
  PgLive,
  DbPool.Live,
  FetchHttpClient.layer,
  Logger.pretty,
);
