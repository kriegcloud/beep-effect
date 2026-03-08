import { schema } from './namespace.js';

const values = {
  EUEnergyEfficiencyCategoryA1Plus: schema.EUEnergyEfficiencyCategoryA1Plus,
  EUEnergyEfficiencyCategoryA2Plus: schema.EUEnergyEfficiencyCategoryA2Plus,
  EUEnergyEfficiencyCategoryA3Plus: schema.EUEnergyEfficiencyCategoryA3Plus,
  EUEnergyEfficiencyCategoryA: schema.EUEnergyEfficiencyCategoryA,
  EUEnergyEfficiencyCategoryB: schema.EUEnergyEfficiencyCategoryB,
  EUEnergyEfficiencyCategoryC: schema.EUEnergyEfficiencyCategoryC,
  EUEnergyEfficiencyCategoryD: schema.EUEnergyEfficiencyCategoryD,
  EUEnergyEfficiencyCategoryE: schema.EUEnergyEfficiencyCategoryE,
  EUEnergyEfficiencyCategoryF: schema.EUEnergyEfficiencyCategoryF,
  EUEnergyEfficiencyCategoryG: schema.EUEnergyEfficiencyCategoryG,
};

export type EUEnergyEfficiencyEnumeration = typeof values[keyof typeof values];

export default values;
