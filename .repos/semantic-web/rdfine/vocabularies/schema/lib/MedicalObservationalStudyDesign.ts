import { schema } from './namespace.js';

const values = {
  CaseSeries: schema.CaseSeries,
  CohortStudy: schema.CohortStudy,
  CrossSectional: schema.CrossSectional,
  Longitudinal: schema.Longitudinal,
  Observational: schema.Observational,
  Registry: schema.Registry,
};

export type MedicalObservationalStudyDesign = typeof values[keyof typeof values];

export default values;
