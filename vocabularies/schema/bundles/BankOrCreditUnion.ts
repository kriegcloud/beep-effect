import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BankOrCreditUnionMixin } from '../lib/BankOrCreditUnion.js';
import { FinancialServiceMixin } from '../lib/FinancialService.js';

export const BankOrCreditUnionBundle = [
  BankOrCreditUnionMixin as Mixin,
  FinancialServiceMixin as Mixin];
