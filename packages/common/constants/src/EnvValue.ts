import { BS } from "@beep/schema";
export const EnvValueKit = BS.stringLiteralKit("dev", "staging", "prod");

export class EnvValue extends EnvValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/constants/EnvValue"),
  identifier: "EnvValue",
  title: "Env Value",
  description: "Env value",
}) {
  static readonly Options = EnvValueKit.Options;
  static readonly Enum = EnvValueKit.Enum;
}

export declare namespace EnvValue {
  export type Type = typeof EnvValue.Type;
  export type Encoded = typeof EnvValue.Encoded;
}
