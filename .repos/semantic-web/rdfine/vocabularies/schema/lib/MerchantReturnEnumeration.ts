import { schema } from './namespace.js';

const values = {
  MerchantReturnFiniteReturnWindow: schema.MerchantReturnFiniteReturnWindow,
  MerchantReturnNotPermitted: schema.MerchantReturnNotPermitted,
  MerchantReturnUnlimitedWindow: schema.MerchantReturnUnlimitedWindow,
  MerchantReturnUnspecified: schema.MerchantReturnUnspecified,
};

export type MerchantReturnEnumeration = typeof values[keyof typeof values];

export default values;
