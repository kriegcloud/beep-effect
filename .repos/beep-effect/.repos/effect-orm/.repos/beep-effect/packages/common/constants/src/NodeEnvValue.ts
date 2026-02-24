import { BS } from "@beep/schema";

export class NodeEnvValue extends BS.StringLiteralKit("test", "development", "production").annotations({
  schemaId: Symbol.for("@beep/constants/NodeEnvValue"),
  identifier: "NodeEnvValue",
  title: "Node Env Value",
  description: "Node Env Value. Can be `test`, `development` or `production`",
}) {}

export declare namespace NodeEnvValue {
  export type Type = typeof NodeEnvValue.Type;
  export type Encoded = typeof NodeEnvValue.Encoded;
}
