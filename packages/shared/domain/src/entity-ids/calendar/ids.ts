/**
 * Calendar entity IDs
 *
 * Defines branded entity identifiers for the calendar slice.
 *
 * @module calendar/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const make = EntityId.builder("calendar");
const $I = $SharedDomainId.create("entity-ids/calendar/ids");

/**
 * Placeholder entity ID.
 *
 * Replace or rename with your actual entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export const PlaceholderId = make("placeholder", {
  brand: "PlaceholderId",
}).annotations(
  $I.annotations("PlaceholderId", {
    description: "A unique identifier for a Placeholder entity",
  })
);

export declare namespace PlaceholderId {
  export type Type = S.Schema.Type<typeof PlaceholderId>;
  export type Encoded = S.Schema.Encoded<typeof PlaceholderId>;

  export namespace RowId {
    export type Type = typeof PlaceholderId.privateSchema.Type;
    export type Encoded = typeof PlaceholderId.privateSchema.Encoded;
  }
}
