import { serverEnv } from "@beep/core-env/server";
// import {DevTools} from "@effect/experimental";
// import {NodeSdk} from "@effect/opentelemetry";
// import {NodeSocket} from "@effect/platform-node";
// import {OTLPLogExporter} from "@opentelemetry/exporter-logs-otlp-http";
// import * as Layer from "effect/Layer";
// import * as Logger from "effect/Logger";
// import * as LogLevel from "effect/LogLevel";
// import * as ManagedRuntime from "effect/ManagedRuntime";
// import {makePrettyConsoleLoggerLayer} from "@beep/errors/server";
// import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-http";
// import {BatchLogRecordProcessor} from "@opentelemetry/sdk-logs";
// import {BatchSpanProcessor} from "@opentelemetry/sdk-trace-base";
// import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
// import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import * as IamEntities from "@beep/iam-domain/entities";
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { BS } from "@beep/schema";
import { IamEntityIds, paths, SharedEntityIds } from "@beep/shared-domain";
import type { UnsafeTypes } from "@beep/types";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { AuthEmailService, SendResetPasswordEmailPayload, SendVerificationEmailPayload } from "./AuthEmail.service";
import { commonExtraFields } from "./internal";
import { AllPlugins } from "./plugins";

//
// // const metricExporter = new OTLPMetricExporter({
// //   url: "http://localhost:4318/v1/metrics",
// // });
// export const TelemetryLive = NodeSdk.layer(() => ({
//   resource: {serviceName: `${serverEnv.app.name}-server-auth`},
//   spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({url: "http://localhost:4318/v1/traces"})),
//   logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter({url: "http://localhost:4318/v1/logs"})),
//   // metricReader: new PeriodicExportingMetricReader({
//   //   exporter: metricExporter,
//   //   exportIntervalMillis: Duration.toMillis("5 seconds"),
//   // }),
// }));
//
// export type LoggerLive = Layer.Layer<never, never, never>;
// export const LoggerLive: LoggerLive = serverEnv.app.env === "dev" ? makePrettyConsoleLoggerLayer() : Logger.json;
// export type LogLevelLive = Layer.Layer<never, never, never>;
// export const LogLevelLive: LogLevelLive = Logger.minimumLogLevel(
//   serverEnv.app.env === "dev" ? LogLevel.Debug : LogLevel.Info
// );
//
// export const DevToolsLive =
//   serverEnv.app.env === "dev"
//     ? DevTools.layerWebSocket().pipe(Layer.provide(NodeSocket.layerWebSocketConstructor))
//     : Layer.empty;
// const AuthLive = Layer.mergeAll(TelemetryLive, LoggerLive, LogLevelLive, DevToolsLive);
//
// type AuthRuntimeLive = Layer.Layer.Success<typeof AuthLive>;
// const authRuntime = ManagedRuntime.make(AuthLive);
// export const runAuthPromise = <A, E>(
//   effect: Effect.Effect<A, E, AuthRuntimeLive>,
//   spanName = "authRuntime.runAuthPromise",
//   options?: Parameters<typeof authRuntime.runPromise>[1]
// ) => authRuntime.runPromise(Effect.withSpan(effect, spanName), options);

const AuthOptions = Effect.gen(function* () {
  const { db, drizzle } = yield* IamDb.IamDb;
  const plugins = yield* AllPlugins;
  const { sendResetPassword, sendVerification } = yield* AuthEmailService;

  return yield* Effect.succeed({
    telemetry: {
      debug: true,
    },
    database: drizzleAdapter(drizzle, {
      debugLogs: true,
      provider: "pg",
      usePlural: false,
      schema: IamDbSchema,
      camelCase: true,
    }),
    baseURL: serverEnv.app.authUrl.toString(),
    basePath: "/api/auth",
    appName: serverEnv.app.name,
    secret: Redacted.value(serverEnv.auth.secret),
    // todo clean these up
    trustedOrigins: [...serverEnv.security.trustedOrigins, "http://localhost:4318", "http://127.0.0.1:4318"],
    rateLimit: {
      enabled: true,
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: serverEnv.oauth.authProviderNames,
      },
      encryptOAuthTokens: true,
    },
    session: {
      modelName: IamEntityIds.SessionId.tableName,
      additionalFields: {
        ...commonExtraFields,
      },
      cookieCache: {
        enabled: true,
        maxAge: Duration.days(30).pipe(Duration.toSeconds),
      },
      expiresIn: Duration.days(30).pipe(Duration.toSeconds),
      updateAge: Duration.days(1).pipe(Duration.toSeconds),
    },
    emailVerification: {
      sendOnSignUp: true,
      async sendVerificationEmail(params) {
        await Effect.runPromise(
          Effect.flatMap(
            S.decode(SendVerificationEmailPayload)({
              email: params.user.email,
              url: BS.URLString.make(
                // TODO make env
                `http://localhost:3000${paths.auth.verification.email.verify(params.token)}`
              ).toString(),
            }),
            sendVerification
          ).pipe(Effect.withSpan("AuthService.emailVerification.sendVerificationEmail"))
        );
      },
    },
    emailAndPassword: {
      requireEmailVerification: false,
      enabled: true,
      sendResetPassword: async (params) => {
        await Effect.runPromise(
          Effect.flatMap(
            S.decode(SendResetPasswordEmailPayload)({
              username: params.user.name,
              url: params.url,
              email: params.user.email,
            }),
            sendResetPassword
          ).pipe(Effect.withSpan("AuthService.emailAndPassword.sendResetPassword"))
        );
      },
    },
    socialProviders: A.reduce(
      serverEnv.oauth.authProviderNames,
      {} as BetterAuthOptions["socialProviders"],
      (acc, provider) =>
        ({
          ...acc,
          [provider]: {
            clientSecret: Redacted.value(serverEnv.oauth.provider[provider].clientSecret),
            clientId: Redacted.value(serverEnv.oauth.provider[provider].clientId),
          },
        }) satisfies BetterAuthOptions["socialProviders"]
    ),
    plugins,
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const personalOrgId = SharedEntityIds.OrganizationId.create();
            const personalMemberId = IamEntityIds.MemberId.create();
            const slug = `${user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${user.id.slice(-6)}`;

            const program = Effect.gen(function* () {
              yield* db.insert(IamDbSchema.organization).values({
                id: personalOrgId,
                name: `${user.name || "User"}'s Organization`,
                slug,
                type: "individual",
                ownerUserId: SharedEntityIds.UserId.make(user.id),
                isPersonal: true,
                subscriptionTier: "free",
                subscriptionStatus: "active",
                createdBy: user.id,
                source: "auto_created",
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              yield* db.insert(IamDbSchema.member).values({
                id: personalMemberId,
                userId: S.decodeUnknownSync(SharedEntityIds.UserId)(user.id),
                organizationId: personalOrgId,
                role: "owner",
                status: IamEntities.Member.MemberStatusEnum.active,
                joinedAt: new Date(),
                createdBy: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            });
            // Create personal organization with multi-tenant field

            // Add user as owner with enhanced tracking
            await Effect.runPromise(program.pipe(Effect.withSpan("AuthService.databaseHooks.user.create.after")));
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            // Set active organization context using enhanced fields
            const program = Effect.gen(function* () {
              return yield* db
                .select({
                  orgId: IamDbSchema.organization.id,
                  orgName: IamDbSchema.organization.name,
                  orgType: IamDbSchema.organization.type,
                  isPersonal: IamDbSchema.organization.isPersonal,
                  subscriptionTier: IamDbSchema.organization.subscriptionTier,
                  role: IamDbSchema.member.role,
                  memberStatus: IamDbSchema.member.status,
                })
                .from(IamDbSchema.member)
                .innerJoin(
                  IamDbSchema.organization,
                  d.eq(IamDbSchema.member.organizationId, IamDbSchema.organization.id)
                )
                .where(
                  d.and(
                    d.eq(IamDbSchema.member.userId, SharedEntityIds.UserId.make(session.userId)),
                    d.eq(IamDbSchema.member.status, "active")
                  )
                )
                .orderBy(d.desc(IamDbSchema.organization.isPersonal));
            });

            const userOrgs = await Effect.runPromise(
              program.pipe(Effect.withSpan("AuthService.databaseHooks.session.create.before"))
            );
            const activeOrgId = userOrgs[0]?.orgId;
            const organizationContext = userOrgs.reduce(
              (acc, org) => {
                acc[org.orgId] = {
                  name: org.orgName,
                  type: org.orgType,
                  role: org.role,
                  isPersonal: org.isPersonal,
                  subscriptionTier: org.subscriptionTier,
                };
                return acc;
              },
              // TODO type me
              {} as Record<string, UnsafeTypes.UnsafeAny>
            );

            return {
              data: {
                ...session,
                activeOrganizationId: activeOrgId,
                organizationContext: JSON.stringify(organizationContext),
              },
            };
          },
        },
      },
    },
    user: {
      modelName: SharedEntityIds.UserId.tableName,
      additionalFields: {
        ...commonExtraFields,
      },
    },

    advanced: {
      database: {
        generateId: false,
      },
    },
  } satisfies BetterAuthOptions);
});

export type Options = Effect.Effect.Success<typeof AuthOptions>;

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  accessors: true,
  dependencies: [AuthEmailService.DefaultWithoutDependencies, IamDb.IamDb.Live],
  effect: Effect.flatMap(AuthOptions, (opts) =>
    Effect.succeed({
      auth: betterAuth(opts),
    })
  ),
}) {}
