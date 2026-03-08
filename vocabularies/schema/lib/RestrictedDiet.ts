import { schema } from './namespace.js';

const values = {
  DiabeticDiet: schema.DiabeticDiet,
  GlutenFreeDiet: schema.GlutenFreeDiet,
  HalalDiet: schema.HalalDiet,
  HinduDiet: schema.HinduDiet,
  KosherDiet: schema.KosherDiet,
  LowCalorieDiet: schema.LowCalorieDiet,
  LowFatDiet: schema.LowFatDiet,
  LowLactoseDiet: schema.LowLactoseDiet,
  LowSaltDiet: schema.LowSaltDiet,
  VeganDiet: schema.VeganDiet,
  VegetarianDiet: schema.VegetarianDiet,
};

export type RestrictedDiet = typeof values[keyof typeof values];

export default values;
