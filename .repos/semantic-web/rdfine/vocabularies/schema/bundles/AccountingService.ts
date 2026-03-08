import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccountingServiceMixin } from '../lib/AccountingService.js';
import { FinancialServiceMixin } from '../lib/FinancialService.js';

export const AccountingServiceBundle = [
  AccountingServiceMixin as Mixin,
  FinancialServiceMixin as Mixin];
