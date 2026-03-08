import { schema } from './namespace.js';

const values = {
  InvoicePrice: schema.InvoicePrice,
  ListPrice: schema.ListPrice,
  MSRP: schema.MSRP,
  MinimumAdvertisedPrice: schema.MinimumAdvertisedPrice,
  SRP: schema.SRP,
  SalePrice: schema.SalePrice,
};

export type PriceTypeEnumeration = typeof values[keyof typeof values];

export default values;
