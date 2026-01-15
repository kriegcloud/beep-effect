import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Calendar from "./calendar";
import * as Comms from "./comms";
import * as Customization from "./customization";
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Shared from "./shared";

const $I = $SharedDomainId.create("entity-ids/any-id");

export class AnyEntityId extends S.Union(
  Shared.AnyId,
  Iam.AnyId,
  Documents.AnyId,
  Customization.AnyId,
  Comms.AnyId,
  Calendar.AnyId
).annotations(
  $I.annotations("AnyEntityId", {
    description: "An entity id for any entity accross all domain contexts.",
  })
) {}

export declare namespace AnyEntityId {
  export type Type = S.Schema.Type<typeof AnyEntityId>;
  export type Encoded = S.Schema.Encoded<typeof AnyEntityId>;
}
