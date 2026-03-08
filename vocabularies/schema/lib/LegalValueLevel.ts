import { schema } from './namespace.js';

const values = {
  AuthoritativeLegalValue: schema.AuthoritativeLegalValue,
  DefinitiveLegalValue: schema.DefinitiveLegalValue,
  OfficialLegalValue: schema.OfficialLegalValue,
  UnofficialLegalValue: schema.UnofficialLegalValue,
};

export type LegalValueLevel = typeof values[keyof typeof values];

export default values;
