import { AuthProviderNameValue, EnvValue, LogFormat } from "@beep/constants";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import * as LogLevel from "effect/LogLevel";
import * as Match from "effect/Match";
=======
import * as F from "effect/Function";
import * as LogLevel from "effect/LogLevel";
import * as Match from "effect/Match";
import * as O from "effect/Option";
>>>>>>> auth-type-perf
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ConfigArrayURL } from "./common";

const PLACEHOLDER_VALUE = "PLACE_HOLDER";

const withPlaceholderRedacted = <A>(config: Config.Config<A>) =>
  config.pipe(Config.withDefault(Redacted.make(PLACEHOLDER_VALUE)));

export const isPlaceholder = <A>(configValue: A) =>
  Redacted.isRedacted(configValue)
    ? Redacted.value(configValue) === PLACEHOLDER_VALUE
    : configValue === PLACEHOLDER_VALUE;

<<<<<<< HEAD
export const ServerConfig = Config.all({
  nodeEnv: Config.literal("development", "production", "test")("NODE_ENV"),

  app: Config.nested("APP")(
=======
const AppConfig = Config.zipWith(
  Config.nested("APP")(
>>>>>>> auth-type-perf
    Config.all({
      protocol: S.Config("ENV", EnvValue).pipe(
        Config.map((env) =>
          Match.value(env).pipe(
            Match.when("dev", () => "http"),
            Match.when("staging", () => "https"),
            Match.when("prod", () => "https"),
            Match.exhaustive
          )
        )
      ),
      name: Config.string("NAME"),
      env: S.Config("ENV", EnvValue).pipe(Config.withDefault(EnvValue.Enum.dev)),
      rootDomain: Config.string("DOMAIN").pipe(Config.map((domain) => Str.split(":")(domain)[0])),
      domain: Config.string("DOMAIN").pipe(Config.withDefault("localhost")),
      adminUserIds: Config.array(S.Config("ADMIN_USER_IDS", SharedEntityIds.UserId)),
      logFormat: S.Config("LOG_FORMAT", LogFormat).pipe(Config.withDefault(LogFormat.Enum.pretty)),
      logLevel: Config.logLevel("LOG_LEVEL").pipe(Config.withDefault(LogLevel.None)),
      mcpUrl: Config.url("MCP_URL"),
      authUrl: Config.url("AUTH_URL"),
      apiUrl: Config.url("API_URL"),
      clientUrl: Config.url("CLIENT_URL"),
    })
  ),
<<<<<<< HEAD
=======
  Config.nested("VERCEL")(
    Config.all({
      projectProductionUrl: Config.option(S.Config("PROJECT_PRODUCTION_URL", BS.DomainName)),
      vercelEnv: Config.option(Config.literal("production", "preview", "development", "staging")("ENV")),
      vercelUrl: Config.option(S.Config("URL", BS.DomainName)),
    })
  ),
  (appConfig, vercelConfig) => {
    const clientUrl = BS.URLString.make(`https://${appConfig.clientUrl}`);
    const projectProductionUrl = F.pipe(
      vercelConfig.projectProductionUrl,
      O.match({
        onNone: () => clientUrl,
        onSome: (prodUrl) => BS.URLString.make(`https://${prodUrl}`),
      })
    );
    const baseUrl = O.all([vercelConfig.vercelUrl, vercelConfig.vercelEnv]).pipe(
      O.match({
        onNone: () => BS.URLString.make(`http://${appConfig.clientUrl}`),
        onSome: ([vercelUrl, vEnv]) =>
          vEnv === "production"
            ? projectProductionUrl
            : vEnv === "preview"
              ? BS.URLString.make(`https://${vercelUrl}`)
              : clientUrl,
      })
    );
    return {
      ...appConfig,
      baseUrl,
      projectProductionUrl,
      vercelEnv: F.pipe(
        vercelConfig.vercelEnv,
        O.match({
          onNone: () => "development",
          onSome: (v) => v,
        })
      ),
    };
  }
);

export const ServerConfig = Config.all({
  nodeEnv: Config.literal("development", "production", "test")("NODE_ENV"),
  baseUrl: Config.nested("VERCEL")(
    Config.all({
      url: Config.option(S.Config("URL", BS.DomainName)),
      env: Config.option(Config.literal("production", "preview", "development", "staging")("ENV")),
      projectProductionUrl: Config.option(S.Config("PROJECT_PRODUCTION_URL", BS.DomainName)),
    })
  ).pipe(
    Config.map(({ env, url, projectProductionUrl }) => {
      const baseUrl =
        O.isSome(env) && env.value === "production" && O.isSome(projectProductionUrl)
          ? BS.URLString.make(`https://${projectProductionUrl.value}`)
          : O.isSome(url)
            ? BS.URLString.make(`https://${url}`)
            : BS.URLString.make(`http://localhost:3000`);
      return baseUrl.toString();
    })
  ),
  productionUrl: Config.option(S.Config("VERCEL_PROJECT_PRODUCTION_URL", BS.DomainName)),
  app: AppConfig,
>>>>>>> auth-type-perf
  auth: Config.all({
    secret: Config.redacted(Config.nonEmptyString("BETTER_AUTH_SECRET")),
  }),
  cloud: Config.nested("CLOUD")(
    Config.all({
      aws: Config.nested("AWS")(
        Config.all({
          region: Config.nonEmptyString("REGION").pipe(Config.withDefault("us-east-1")),
          accessKeyId: Config.redacted(Config.nonEmptyString("ACCESS_KEY_ID")).pipe(withPlaceholderRedacted),
          secretAccessKey: Config.redacted(Config.nonEmptyString("SECRET_ACCESS_KEY")).pipe(withPlaceholderRedacted),
          s3: Config.nested("S3")(
            Config.all({
              bucketName: Config.nonEmptyString("BUCKET_NAME"),
            })
          ),
        })
      ),
      google: Config.nested("GOOGLE")(
        Config.all({
          captcha: Config.nested("CAPTCHA")(
            Config.all({
              siteKey: Config.redacted(Config.nonEmptyString("SITE_KEY")).pipe(withPlaceholderRedacted),
              secretKey: Config.redacted(Config.nonEmptyString("SECRET_KEY")).pipe(withPlaceholderRedacted),
            })
          ),
        })
      ),
    })
  ),
  db: Config.nested("DB")(
    Config.all({
      pg: Config.nested("PG")(
        Config.all({
          url: Config.redacted(Config.nonEmptyString("URL")),
          ssl: Config.boolean("SSL").pipe(Config.withDefault(false)),
          port: Config.port("PORT").pipe(Config.withDefault(5432)),
          user: Config.nonEmptyString("USER").pipe(Config.withDefault("postgres")),
          password: Config.redacted(Config.nonEmptyString("PASSWORD")),
          host: Config.nonEmptyString("HOST").pipe(Config.withDefault("localhost")),
          database: Config.nonEmptyString("DATABASE").pipe(Config.withDefault("postgres")),
        })
      ),
    })
  ),
  payment: Config.nested("PAYMENT")(
    Config.all({
      stripe: Config.nested("STRIPE")(
        Config.all({
          key: Config.redacted(Config.nonEmptyString("KEY")).pipe(withPlaceholderRedacted),
          webhookSecret: Config.redacted(Config.nonEmptyString("WEBHOOK_SECRET")).pipe(withPlaceholderRedacted),
        })
      ),
    })
  ),
  email: Config.nested("EMAIL")(
    Config.all({
      from: Config.succeed(BS.Email.make("beep@codedank.com")),
      test: Config.succeed(BS.Email.make("beep@codank.com")),
      resend: Config.nested("RESEND")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")).pipe(withPlaceholderRedacted),
        })
      ),
    })
  ),
  kv: Config.nested("KV")(
    Config.all({
      redis: Config.nested("REDIS")(
        Config.all({
          url: Config.nonEmptyString("URL"),
          port: Config.port("PORT").pipe(Config.withDefault(6379)),
          password: Config.redacted(Config.nonEmptyString("PASSWORD")),
        })
      ),
    })
  ),
  marketing: Config.nested("MARKETING")(
    Config.all({
      dub: Config.nested("DUB")(
        Config.all({
          token: Config.redacted(Config.nonEmptyString("TOKEN")).pipe(withPlaceholderRedacted),
        })
      ),
    })
  ),
  oauth: Config.nested("OAUTH")(
    Config.all({
      authProviderNames: Config.array(S.Config("PROVIDER_NAMES", AuthProviderNameValue)),
      provider: Config.nested("PROVIDER")(
        Config.all({
          microsoft: Config.nested("MICROSOFT")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")).pipe(Config.option),
              clientSecret: Config.redacted(Config.nonEmptyString("CLIENT_SECRET")).pipe(Config.option),
              tenantId: Config.redacted(Config.nonEmptyString("TENANT_ID")).pipe(Config.option),
            })
          ),
          google: Config.nested("GOOGLE")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")).pipe(Config.option),
              clientSecret: Config.redacted(Config.nonEmptyString("CLIENT_SECRET")).pipe(Config.option),
            })
          ),
          discord: Config.nested("DISCORD")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")).pipe(Config.option),
              clientSecret: Config.redacted(Config.nonEmptyString("CLIENT_SECRET")).pipe(Config.option),
            })
          ),
          github: Config.nested("GITHUB")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")).pipe(Config.option),
              clientSecret: Config.redacted(Config.nonEmptyString("CLIENT_SECRET")).pipe(Config.option),
            })
          ),
          linkedin: Config.nested("LINKEDIN")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")).pipe(Config.option),
              clientSecret: Config.redacted(Config.nonEmptyString("CLIENT_SECRET")).pipe(Config.option),
            })
          ),
          twitter: Config.nested("TWITTER")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")).pipe(Config.option),
              clientSecret: Config.redacted(Config.nonEmptyString("CLIENT_SECRET")).pipe(Config.option),
            })
          ),
        })
      ),
    })
  ),
  otlp: Config.nested("OTLP")(
    Config.all({
      traceExporterUrl: Config.url("TRACE_EXPORTER_URL"),
      logExporterUrl: Config.url("LOG_EXPORTER_URL"),
    })
  ),
  security: Config.nested("SECURITY")(
    Config.all({
      trustedOrigins: ConfigArrayURL("TRUSTED_ORIGINS"),
    })
  ),
  ai: Config.nested("AI")(
    Config.all({
      openai: Config.nested("OPENAI")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")).pipe(withPlaceholderRedacted),
        })
      ),
      anthropic: Config.nested("ANTHROPIC")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")).pipe(withPlaceholderRedacted),
        })
      ),
    })
  ),
});

const provider = ConfigProvider.fromEnv().pipe(ConfigProvider.constantCase);
const loadConfig = provider.load(ServerConfig);

export const serverEnv = Effect.runSync(loadConfig);
