/**
 * Comms any entity ID union
 *
 * @module comms/entity-ids/any-id
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/comms/any-id");

/**
 * Union of all comms entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export class AnyId extends S.Union(Ids.PlaceholderId).annotations(
  $I.annotations("AnyCommsId", {
    description: "Any entity id within the comms domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
