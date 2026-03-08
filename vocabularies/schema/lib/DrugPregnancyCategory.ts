import { schema } from './namespace.js';

const values = {
  FDAcategoryA: schema.FDAcategoryA,
  FDAcategoryB: schema.FDAcategoryB,
  FDAcategoryC: schema.FDAcategoryC,
  FDAcategoryD: schema.FDAcategoryD,
  FDAcategoryX: schema.FDAcategoryX,
  FDAnotEvaluated: schema.FDAnotEvaluated,
};

export type DrugPregnancyCategory = typeof values[keyof typeof values];

export default values;
