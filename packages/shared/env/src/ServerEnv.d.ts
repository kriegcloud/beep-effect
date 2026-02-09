import * as Config from "effect/Config";
import * as LogLevel from "effect/LogLevel";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
/**
 * Creates a Config for parsing comma-separated URLs from environment variables.
 *
 * @example
 * ```typescript
 * import { ConfigArrayURL } from "@beep/shared-env"
 * import * as Config from "effect/Config"
 *
 * const trustedOrigins = ConfigArrayURL("TRUSTED_ORIGINS")
 * // Parses "https://example.com,https://other.com" into string array
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export declare const ConfigArrayURL: <TName extends string>(name: TName) => Config.Config<string[]>;
/**
 * Checks if a config value is a placeholder (not yet configured).
 *
 * @example
 * ```typescript
 * import { isPlaceholder, serverEnv } from "@beep/shared-env"
 *
 * if (isPlaceholder(serverEnv.cloud.aws.accessKeyId)) {
 *   console.log("AWS credentials not configured")
 * }
 * ```
 *
 * @category predicates
 * @since 0.1.0
 */
export declare const isPlaceholder: <A>(configValue: A) => boolean;
/**
 * Comprehensive server configuration schema with all environment variables.
 *
 * Includes app settings, database, auth, cloud services, email, payments, and observability.
 *
 * @example
 * ```typescript
 * import { ServerConfig } from "@beep/shared-env"
 * import * as Config from "effect/Config"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* Config.Config(ServerConfig)
 *   console.log(config.app.name)
 *   console.log(config.db.pg.host)
 * })
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export declare const ServerConfig: Config.Config<{
  liveblocks: {
    secretKey: Redacted.Redacted<string>;
  };
  baseUrl: string;
  productionUrl: O.Option<string>;
  app: {
    baseUrl: URL | (string & import("node_modules/effect/dist/dts/Brand").Brand<"Url">);
    projectProductionUrl: URL | (string & import("node_modules/effect/dist/dts/Brand").Brand<"Url">);
    vercelEnv: string;
    protocol: string;
    name: string;
    env: "staging" | "dev" | "prod";
    rootDomain: string;
    domain: string;
    adminUserIds: any[];
    logFormat: "pretty" | "json" | "logFmt" | "structured";
    logLevel: LogLevel.LogLevel;
    mcpUrl: URL;
    authUrl: URL;
    apiUrl: URL;
    apiHost: string;
    apiPort: number;
    clientUrl: URL;
    api: {
      url: URL;
      port: number;
      host: string;
    };
  };
  auth: {
    secret: Redacted.Redacted<string>;
  };
  cloud: {
    aws: {
      region: string;
      accessKeyId: Redacted.Redacted<string>;
      secretAccessKey: Redacted.Redacted<string>;
      s3: {
        bucketName: string;
      };
    };
    google: {
      captcha: {
        siteKey: Redacted.Redacted<string>;
        secretKey: Redacted.Redacted<string>;
      };
    };
  };
  db: {
    pg: {
      url: Redacted.Redacted<string>;
      ssl: boolean;
      port: number;
      user: string;
      password: Redacted.Redacted<string>;
      host: string;
      database: string;
    };
  };
  payment: {
    stripe: {
      key: Redacted.Redacted<string>;
      webhookSecret: Redacted.Redacted<string>;
    };
  };
  email: {
    from: Redacted.Redacted<string & import("node_modules/effect/dist/dts/Brand").Brand<"Email">>;
    test: Redacted.Redacted<string & import("node_modules/effect/dist/dts/Brand").Brand<"Email">>;
    resend: {
      apiKey: Redacted.Redacted<string>;
    };
  };
  kv: {
    redis: {
      url: string;
      port: number;
      password: Redacted.Redacted<string>;
    };
  };
  alchemy: {
    password: Redacted.Redacted<string>;
  };
  marketing: {
    dub: {
      token: Redacted.Redacted<string>;
    };
  };
  upload: {
    secret: Redacted.Redacted<string>;
  };
  oauth: {
    authProviderNames: ("google" | "github" | "linkedin" | "twitter" | "discord")[];
    provider: {
      microsoft: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
        tenantId: O.Option<Redacted.Redacted<string>>;
      };
      google: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      discord: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      github: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      linkedin: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      twitter: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
    };
  };
  otlp: {
    traceExporterUrl: URL;
    logExporterUrl: URL;
    metricExporterUrl: URL;
  };
  security: {
    trustedOrigins: string[];
  };
  isVite: boolean;
  ai: {
    openai: {
      apiKey: Redacted.Redacted<string>;
    };
    anthropic: {
      apiKey: Redacted.Redacted<string>;
    };
  };
}>;
/**
 * Loaded server environment configuration, synchronously initialized from environment variables.
 *
 * @example
 * ```typescript
 * import { serverEnv } from "@beep/shared-env"
 *
 * console.log(serverEnv.app.name)
 * console.log(serverEnv.db.pg.host)
 * console.log(serverEnv.app.logLevel)
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export declare const serverEnv: {
  liveblocks: {
    secretKey: Redacted.Redacted<string>;
  };
  baseUrl: string;
  productionUrl: O.Option<string>;
  app: {
    baseUrl: URL | (string & import("node_modules/effect/dist/dts/Brand").Brand<"Url">);
    projectProductionUrl: URL | (string & import("node_modules/effect/dist/dts/Brand").Brand<"Url">);
    vercelEnv: string;
    protocol: string;
    name: string;
    env: "staging" | "dev" | "prod";
    rootDomain: string;
    domain: string;
    adminUserIds: any[];
    logFormat: "pretty" | "json" | "logFmt" | "structured";
    logLevel: LogLevel.LogLevel;
    mcpUrl: URL;
    authUrl: URL;
    apiUrl: URL;
    apiHost: string;
    apiPort: number;
    clientUrl: URL;
    api: {
      url: URL;
      port: number;
      host: string;
    };
  };
  auth: {
    secret: Redacted.Redacted<string>;
  };
  cloud: {
    aws: {
      region: string;
      accessKeyId: Redacted.Redacted<string>;
      secretAccessKey: Redacted.Redacted<string>;
      s3: {
        bucketName: string;
      };
    };
    google: {
      captcha: {
        siteKey: Redacted.Redacted<string>;
        secretKey: Redacted.Redacted<string>;
      };
    };
  };
  db: {
    pg: {
      url: Redacted.Redacted<string>;
      ssl: boolean;
      port: number;
      user: string;
      password: Redacted.Redacted<string>;
      host: string;
      database: string;
    };
  };
  payment: {
    stripe: {
      key: Redacted.Redacted<string>;
      webhookSecret: Redacted.Redacted<string>;
    };
  };
  email: {
    from: Redacted.Redacted<string & import("node_modules/effect/dist/dts/Brand").Brand<"Email">>;
    test: Redacted.Redacted<string & import("node_modules/effect/dist/dts/Brand").Brand<"Email">>;
    resend: {
      apiKey: Redacted.Redacted<string>;
    };
  };
  kv: {
    redis: {
      url: string;
      port: number;
      password: Redacted.Redacted<string>;
    };
  };
  alchemy: {
    password: Redacted.Redacted<string>;
  };
  marketing: {
    dub: {
      token: Redacted.Redacted<string>;
    };
  };
  upload: {
    secret: Redacted.Redacted<string>;
  };
  oauth: {
    authProviderNames: ("google" | "github" | "linkedin" | "twitter" | "discord")[];
    provider: {
      microsoft: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
        tenantId: O.Option<Redacted.Redacted<string>>;
      };
      google: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      discord: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      github: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      linkedin: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
      twitter: {
        clientId: O.Option<Redacted.Redacted<string>>;
        clientSecret: O.Option<Redacted.Redacted<string>>;
      };
    };
  };
  otlp: {
    traceExporterUrl: URL;
    logExporterUrl: URL;
    metricExporterUrl: URL;
  };
  security: {
    trustedOrigins: string[];
  };
  isVite: boolean;
  ai: {
    openai: {
      apiKey: Redacted.Redacted<string>;
    };
    anthropic: {
      apiKey: Redacted.Redacted<string>;
    };
  };
};
//# sourceMappingURL=ServerEnv.d.ts.map
