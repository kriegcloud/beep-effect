import { schema } from './namespace.js';

const values = {
  Diagnostic: schema.Diagnostic,
  Therapeutic: schema.Therapeutic,
};

export type MedicalDevicePurpose = typeof values[keyof typeof values];

export default values;
