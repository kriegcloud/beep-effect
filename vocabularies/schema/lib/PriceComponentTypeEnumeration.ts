import { schema } from './namespace.js';

const values = {
  ActivationFee: schema.ActivationFee,
  CleaningFee: schema.CleaningFee,
  DistanceFee: schema.DistanceFee,
  Downpayment: schema.Downpayment,
  Installment: schema.Installment,
  Subscription: schema.Subscription,
};

export type PriceComponentTypeEnumeration = typeof values[keyof typeof values];

export default values;
