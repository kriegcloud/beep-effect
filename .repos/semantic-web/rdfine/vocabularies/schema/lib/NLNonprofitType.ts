import { schema } from './namespace.js';

const values = {
  NonprofitANBI: schema.NonprofitANBI,
  NonprofitSBBI: schema.NonprofitSBBI,
};

export type NLNonprofitType = typeof values[keyof typeof values];

export default values;
