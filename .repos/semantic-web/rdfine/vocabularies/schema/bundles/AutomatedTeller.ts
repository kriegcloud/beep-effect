import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomatedTellerMixin } from '../lib/AutomatedTeller.js';
import { FinancialServiceMixin } from '../lib/FinancialService.js';

export const AutomatedTellerBundle = [
  AutomatedTellerMixin as Mixin,
  FinancialServiceMixin as Mixin];
