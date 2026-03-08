import { schema } from './namespace.js';

const values = {
  ReimbursementCap: schema.ReimbursementCap,
  Retail: schema.Retail,
  Wholesale: schema.Wholesale,
};

export type DrugCostCategory = typeof values[keyof typeof values];

export default values;
