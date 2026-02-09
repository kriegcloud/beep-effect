import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $DocumentsDomainId.create("value-objects/PageType.value");

export class PageType extends BS.StringLiteralKit("document", "dashboard", "client-database", "workspace", "template").annotations($I.annotations("PageType", {
  description: "Discriminates page behavior: document (rich text), dashboard (FlexLayout panels), client-database (client data hub with extraction), workspace (team collaboration), template (reusable structure)",
})) {}

export declare namespace PageType {
  export type Type = typeof PageType.Type;
  export type Encoded = typeof PageType.Encoded;
}
