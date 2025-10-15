import { mock } from "bun:test";
import * as Redacted from "effect/Redacted";

const clientEnvStub = {
  env: "dev",
  appName: "beep-effect",
  appDomain: "beep.effect.dev",
  authProviderNames: ["google"],
  appUrl: "https://app.example.com",
  apiUrl: "https://api.example.com",
  otlpTraceExportedUrl: "https://otel.example.com/v1/traces",
  otlpLogExportedUrl: "https://otel.example.com/v1/logs",
  logLevel: "Info",
  logFormat: "pretty",
  captchaSiteKey: Redacted.make("test-captcha-key"),
  authUrl: "https://auth.example.com",
  authPath: "/api/auth",
  googleClientId: "test-google-client-id",
} as const;

mock.module("@beep/core-env/client", () => ({
  clientEnv: clientEnvStub,
}));
