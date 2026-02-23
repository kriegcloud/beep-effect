import { BS } from "@beep/schema";

export class EnvValue extends BS.StringLiteralKit("dev", "staging", "prod").annotations({
  schemaId: Symbol.for("@beep/constants/EnvValue"),
  identifier: "EnvValue",
  title: "Env Value",
  description: "Env value",
}) {}

export declare namespace EnvValue {
  export type Type = typeof EnvValue.Type;
  export type Encoded = typeof EnvValue.Encoded;
}
