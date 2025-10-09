// import {findRepoRoot} from "@beep/tooling-utils/repo";
// import * as FileSystem from "@effect/platform/FileSystem";
// import * as Path from "@effect/platform/Path";
// import * as BunContext from "@effect/platform-bun/BunContext";
// import * as BunRuntime from "@effect/platform-bun/BunRuntime";
// import * as A from "effect/Array";
// import * as Console from "effect/Console";
// import * as Effect from "effect/Effect";
// import * as Encoding from "effect/Encoding";
// import * as O from "effect/Option";
// import * as Random from "effect/Random";
// import * as Cause from "effect/Cause";
// import * as Struct from "effect/Struct";
// import {FsUtils} from "@beep/tooling-utils";
// import * as Layer from "effect/Layer";
// import {BS} from "@beep/schema";
//
// namespace EnvKey {
//   export const {
//     Schema,
//     Enum,
//     Options,
//     toTagged,
//     derive,
//   } = BS.stringLiteralKit(
//     "APP_NAME",
//     "APP_ENV",
//     "APP_DOMAIN",
//     "APP_ADMIN_EMAILS",
//     "APP_ADMIN_USER_IDS",
//     "APP_LOG_FORMAT",
//     "APP_LOG_LEVEL",
//     "APP_MCP_URL",
//     "APP_API_URL",
//     "APP_AUTH_PATH",
//     "APP_AUTH_URL",
//     "APP_CLIENT_URL",
//     "OTLP_HOST",
//     "OTLP_TRACE_EXPORTER_URL",
//     "OTLP_LOG_EXPORTER_URL",
//     "EMAIL_FROM",
//     "EMAIL_TEST",
//     "EMAIL_RESEND_API_KEY",
//     "AI_ANTHROPIC_API_KEY",
//     "AI_OPENAI_API_KEY",
//     "AI_ELEVENLABS_API_KEY",
//     "AI_ELEVENLABS_AGENT_ID",
//     "AI_KITS_API_KEY",
//     "MARKETING_DUB_TOKEN",
//     "DB_PG_HOST",
//     "DB_PG_PORT",
//     "DB_PG_USER",
//     "DB_PG_PASSWORD",
//     "DB_PG_DATABASE",
//     "DB_PG_URL",
//     "DB_PG_SSL",
//     "DB_PG_DEBUG",
//     "KV_REDIS_HOST",
//     "KV_REDIS_PORT",
//     "KV_REDIS_PASSWORD",
//     "KV_REDIS_URL",
//     "CLOUD_AWS_REGION",
//     "CLOUD_AWS_ACCESS_KEY_ID",
//     "CLOUD_AWS_SECRET_ACCESS_KEY",
//     "CLOUD_AWS_S3_BUCKET_NAME",
//     "CLOUD_GOOGLE_CAPTCHA_SECRET_KEY",
//     "CLOUD_GOOGLE_CAPTCHA_SITE_KEY",
//     "OAUTH_PROVIDER_MICROSOFT_TENANT_ID",
//     "OAUTH_PROVIDER_MICROSOFT_CLIENT_ID",
//     "OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET",
//     "OAUTH_PROVIDER_GOOGLE_CLIENT_ID",
//     "OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET",
//     "OAUTH_PROVIDER_DISCORD_CLIENT_ID",
//     "OAUTH_PROVIDER_DISCORD_CLIENT_SECRET",
//     "OAUTH_PROVIDER_GITHUB_CLIENT_ID",
//     "OAUTH_PROVIDER_GITHUB_CLIENT_SECRET",
//     "OAUTH_PROVIDER_LINKEDIN_CLIENT_ID",
//     "OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET",
//     "OAUTH_PROVIDER_TWITTER_CLIENT_ID",
//     "OAUTH_PROVIDER_TWITTER_CLIENT_SECRET",
//     "OAUTH_PROVIDER_FACEBOOK_CLIENT_ID",
//     "OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET",
//     "OAUTH_PROVIDER_NAMES",
//     "NEXT_PUBLIC_ENV",
//     "NEXT_PUBLIC_APP_NAME",
//     "NEXT_PUBLIC_APP_DOMAIN",
//     "NEXT_PUBLIC_AUTH_PROVIDER_NAMES",
//     "NEXT_PUBLIC_API_URL",
//     "NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL",
//     "NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL",
//     "NEXT_PUBLIC_LOG_LEVEL",
//     "NEXT_PUBLIC_LOG_FORMAT",
//     "NEXT_PUBLIC_CAPTCHA_SITE_KEY",
//     "NEXT_PUBLIC_AUTH_URL",
//     "NEXT_PUBLIC_AUTH_PATH",
//     "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
//     "NEXT_PUBLIC_APP_URL",
//     "NEXT_PUBLIC_STATIC_URL",
//     "NEXT_PUBLIC_NODE_ENV",
//     "VERCEL_PROJECT_ID",
//     "VERCEL_PROJECT_NAME",
//     "TURBO_TOKEN",
//     "TURBO_TEAM",
//     "SECURITY_TRUSTED_ORIGINS",
//     "BETTER_AUTH_SECRET"
//   );
// }
//
// namespace EnvGroup {
//   export const {
//     Schema,
//     Enum,
//     Options,
//     toTagged,
//   } = BS.stringLiteralKit(
//     "APP",
//     "OTLP",
//     "EMAIL",
//     "AI",
//     "MARKETING",
//     "DB",
//     "KV",
//     "CLOUD",
//     "OAUTH",
//     "NEXT_PUBLIC",
//     "VERCEL",
//     "TURBO",
//     "SECURITY",
//     "BETTER_AUTH"
//   );
// }
//
// namespace AppEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "APP_NAME",
//     "APP_ENV",
//     "APP_DOMAIN",
//     "APP_ADMIN_EMAILS",
//     "APP_ADMIN_USER_IDS",
//     "APP_LOG_FORMAT",
//     "APP_LOG_LEVEL",
//     "APP_MCP_URL",
//     "APP_API_URL",
//     "APP_AUTH_PATH",
//     "APP_AUTH_URL",
//     "APP_CLIENT_URL",
//   );
// }
//
// namespace OtlpEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "OTLP_HOST",
//     "OTLP_TRACE_EXPORTER_URL",
//     "OTLP_LOG_EXPORTER_URL",
//   );
// }
//
// namespace EmailEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "EMAIL_FROM",
//     "EMAIL_TEST",
//     "EMAIL_RESEND_API_KEY",
//   );
// }
//
// namespace AIEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "AI_ANTHROPIC_API_KEY",
//     "AI_OPENAI_API_KEY",
//     "AI_ELEVENLABS_API_KEY",
//     "AI_ELEVENLABS_AGENT_ID",
//     "AI_KITS_API_KEY",
//   );
// }
//
//
// namespace MarketingEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "MARKETING_DUB_TOKEN",
//   );
// }
//
//
// namespace DbEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "DB_PG_HOST",
//     "DB_PG_PORT",
//     "DB_PG_USER",
//     "DB_PG_PASSWORD",
//     "DB_PG_DATABASE",
//     "DB_PG_URL",
//     "DB_PG_SSL",
//     "DB_PG_DEBUG",
//   );
// }
//
// namespace KVEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "KV_REDIS_HOST",
//     "KV_REDIS_PORT",
//     "KV_REDIS_PASSWORD",
//     "KV_REDIS_URL",
//   );
// }
//
// namespace CloudEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "CLOUD_AWS_REGION",
//     "CLOUD_AWS_ACCESS_KEY_ID",
//     "CLOUD_AWS_SECRET_ACCESS_KEY",
//     "CLOUD_AWS_S3_BUCKET_NAME",
//     "CLOUD_GOOGLE_CAPTCHA_SECRET_KEY",
//     "CLOUD_GOOGLE_CAPTCHA_SITE_KEY",
//   );
// }
//
// namespace OAuthEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "OAUTH_PROVIDER_MICROSOFT_TENANT_ID",
//     "OAUTH_PROVIDER_MICROSOFT_CLIENT_ID",
//     "OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET",
//     "OAUTH_PROVIDER_GOOGLE_CLIENT_ID",
//     "OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET",
//     "OAUTH_PROVIDER_DISCORD_CLIENT_ID",
//     "OAUTH_PROVIDER_DISCORD_CLIENT_SECRET",
//     "OAUTH_PROVIDER_GITHUB_CLIENT_ID",
//     "OAUTH_PROVIDER_GITHUB_CLIENT_SECRET",
//     "OAUTH_PROVIDER_LINKEDIN_CLIENT_ID",
//     "OAUTH_PROVIDER_LINKEDIN_CLIENT_SECRET",
//     "OAUTH_PROVIDER_TWITTER_CLIENT_ID",
//     "OAUTH_PROVIDER_TWITTER_CLIENT_SECRET",
//     "OAUTH_PROVIDER_FACEBOOK_CLIENT_ID",
//     "OAUTH_PROVIDER_FACEBOOK_CLIENT_SECRET",
//     "OAUTH_PROVIDER_NAMES",
//   );
// }
//
// namespace NextPublicEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "NEXT_PUBLIC_ENV",
//     "NEXT_PUBLIC_APP_NAME",
//     "NEXT_PUBLIC_APP_DOMAIN",
//     "NEXT_PUBLIC_AUTH_PROVIDER_NAMES",
//     "NEXT_PUBLIC_API_URL",
//     "NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL",
//     "NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL",
//     "NEXT_PUBLIC_LOG_LEVEL",
//     "NEXT_PUBLIC_LOG_FORMAT",
//     "NEXT_PUBLIC_CAPTCHA_SITE_KEY",
//     "NEXT_PUBLIC_AUTH_URL",
//     "NEXT_PUBLIC_AUTH_PATH",
//     "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
//     "NEXT_PUBLIC_APP_URL",
//     "NEXT_PUBLIC_STATIC_URL",
//     "NEXT_PUBLIC_NODE_ENV",
//   );
// }
//
// namespace VercelEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "VERCEL_PROJECT_ID",
//     "VERCEL_PROJECT_NAME",
//   );
// }
//
// namespace TurboEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "TURBO_TOKEN",
//     "TURBO_TEAM",
//   );
// }
//
// namespace SecurityEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "TURBO_TOKEN",
//     "TURBO_TEAM",
//   );
// }
//
// namespace BetterAuthEnvKey {
//   export const {
//     Enum,
//     Options,
//     toTagged
//   } = EnvKey.derive(
//     "BETTER_AUTH_SECRET"
//   );
// }
//
// const program = Effect.gen(function* () {
//
// });
//
// const layer = Layer.empty.pipe(
//   Layer.provide(
//     [
//       BunContext.layer,
//       FsUtils.FsUtilsLive
//     ]
//   )
// );
//
// BunRuntime.runMain(
//   program.pipe(
//     Effect.provide(layer),
//     Effect.catchAll((error) => Effect.gen(function* () {
//       const message = String(error);
//       yield* Console.log(`\nGENERATE ENV FAILURE :: ${message}`);
//       const cause = Cause.fail(error);
//       yield* Console.log(`\nTRACE :: ${Cause.pretty(cause)}`);
//       return yield* Effect.fail(error);
//     }))
//   )
// );
