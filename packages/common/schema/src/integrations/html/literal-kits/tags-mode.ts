import { $SchemaId } from "@beep/identity/packages";
import { StringLiteralKit } from "@beep/schema/derived";

const $I = $SchemaId.create("integrations/html/literal-kits/allowed-schemes");
export class TagsMode extends StringLiteralKit("escape", "recursiveEscape", "discard", "completelyDiscard").annotations(
  $I.annotations("TagsMode", {
    description: "Tags mode",
  })
) {}

export declare namespace TagsMode {
  export type Type = typeof TagsMode.Type;
  export type Encoded = typeof TagsMode.Encoded;
}
