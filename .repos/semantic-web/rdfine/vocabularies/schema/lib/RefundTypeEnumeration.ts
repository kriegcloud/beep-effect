import { schema } from './namespace.js';

const values = {
  ExchangeRefund: schema.ExchangeRefund,
  FullRefund: schema.FullRefund,
  StoreCreditRefund: schema.StoreCreditRefund,
};

export type RefundTypeEnumeration = typeof values[keyof typeof values];

export default values;
