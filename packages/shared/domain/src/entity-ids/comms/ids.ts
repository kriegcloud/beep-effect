/**
 * Comms entity IDs
 *
 * Defines branded entity identifiers for the comms slice.
 *
 * @module comms/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/comms/ids");

const make = EntityId.builder("comms");

/**
 * Placeholder entity ID.
 *
 * Replace or rename with your actual entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export const EmailTemplateId = make("email_template", {
  brand: "EmailTemplateId",
}).annotations(
  $I.annotations("EmailTemplateId", {
    description: "A unique identifier for a EmailTemplate entity",
  })
);

export declare namespace EmailTemplateId {
  export type Type = S.Schema.Type<typeof EmailTemplateId>;
  export type Encoded = S.Schema.Encoded<typeof EmailTemplateId>;

  export namespace RowId {
    export type Type = typeof EmailTemplateId.privateSchema.Type;
    export type Encoded = typeof EmailTemplateId.privateSchema.Encoded;
  }
}
