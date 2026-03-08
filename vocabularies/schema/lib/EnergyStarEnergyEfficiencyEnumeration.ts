import { schema } from './namespace.js';

const values = {
  EnergyStarCertified: schema.EnergyStarCertified,
};

export type EnergyStarEnergyEfficiencyEnumeration = typeof values[keyof typeof values];

export default values;
