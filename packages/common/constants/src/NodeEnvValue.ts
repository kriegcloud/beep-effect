import { BS } from "@beep/schema";

const NodeEnvValueKit = BS.stringLiteralKit("test", "development", "production");

export class NodeEnvValue extends NodeEnvValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/constants/NodeEnvValue"),
  identifier: "NodeEnvValue",
  title: "Node Env Value",
  description: "Node Env Value. Can be `test`, `development` or `production`",
}) {}

export declare namespace NodeEnvValue {
  export type Type = typeof NodeEnvValue.Type;
  export type Encoded = typeof NodeEnvValue.Encoded;
}
