import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FinancialServiceMixin } from '../lib/FinancialService.js';
import { InsuranceAgencyMixin } from '../lib/InsuranceAgency.js';

export const InsuranceAgencyBundle = [
  FinancialServiceMixin as Mixin,
  InsuranceAgencyMixin as Mixin];
