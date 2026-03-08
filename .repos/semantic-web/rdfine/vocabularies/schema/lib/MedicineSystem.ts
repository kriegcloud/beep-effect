import { schema } from './namespace.js';

const values = {
  Ayurvedic: schema.Ayurvedic,
  Chiropractic: schema.Chiropractic,
  Homeopathic: schema.Homeopathic,
  Osteopathic: schema.Osteopathic,
  TraditionalChinese: schema.TraditionalChinese,
  WesternConventional: schema.WesternConventional,
};

export type MedicineSystem = typeof values[keyof typeof values];

export default values;
