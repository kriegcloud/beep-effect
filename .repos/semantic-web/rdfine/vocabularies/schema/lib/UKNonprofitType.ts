import { schema } from './namespace.js';

const values = {
  CharitableIncorporatedOrganization: schema.CharitableIncorporatedOrganization,
  LimitedByGuaranteeCharity: schema.LimitedByGuaranteeCharity,
  UKTrust: schema.UKTrust,
  UnincorporatedAssociationCharity: schema.UnincorporatedAssociationCharity,
};

export type UKNonprofitType = typeof values[keyof typeof values];

export default values;
