import "server-only";
import { Email } from "@beep/schema/custom";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import {
  AuthProviderNameValue,
  ConfigArrayURL,
  EnvValue,
  LogFormat,
  SubscriptionPlanValue,
} from "./common";
export const ServerConfig = Config.all({
  app: Config.nested("APP")(
    Config.all({
      name: Config.string("NAME"),
      env: S.Config("ENV", EnvValue.Schema).pipe(
        Config.withDefault(EnvValue.Enum.dev),
      ),
      domain: Config.string("DOMAIN").pipe(Config.withDefault("localhost")),
      adminUserIds: Config.array(S.Config("ADMIN_USER_IDS", S.UUID)),
      assetsDomain: Config.nonEmptyString("ASSETS_DOMAIN"),
      staticDomain: Config.nonEmptyString("STATIC_DOMAIN"),
      logFormat: S.Config("LOG_FORMAT", LogFormat.Schema).pipe(
        Config.withDefault(LogFormat.Enum.pretty),
      ),
      logLevel: Config.logLevel("LOG_LEVEL").pipe(Config.withDefault("None")),
      mcpUrl: Config.url("MCP_URL"),
      authUrl: Config.url("AUTH_URL"),
      apiUrl: Config.url("API_URL"),
      clientUrl: Config.url("CLIENT_URL"),
    }),
  ),
  auth: Config.all({
    secret: Config.redacted(Config.nonEmptyString("BETTER_AUTH_SECRET")),
  }),
  cloud: Config.nested("CLOUD")(
    Config.all({
      aws: Config.nested("AWS")(
        Config.all({
          region: Config.nonEmptyString("REGION"),
          accessKeyId: Config.redacted(Config.nonEmptyString("ACCESS_KEY_ID")),
          secretAccessKey: Config.redacted(
            Config.nonEmptyString("SECRET_ACCESS_KEY"),
          ),
          s3: Config.nested("S3")(
            Config.all({
              bucketName: Config.nonEmptyString("BUCKET_NAME"),
            }),
          ),
        }),
      ),
      google: Config.nested("GOOGLE")(
        Config.all({
          captcha: Config.nested("CAPTCHA")(
            Config.all({
              siteKey: Config.redacted(Config.nonEmptyString("SITE_KEY")),
              secretKey: Config.redacted(Config.nonEmptyString("SECRET_KEY")),
            }),
          ),
        }),
      ),
    }),
  ),
  db: Config.nested("DB")(
    Config.all({
      pg: Config.nested("PG")(
        Config.all({
          url: Config.redacted(Config.nonEmptyString("URL")),
          ssl: Config.boolean("SSL").pipe(Config.withDefault(false)),
        }),
      ),
    }),
  ),
  email: Config.nested("EMAIL")(
    Config.all({
      from: S.Config("FROM", Email),
      test: S.Config("FROM", Email),
      resend: Config.nested("RESEND")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")),
        }),
      ),
    }),
  ),
  kv: Config.nested("KV")(
    Config.all({
      redis: Config.nested("REDIS")(
        Config.all({
          url: Config.nonEmptyString("URL"),
          port: Config.port("PORT").pipe(Config.withDefault(6379)),
          password: Config.redacted(Config.nonEmptyString("PASSWORD")),
        }),
      ),
    }),
  ),
  marketing: Config.nested("MARKETING")(
    Config.all({
      dub: Config.nested("DUB")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")),
        }),
      ),
    }),
  ),
  oauth: Config.nested("OAUTH")(
    Config.all({
      authProviderNames: Config.array(
        S.Config("PROVIDER_NAMES", AuthProviderNameValue.Schema),
      ),
      provider: Config.nested("PROVIDER")(
        Config.all({
          microsoft: Config.nested("MICROSOFT")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")),
              clientSecret: Config.redacted(
                Config.nonEmptyString("CLIENT_SECRET"),
              ),
              tenantId: Config.redacted(Config.nonEmptyString("TENANT_ID")),
            }),
          ),
          google: Config.nested("GOOGLE")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")),
              clientSecret: Config.redacted(
                Config.nonEmptyString("CLIENT_SECRET"),
              ),
            }),
          ),
          discord: Config.nested("DISCORD")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")),
              clientSecret: Config.redacted(
                Config.nonEmptyString("CLIENT_SECRET"),
              ),
            }),
          ),
          github: Config.nested("GITHUB")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")),
              clientSecret: Config.redacted(
                Config.nonEmptyString("CLIENT_SECRET"),
              ),
            }),
          ),
          linkedin: Config.nested("LINKEDIN")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")),
              clientSecret: Config.redacted(
                Config.nonEmptyString("CLIENT_SECRET"),
              ),
            }),
          ),
          twitter: Config.nested("TWITTER")(
            Config.all({
              clientId: Config.redacted(Config.nonEmptyString("CLIENT_ID")),
              clientSecret: Config.redacted(
                Config.nonEmptyString("CLIENT_SECRET"),
              ),
            }),
          ),
          // facebook: Config.nested("FACEBOOK")(Config.all({
          //   clientId: Config.redacted(Config.string("CLIENT_ID")),
          //   clientSecret: Config.redacted(Config.string("CLIENT_SECRET")),
          // })),
        }),
      ),
    }),
  ),
  otlp: Config.nested("OTLP")(
    Config.all({
      traceExporterUrl: Config.url("TRACE_EXPORTER_URL"),
    }),
  ),
  payment: Config.nested("PAYMENT")(
    Config.all({
      subscriptionsEnabled: Config.boolean("SUBSCRIPTIONS_ENABLED").pipe(
        Config.withDefault(false),
      ),
      successUrl: Config.url("SUCCESS_URL"),
      stripe: Config.nested("STRIPE")(
        Config.all({
          key: Config.redacted(Config.nonEmptyString("KEY")),
          webhookSecret: Config.redacted(
            Config.nonEmptyString("WEBHOOK_SECRET"),
          ),
        }),
      ),
      plan: Config.nested("PLAN")(
        Config.all({
          names: Config.array(
            Config.hashSet(S.Config("NAMES", SubscriptionPlanValue.Schema)),
          ),
          basic: Config.nested("BASIC")(
            Config.all({
              name: Config.nonEmptyString("NAME"),
              priceId: Config.nonEmptyString("PRICE_ID"),
              annualDiscountPriceId: Config.nonEmptyString(
                "ANNUAL_DISCOUNT_PRICE_ID",
              ),
              freeTrialDays: Config.integer("FREE_TRIAL_DAYS"),
            }),
          ),
          pro: Config.nested("PRO")(
            Config.all({
              name: Config.nonEmptyString("NAME"),
              priceId: Config.nonEmptyString("PRICE_ID"),
              annualDiscountPriceId: Config.nonEmptyString(
                "ANNUAL_DISCOUNT_PRICE_ID",
              ),
              freeTrialDays: Config.integer("FREE_TRIAL_DAYS"),
            }),
          ),
          enterprise: Config.nested("ENTERPRISE")(
            Config.all({
              name: Config.nonEmptyString("NAME"),
              priceId: Config.nonEmptyString("PRICE_ID"),
              annualDiscountPriceId: Config.nonEmptyString(
                "ANNUAL_DISCOUNT_PRICE_ID",
              ),
              freeTrialDays: Config.integer("FREE_TRIAL_DAYS"),
            }),
          ),
        }),
      ),
    }),
  ),
  security: Config.nested("SECURITY")(
    Config.all({
      trustedOrigins: ConfigArrayURL("TRUSTED_ORIGINS"),
    }),
  ),
  ai: Config.nested("AI")(
    Config.all({
      openai: Config.nested("OPENAI")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")),
        }),
      ),
      anthropic: Config.nested("ANTHROPIC")(
        Config.all({
          apiKey: Config.redacted(Config.nonEmptyString("API_KEY")),
        }),
      ),
    }),
  ),
});

const provider = ConfigProvider.fromEnv().pipe(ConfigProvider.constantCase);
const loadConfig = provider.load(ServerConfig);

export const serverEnv = Effect.runSync(loadConfig);
