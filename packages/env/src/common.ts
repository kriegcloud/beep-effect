import { stringLiteralKit } from "@beep/schema/kits";
import * as Config from "effect/Config";
import * as F from "effect/Function";
export namespace EnvValue {
  export const { Options, Schema, Enum, Mock, JSONSchema, Equivalence } = stringLiteralKit("dev", "staging", "prod");
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
  );
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
  );
}

export namespace LogFormat {
  export const { Options, Schema, Enum, Mock, JSONSchema, Pretty, Equivalence } = stringLiteralKit(
    "pretty",
    "json",
    "logFmt",
    "structured"
  );
}

export namespace SubscriptionPlanValue {
  export const { Options, Schema, Enum, Mock, JSONSchema, Pretty, Equivalence } = stringLiteralKit(
    "basic",
    "pro",
    "enterprise"
  );
}

export const ConfigURL = F.flow(
  <TName extends string>(name: TName) => name,
  Config.url,
  Config.map((url) => url.toString())
);

export const ConfigArrayURL = F.flow(<TName extends string>(name: TName) =>
  Config.array(Config.hashSet(Config.url()), name).pipe(Config.map((urls) => urls.map((url) => url.toString())))
);
