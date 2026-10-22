/**
 * PartyId schema and runtime type.
 *
 * @packageDocumentation
 * @category entity-ids
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import * as EntityId from "../../entity/EntityId.ts";

const $I = $SharedDomainId.create("identity/Party");
const make = EntityId.factory("party", $I);

/**
 * Party entity identifier.
 *
 * **Details**
 *
 * A party is a person, organization or collective agent. The id names the
 * party itself, never a record it points at, so every slice that refers to a
 * party (law-practice roles, the party slice) shares one neutral identifier
 * and attaches its own role vocabulary.
 *
 * **Example** (Read the registered entity type)
 *
 * ```ts
 * import * as Party from "@beep/shared-domain/identity/Party"
 *
 * console.log(Party.PartyId.entityType) // "Party"
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const PartyId = make("party", {
  entityType: "Party",
  brand: "PartyId",
  tableName: "party",
  description: "Identifier for a party: a person, organization or collective agent.",
});

/**
 * Runtime type for {@link PartyId}.
 *
 * @see {@link PartyId} for the runtime schema and entity-type metadata.
 * @category entity-ids
 * @since 0.0.0
 */
export type PartyId = typeof PartyId.Type;
