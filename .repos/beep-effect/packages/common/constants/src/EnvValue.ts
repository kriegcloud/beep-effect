import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $ConstantsId.create("EnvValue");
export class EnvValue extends BS.StringLiteralKit("dev", "staging", "prod").annotations(
  $I.annotations("EnvValue", {
    description: "Env value",
  })
) {}

export declare namespace EnvValue {
  export type Type = typeof EnvValue.Type;
  export type Encoded = typeof EnvValue.Encoded;
}
