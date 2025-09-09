import { BS } from "@beep/schema";
//----------------------------------------------------------------------------------------------------------------------
// WMS ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------
export const InventoryIdKit = new BS.EntityIdKit({
  tableName: "inventory",
  brand: "InventoryId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/InventoryId"),
    description: "A unique identifier for an inventory",
  },
});

export class InventoryId extends InventoryIdKit.Schema {
  static readonly tableName = InventoryIdKit.tableName;
  static readonly create = InventoryIdKit.create;
  static readonly make = InventoryIdKit.make;
  static readonly is = InventoryIdKit.is;
}

export const ItemIdKit = new BS.EntityIdKit({
  tableName: "item",
  brand: "ItemId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/ItemId"),
    description: "A unique identifier for an item",
  },
});

export class ItemId extends ItemIdKit.Schema {
  static readonly tableName = ItemIdKit.tableName;
  static readonly create = ItemIdKit.create;
  static readonly make = ItemIdKit.make;
  static readonly is = ItemIdKit.is;
}

export const LocationIdKit = new BS.EntityIdKit({
  tableName: "location",
  brand: "LocationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/LocationId"),
    description: "A unique identifier for a location",
  },
});

export class LocationId extends LocationIdKit.Schema {
  static readonly tableName = LocationIdKit.tableName;
  static readonly create = LocationIdKit.create;
  static readonly make = LocationIdKit.make;
  static readonly is = LocationIdKit.is;
}

export const OrderIdKit = new BS.EntityIdKit({
  tableName: "order",
  brand: "OrderId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/OrderId"),
    description: "A unique identifier for an order",
  },
});

export class OrderId extends OrderIdKit.Schema {
  static readonly tableName = OrderIdKit.tableName;
  static readonly create = OrderIdKit.create;
  static readonly make = OrderIdKit.make;
  static readonly is = OrderIdKit.is;
}
export const UomIdKit = new BS.EntityIdKit({
  tableName: "uom",
  brand: "UomId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/UomId"),
    description: "A unique identifier for a uom",
  },
});
export class UomId extends UomIdKit.Schema {
  static readonly tableName = UomIdKit.tableName;
  static readonly create = UomIdKit.create;
  static readonly make = UomIdKit.make;
  static readonly is = UomIdKit.is;
}

export const WarehouseIdKit = new BS.EntityIdKit({
  tableName: "warehouse",
  brand: "WarehouseId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/WarehouseId"),
    description: "A unique identifier for a warehouse",
  },
});

export class WarehouseId extends WarehouseIdKit.Schema {
  static readonly tableName = WarehouseIdKit.tableName;
  static readonly create = WarehouseIdKit.create;
  static readonly make = WarehouseIdKit.make;
  static readonly is = WarehouseIdKit.is;
}

export const WorkIdKit = new BS.EntityIdKit({
  tableName: "work",
  brand: "WorkId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/WorkId"),
    description: "A unique identifier for a work",
  },
});

export class WorkId extends WorkIdKit.Schema {
  static readonly tableName = WorkIdKit.tableName;
  static readonly create = WorkIdKit.create;
  static readonly make = WorkIdKit.make;
  static readonly is = WorkIdKit.is;
}
