import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Customization from "./customization";
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Shared from "./shared";

const $I = $SharedDomainId.create("entity-ids/entity-kind");

export class EntityKind extends BS.StringLiteralKit(
  ...Iam.TableName.Options,
  ...Shared.TableName.Options,
  ...Documents.TableName.Options,
  ...Customization.TableName.Options
).annotations(
  $I.annotations("EntityKind", {
    description:
      "An entity kind for any entity accross all domain contexts who's value is the table name of the entity.",
  })
) {}

export declare namespace EntityKind {
  export type Type = S.Schema.Type<typeof EntityKind>;
  export type Encoded = S.Schema.Encoded<typeof EntityKind>;
}
