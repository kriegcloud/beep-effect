import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeDomainId.create("values/relation-direction.value");
export class RelationDirection extends BS.StringLiteralKit("outgoing", "incoming", "both").annotations(
  $I.annotations("RelationDirection", {
    description: "Direction of a relation",
  })
) {}

export declare namespace RelationDirection {
  export type Type = typeof RelationDirection.Type;
}
