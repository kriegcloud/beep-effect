import { EntityId } from "@beep/schema/EntityId";
import type * as S from "effect/Schema";
//----------------------------------------------------------------------------------------------------------------------
// WMS ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------
export const InventoryId = EntityId.make("inventory", {
  brand: "InventoryId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/InventoryId"),
    description: "A unique identifier for an inventory",
  },
});

export declare namespace InventoryId {
  export type Type = S.Schema.Type<typeof InventoryId>;
  export type Encoded = S.Schema.Encoded<typeof InventoryId>;
}

export const ItemId = EntityId.make("item", {
  brand: "ItemId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/ItemId"),
    description: "A unique identifier for an item",
  },
});

export declare namespace ItemId {
  export type Type = S.Schema.Type<typeof ItemId>;
  export type Encoded = S.Schema.Encoded<typeof ItemId>;
}

export const LocationId = EntityId.make("location", {
  brand: "LocationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/LocationId"),
    description: "A unique identifier for a location",
  },
});

export declare namespace LocationId {
  export type Type = S.Schema.Type<typeof LocationId>;
  export type Encoded = S.Schema.Encoded<typeof LocationId>;
}

export const OrderId = EntityId.make("order", {
  brand: "OrderId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/OrderId"),
    description: "A unique identifier for an order",
  },
});
export declare namespace OrderId {
  export type Type = S.Schema.Type<typeof OrderId>;
  export type Encoded = S.Schema.Encoded<typeof OrderId>;
}

export const UomId = EntityId.make("uom", {
  brand: "UomId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/UomId"),
    description: "A unique identifier for a uom",
  },
});
export declare namespace UomId {
  export type Type = S.Schema.Type<typeof UomId>;
  export type Encoded = S.Schema.Encoded<typeof UomId>;
}

export const WarehouseId = EntityId.make("warehouse", {
  brand: "WarehouseId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/WarehouseId"),
    description: "A unique identifier for a warehouse",
  },
});

export declare namespace WarehouseId {
  export type Type = S.Schema.Type<typeof WarehouseId>;
  export type Encoded = S.Schema.Encoded<typeof WarehouseId>;
}

export const WorkId = EntityId.make("work", {
  brand: "WorkId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/wms/WorkId"),
    description: "A unique identifier for a work",
  },
});
export declare namespace WorkId {
  export type Type = S.Schema.Type<typeof WorkId>;
  export type Encoded = S.Schema.Encoded<typeof WorkId>;
}
