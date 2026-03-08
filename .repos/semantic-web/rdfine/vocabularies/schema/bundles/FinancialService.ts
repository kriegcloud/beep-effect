import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FinancialServiceMixin } from '../lib/FinancialService.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const FinancialServiceBundle = [
  FinancialServiceMixin as Mixin,
  LocalBusinessMixin as Mixin];
