import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeDomainId.create("entities/PropertyDefinition");

export class PropertyRangeType extends BS.StringLiteralKit("object", "datatype").annotations(
  $I.annotations("PropertyRangeType", {
    description: "Whether property links entities (object) or has literal values (datatype)",
  })
) {}

export declare namespace PropertyRangeType {
  export type Type = typeof PropertyRangeType.Type;
}
