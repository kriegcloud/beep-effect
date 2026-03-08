import { schema } from './namespace.js';

const values = {
  AerobicActivity: schema.AerobicActivity,
  AnaerobicActivity: schema.AnaerobicActivity,
  Balance: schema.Balance,
  Flexibility: schema.Flexibility,
  LeisureTimeActivity: schema.LeisureTimeActivity,
  OccupationalActivity: schema.OccupationalActivity,
  StrengthTraining: schema.StrengthTraining,
};

export type PhysicalActivityCategory = typeof values[keyof typeof values];

export default values;
