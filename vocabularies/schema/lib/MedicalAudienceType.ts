import { schema } from './namespace.js';

const values = {
  Clinician: schema.Clinician,
  MedicalResearcher: schema.MedicalResearcher,
};

export type MedicalAudienceType = typeof values[keyof typeof values];

export default values;
