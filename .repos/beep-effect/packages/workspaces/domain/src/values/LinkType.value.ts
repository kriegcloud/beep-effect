import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $WorkspacesDomainId.create("values/LinkType.value");

export class LinkType extends BS.StringLiteralKit("explicit", "inline-reference", "block_embed").annotations({
  ...$I.annotations("LinkType", {
    title: "Link Type",
    description: "The type of Link",
  }),
}) {}

export declare namespace LinkType {
  export type Type = typeof LinkType.Type;
  export type Encoded = typeof LinkType.Encoded;
}
