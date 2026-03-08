import { schema } from './namespace.js';

const values = {
  DamagedCondition: schema.DamagedCondition,
  NewCondition: schema.NewCondition,
  RefurbishedCondition: schema.RefurbishedCondition,
  UsedCondition: schema.UsedCondition,
};

export type OfferItemCondition = typeof values[keyof typeof values];

export default values;
