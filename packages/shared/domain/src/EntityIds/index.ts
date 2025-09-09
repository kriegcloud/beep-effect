export * from "./AnyEntityId";
export * as IamEntityIds from "./iam";
export * as IamTableNames from "./iam/table_names";
export * as SharedEntityIds from "./shared";

import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { FileIdKit, OrganizationIdKit, TeamIdKit } from "./shared";

export namespace SharedTableNames {
  export const SharedTableNameKit = BS.stringLiteralKit(
    FileIdKit.tableName,
    TeamIdKit.tableName,
    OrganizationIdKit.tableName
  );

  export class SharedTableName extends SharedTableNameKit.Schema.annotations({
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SharedTableName"),
    description: "The set of table_names for entityIds within the shared-kernel",
    identifier: "SharedTableName",
    title: "Shared Table Name",
  }) {
    static readonly Tagged = SharedTableNameKit.toTagged("tableName");
    static readonly Enum = SharedTableNameKit.Enum;
    static readonly Options = SharedTableNameKit.Options;
    static readonly is = SharedTableNameKit.is;
  }

  export namespace SharedTableName {
    export type Type = S.Schema.Type<typeof SharedTableName>;
    export type Encoded = S.Schema.Encoded<typeof SharedTableName>;
  }
}
