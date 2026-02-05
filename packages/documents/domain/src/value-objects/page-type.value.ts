import { BS } from "@beep/schema";

export class PageType extends BS.StringLiteralKit("document", "dashboard", "client-database", "workspace", "template").annotations({
  schemaId: Symbol.for("@beep/documents-domain/value-objects/PageType"),
  identifier: "PageType",
  title: "Page Type",
  description:
    "Discriminates page behavior: document (rich text), dashboard (FlexLayout panels), client-database (client data hub with extraction), workspace (team collaboration), template (reusable structure)",
}) {}

export declare namespace PageType {
  export type Type = typeof PageType.Type;
  export type Encoded = typeof PageType.Encoded;
}
