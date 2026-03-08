import { schema } from './namespace.js';

const values = {
  DoubleBlindedTrial: schema.DoubleBlindedTrial,
  InternationalTrial: schema.InternationalTrial,
  MultiCenterTrial: schema.MultiCenterTrial,
  OpenTrial: schema.OpenTrial,
  PlaceboControlledTrial: schema.PlaceboControlledTrial,
  RandomizedTrial: schema.RandomizedTrial,
  SingleBlindedTrial: schema.SingleBlindedTrial,
  SingleCenterTrial: schema.SingleCenterTrial,
  TripleBlindedTrial: schema.TripleBlindedTrial,
};

export type MedicalTrialDesign = typeof values[keyof typeof values];

export default values;
