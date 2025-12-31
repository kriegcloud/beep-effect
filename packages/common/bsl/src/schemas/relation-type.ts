import { $BslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $BslId.create("schemas/relation-type");
export class RelationType extends BS.StringLiteralKit("one", "many", "manyToMany").annotations(
  $I.annotations("RelationType", {
    description: "Relation cardinality discriminant.",
  })
) {}

export declare namespace RelationType {
  export type Type = typeof RelationType.Type;

  export type Enum = typeof RelationType.Enum;
}
