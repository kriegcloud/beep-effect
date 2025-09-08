"use client";
import { URLPath } from "@beep/schema/custom";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { AuthProviderNameValue, ConfigURL, EnvValue } from "./common";

export const ClientConfig = Config.nested("NEXT_PUBLIC")(
  Config.all({
    env: S.Config("ENV", EnvValue).pipe(Config.withDefault(EnvValue.Enum.dev)),
    appName: Config.nonEmptyString("APP_NAME"),
    appDomain: Config.nonEmptyString("APP_DOMAIN").pipe(Config.withDefault("localhost")),
    authProviderNames: Config.array(S.Config("AUTH_PROVIDER_NAMES", AuthProviderNameValue)),
    appUrl: ConfigURL("APP_URL"),
    apiUrl: ConfigURL("API_URL"),
    otlpTraceExportedUrl: ConfigURL("OTLP_TRACE_EXPORTER_URL"),
    logLevel: Config.logLevel("APP_LOG_LEVEL").pipe(Config.withDefault("None")),
    captchaSiteKey: Config.redacted(Config.nonEmptyString("CAPTCHA_SITE_KEY")),
    authUrl: ConfigURL("AUTH_URL"),
    authPath: S.Config("AUTH_PATH", URLPath),
    googleClientId: Config.redacted(Config.nonEmptyString("GOOGLE_CLIENT_ID")),
  })
);

// const envMap = new Map(Object.entries(import.meta.env))
const provider = ConfigProvider.fromEnv().pipe(ConfigProvider.constantCase);
const loadConfig = provider.load(ClientConfig);

export const clientEnv = Effect.runSync(loadConfig);
