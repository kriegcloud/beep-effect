import * as d from "drizzle-orm";
import { organization, party } from "./tables";

export const partyRelations = d.relations(party, ({ one }) => ({
  organization: one(organization, {
    fields: [party.organizationId],
    references: [organization.id],
  }),
}));
