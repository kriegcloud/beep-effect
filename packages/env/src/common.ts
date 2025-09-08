import { stringLiteralKit } from "@beep/schema/kits";
import * as Config from "effect/Config";
import * as F from "effect/Function";
import type * as S from "effect/Schema";

export const EnvValueKit = stringLiteralKit("dev", "staging", "prod");

export class EnvValue extends EnvValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/EnvValue"),
  identifier: "EnvValue",
  title: "Env Value",
  description: "Env value",
}) {
  static readonly Options = EnvValueKit.Options;
  static readonly Enum = EnvValueKit.Enum;
}

export namespace EnvValue {
  export type Type = S.Schema.Type<typeof EnvValue>;
  export type Encoded = S.Schema.Type<typeof EnvValue>;
}

export const AuthProviderNameValueKit = stringLiteralKit(
  "github",
  "google",
  "linkedin",
  "twitter",
  "discord"
  // "facebook",
  // "microsoft",
);

export class AuthProviderNameValue extends AuthProviderNameValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/AuthProviderNameValue"),
  identifier: "AuthProviderNameValue",
  title: "Auth Provider Name Value",
  description: "Auth provider name value.",
}) {}

export namespace AuthProviderNameValue {
  export type Type = S.Schema.Type<typeof AuthProviderNameValue>;
  export type Encoded = S.Schema.Type<typeof AuthProviderNameValue>;
}

export const LogLevelKit = stringLiteralKit("All", "Debug", "Error", "Fatal", "Info", "Trace", "None", "Warning");

export class LogLevel extends LogLevelKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/LogLevel"),
  identifier: "LogLevel",
  title: "Log Level",
  description: "Log level.",
}) {
  static readonly Options = LogLevelKit.Options;
  static readonly Enum = LogLevelKit.Enum;
}

export namespace LogLevel {
  export type Type = S.Schema.Type<typeof LogLevel>;
  export type Encoded = S.Schema.Type<typeof LogLevel>;
}

export const LogFormatKit = stringLiteralKit("pretty", "json", "logFmt", "structured");

export class LogFormat extends LogFormatKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/LogFormat"),
  identifier: "LogFormat",
  title: "Log Format",
  description: "Log format.",
}) {
  static readonly Options = LogFormatKit.Options;
  static readonly Enum = LogFormatKit.Enum;
}

export namespace LogFormat {
  export type Type = S.Schema.Type<typeof LogFormat>;
  export type Encoded = S.Schema.Type<typeof LogFormat>;
}

export const SubscriptionPlanValueKit = stringLiteralKit("basic", "pro", "enterprise");

export class SubscriptionPlanValue extends SubscriptionPlanValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/SubscriptionPlanValue"),
  identifier: "SubscriptionPlanValue",
  title: "Subscription Plan Value",
  description: "Possible subscription plan values.",
}) {}

export namespace SubscriptionPlanValue {
  export type Type = S.Schema.Type<typeof SubscriptionPlanValue>;
  export type Encoded = S.Schema.Type<typeof SubscriptionPlanValue>;
}

export const ConfigURL = F.flow(
  <TName extends string>(name: TName) => name,
  Config.url,
  Config.map((url) => url.toString())
);

export const ConfigArrayURL = F.flow(<TName extends string>(name: TName) =>
  Config.array(Config.hashSet(Config.url()), name).pipe(Config.map((urls) => urls.map((url) => url.toString())))
);
