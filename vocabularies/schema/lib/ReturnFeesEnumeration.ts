import { schema } from './namespace.js';

const values = {
  FreeReturn: schema.FreeReturn,
  OriginalShippingFees: schema.OriginalShippingFees,
  RestockingFees: schema.RestockingFees,
  ReturnFeesCustomerResponsibility: schema.ReturnFeesCustomerResponsibility,
  ReturnShippingFees: schema.ReturnShippingFees,
};

export type ReturnFeesEnumeration = typeof values[keyof typeof values];

export default values;
