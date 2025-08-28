import { stringLiteralKit } from "@beep/schema/kits";
import * as Config from "effect/Config";
import * as F from "effect/Function";
export namespace EnvValue {
  export const { Options, Schema, Enum, Mock, JSONSchema, Pretty, Equivalence } = stringLiteralKit(
    "dev",
    "staging",
    "prod"
  )({
    identifier: "EnvValue",
    title: "Env Value",
    description: "An acceptable env values of the application.",
  });
  export type Type = typeof Schema.Type;
}

export namespace AuthProviderNameValue {
  export const {
    Options,
    Schema,
    Enum,

    Mock,
    JSONSchema,
    Pretty,
    Equivalence,
  } = stringLiteralKit(
    "github",
    "google",
    "linkedin",
    "twitter",
    "discord"
    // "facebook",
    // "microsoft",
  )({
    identifier: "AuthProviderNameValue",
    title: "Auth Providers Name Value",
    description: "The names of theauth providers of the application",
  });
}

export namespace LogLevel {
  export const { Options, Schema, Enum, Mock, JSONSchema, Pretty, Equivalence } = stringLiteralKit(
    "All",
    "Debug",
    "Error",
    "Fatal",
    "Info",
    "Trace",
    "None",
    "Warning"
  )({
    identifier: "LogLevel",
    title: "Log Level",
    description: "The log level of the application",
  });
}

export namespace LogFormat {
  export const { Options, Schema, Enum, Mock, JSONSchema, Pretty, Equivalence } = stringLiteralKit(
    "pretty",
    "json",
    "logFmt",
    "structured"
  )({
    identifier: "LogFormat",
    title: "Log Format",
    description: "The log format of the application",
  });
}

export namespace SubscriptionPlanValue {
  export const { Options, Schema, Enum, Mock, JSONSchema, Pretty, Equivalence } = stringLiteralKit(
    "basic",
    "pro",
    "enterprise"
  )({
    identifier: "SubscriptionPlanValue",
    title: "Subscription Plan Value",
    description: "The possible subscription plans of the application",
  });
}

export const ConfigURL = F.flow(
  <TName extends string>(name: TName) => name,
  Config.url,
  Config.map((url) => url.toString())
);

export const ConfigArrayURL = F.flow(<TName extends string>(name: TName) =>
  Config.array(Config.hashSet(Config.url()), name).pipe(Config.map((urls) => urls.map((url) => url.toString())))
);
