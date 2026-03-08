import { schema } from './namespace.js';

const values = {
  BackOrder: schema.BackOrder,
  Discontinued: schema.Discontinued,
  InStock: schema.InStock,
  InStoreOnly: schema.InStoreOnly,
  LimitedAvailability: schema.LimitedAvailability,
  OnlineOnly: schema.OnlineOnly,
  OutOfStock: schema.OutOfStock,
  PreOrder: schema.PreOrder,
  PreSale: schema.PreSale,
  SoldOut: schema.SoldOut,
};

export type ItemAvailability = typeof values[keyof typeof values];

export default values;
