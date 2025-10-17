"use client";
import { AuthProviderNameValue, EnvValue, LogFormat, LogLevel } from "@beep/constants";
import { BS } from "@beep/schema";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import { TreeFormatter } from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const AuthProviderNames = BS.destructiveTransform((i: string) =>
  S.decodeUnknownSync(S.NonEmptyArray(AuthProviderNameValue))(Str.split(",")(i))
)(S.String);

const ClientEnvSchema = S.Struct({
  env: EnvValue,
  appName: S.NonEmptyTrimmedString,
  appDomain: S.NonEmptyTrimmedString,
  authProviderNames: AuthProviderNames,
  appUrl: BS.Url,
  apiUrl: BS.Url,
  otlpTraceExporterUrl: BS.Url,
  otlpLogExporterUrl: BS.Url,
  otlpMetricExporterUrl: BS.Url,
  logLevel: LogLevel,
  logFormat: LogFormat,
  captchaSiteKey: S.Redacted(S.String),
  authUrl: BS.Url,
  authPath: BS.URLPath,
  googleClientId: S.String,
});

declare namespace ClientEnvSchema {
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
    otlpTraceExporterUrl: process.env.NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL,
    otlpLogExporterUrl: process.env.NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL,
    otlpMetricExporterUrl: process.env.NEXT_PUBLIC_OTLP_METRIC_EXPORTER_URL,
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL,
    logFormat: process.env.NEXT_PUBLIC_LOG_FORMAT,
    captchaSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
    authPath: process.env.NEXT_PUBLIC_AUTH_PATH,
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  } satisfies Record<keyof ClientEnvSchema.Encoded, unknown>,
  S.decodeUnknownEither(ClientEnvSchema),
  Either.getOrElse((parseIssue) => {
    throw new Error(`❌ Invalid environment variables: ${TreeFormatter.formatErrorSync(parseIssue)}`);
  })
);
