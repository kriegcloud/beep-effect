import { schema } from './namespace.js';

const values = {
  NoninvasiveProcedure: schema.NoninvasiveProcedure,
  PercutaneousProcedure: schema.PercutaneousProcedure,
};

export type MedicalProcedureType = typeof values[keyof typeof values];

export default values;
