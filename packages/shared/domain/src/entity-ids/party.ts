import { EntityId } from "@beep/schema/identity";

export const PartyId = EntityId.make("party", {
  brand: "PartyId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/Party"),
    description: "A unique identifier for a Party",
  },
});
