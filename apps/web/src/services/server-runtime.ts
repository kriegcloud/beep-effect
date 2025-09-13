// apps/web/src/lib/runtime.ts
import "server-only";
import { DbPool, PgLive } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { serverEnv } from "@beep/core-env/server";
import { FileDb } from "@beep/files-infra/db";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { AuthEmailService } from "@beep/iam-infra/adapters/better-auth/AuthEmail.service";
import { IamDb } from "@beep/iam-infra/db/Db";
import { DevTools } from "@effect/experimental";
import { NodeSdk, type Resource } from "@effect/opentelemetry";
import { FetchHttpClient, type HttpClient } from "@effect/platform";
import { NodeSocket } from "@effect/platform-node";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { PgClient } from "@effect/sql-pg/PgClient";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Layer } from "effect";
import type { ConfigError } from "effect/ConfigError";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";

type ServerError = ConfigError | SqlError;

type DevToolsLive = Layer.Layer<never, never, never>;
const DevToolsLive: DevToolsLive = DevTools.layerWebSocket().pipe(Layer.provide(NodeSocket.layerWebSocketConstructor));

type NodeSdkLive = Layer.Layer<Resource.Resource, never, never>;

const NodeSdkLive: NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: `${serverEnv.app.name}-server` },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

type BaseLive = Layer.Layer<Resource.Resource | HttpClient.HttpClient, never, never>;

const BaseLive: BaseLive = Layer.mergeAll(
  NodeSdkLive,
  FetchHttpClient.layer,
  serverEnv.app.env === "prod" ? Layer.empty : Logger.pretty,
  serverEnv.app.env === "prod" ? Layer.empty : DevToolsLive
);

type DatabaseLive = Layer.Layer<PgClient | SqlClient | DbPool, ServerError, never>;
const DatabaseLive: DatabaseLive = Layer.mergeAll(PgLive, DbPool.Live);

type SliceDbs = IamDb.IamDb | FileDb.FileDb;

type SliceDbsLive = Layer.Layer<SliceDbs, ServerError, never>;
const SliceDbsLive: SliceDbsLive = Layer.mergeAll(IamDb.layerWithoutDeps, FileDb.layerWithoutDeps).pipe(
  Layer.provide(DatabaseLive)
);

type AuthEmailLive = Layer.Layer<AuthEmailService, never, never>;
const AuthEmailLive: AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provide([ResendService.Default])
);

type AuthLive = Layer.Layer<AuthService, ServerError, never>;
const AuthLive: AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provide([SliceDbsLive, AuthEmailLive]));

type AppLive = Layer.Layer<Resource.Resource | HttpClient.HttpClient | AuthService, ServerError, never>;
const AppLive: AppLive = Layer.mergeAll(BaseLive, AuthLive);

export const runtime = ManagedRuntime.make(AppLive);
