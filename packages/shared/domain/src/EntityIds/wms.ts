import { BS } from "@beep/schema";
//----------------------------------------------------------------------------------------------------------------------
// WMS ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------
export const InventoryId = BS.EntityId.make(
  "inventory",
  "Inventory"
)({
  identifier: "InventoryId",
  description: "A unique identifier for an inventory",
  title: "Inventory",
});

export const ItemId = BS.EntityId.make(
  "item",
  "Item"
)({
  identifier: "ItemId",
  description: "A unique identifier for an item",
  title: "Item",
});

export const LocationId = BS.EntityId.make(
  "location",
  "Location"
)({
  identifier: "LocationId",
  description: "A unique identifier for a location",
  title: "Location",
});

export const OrderId = BS.EntityId.make(
  "order",
  "Order"
)({
  identifier: "Order",
  description: "A unique identifier for an order",
  title: "Order",
});

export const UomId = BS.EntityId.make(
  "uom",
  "Uom"
)({
  identifier: "Uom",
  description: "A unique identifier for a uom",
  title: "Uom",
});

export const WarehouseId = BS.EntityId.make(
  "warehouse",
  "Warehouse"
)({
  identifier: "Warehouse",
  description: "A unique identifier for a warehouse",
  title: "Warehouse",
});

export const WorkId = BS.EntityId.make(
  "work",
  "Work"
)({
  identifier: "Work",
  description: "A unique identifier for a work",
  title: "Work",
});
