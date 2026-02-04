import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/integrations/table-names");

export class TableName extends BS.StringLiteralKit(Ids.IntegrationTokenId.tableName).annotations(
  $I.annotations("IntegrationsTableName", {
    description: "A sql table name for an entity within the integrations domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
