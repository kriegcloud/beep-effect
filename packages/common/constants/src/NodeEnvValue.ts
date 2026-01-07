import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $ConstantsId.create("NodeEnvValue");
export class NodeEnvValue extends BS.StringLiteralKit("test", "development", "production").annotations(
  $I.annotations("NodeEnvValue", {
    description: "Node Env Value. Can be `test`, `development` or `production`",
  })
) {}

export declare namespace NodeEnvValue {
  export type Type = typeof NodeEnvValue.Type;
  export type Encoded = typeof NodeEnvValue.Encoded;
}
