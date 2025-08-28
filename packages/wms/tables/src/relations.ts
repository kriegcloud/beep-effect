import { organization } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import { inventoryTable, itemTable, locationTable, uomTable, warehouseTable } from "./tables";
export const warehouseRelations = d.relations(warehouseTable, ({ many, one }) => ({
  organization: one(organization, {
    fields: [warehouseTable.organizationId],
    references: [organization.id],
  }),
  inventory: many(inventoryTable),
  locations: many(locationTable),
}));

export const locationRelations = d.relations(locationTable, ({ many, one }) => ({
  warehouse: one(warehouseTable, {
    fields: [locationTable.warehouseId],
    references: [warehouseTable.id],
  }),
  inventory: many(inventoryTable),
}));

export const inventoryRelations = d.relations(inventoryTable, ({ many, one }) => ({
  item: one(itemTable, {
    fields: [inventoryTable.itemId],
    references: [itemTable.id],
  }),
  location: one(locationTable, {
    fields: [inventoryTable.locationId],
    references: [locationTable.id],
  }),
  organization: one(organization, {
    fields: [inventoryTable.organizationId],
    references: [organization.id],
  }),
  warehouse: one(warehouseTable, {
    fields: [inventoryTable.warehouseId],
    references: [warehouseTable.id],
  }),
}));

export const itemRelations = d.relations(itemTable, ({ many, one }) => ({
  inventories: many(inventoryTable),
  organization: one(organization, {
    fields: [itemTable.organizationId],
    references: [organization.id],
  }),
  uoms: many(uomTable),
}));

export const uomRelations = d.relations(uomTable, ({ many, one }) => ({
  item: one(itemTable, {
    fields: [uomTable.itemId],
    references: [itemTable.id],
  }),
}));
