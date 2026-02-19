import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $WorkspacesDomainId.create("values/TextStyle.value");

export class TextStyle extends BS.StringLiteralKit("default", "serif", "mono").annotations({
  ...$I.annotations("TextStyle", {
    title: "Text Style",
    description: "The text style for document content",
  }),
}) {}

export declare namespace TextStyle {
  export type Type = typeof TextStyle.Type;
  export type Encoded = typeof TextStyle.Encoded;
}
