"use client";
import { EnvValue, LogLevel } from "@beep/constants";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import { TreeFormatter } from "effect/ParseResult";
import * as S from "effect/Schema";

const ClientEnvSchema = S.Struct({
  env: EnvValue,
  appName: S.NonEmptyTrimmedString,
  appDomain: S.NonEmptyTrimmedString,
  authProviderNames: S.String,
  appUrl: S.String,
  apiUrl: S.String,
  otlpTraceExportedUrl: S.String,
  logLevel: LogLevel,
  captchaSiteKey: S.String,
  authUrl: S.String,
  authPath: S.String,
  googleClientId: S.String,
});

namespace ClientEnvSchema {
  export type Type = S.Schema.Type<typeof ClientEnvSchema>;
  export type Encoded = S.Schema.Encoded<typeof ClientEnvSchema>;
}

export const clientEnv = F.pipe(
  {
    env: process.env.NEXT_PUBLIC_ENV,
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN,
    authProviderNames: process.env.NEXT_PUBLIC_AUTH_PROVIDER_NAMES,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    otlpTraceExportedUrl: process.env.NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL,
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL,
    captchaSiteKey: process.env.NEXT_PUBLIC_LOG_FORMAT,
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
    authPath: process.env.NEXT_PUBLIC_AUTH_PATH,
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  } satisfies Record<keyof ClientEnvSchema.Encoded, unknown>,
  S.decodeUnknownEither(ClientEnvSchema),
  Either.getOrElse((parseIssue) => {
    throw new Error(`❌ Invalid environment variables: ${TreeFormatter.formatErrorSync(parseIssue)}`);
  })
);
