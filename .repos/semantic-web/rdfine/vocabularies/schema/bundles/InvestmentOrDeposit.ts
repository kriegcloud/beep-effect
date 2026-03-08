import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FinancialProductMixin } from '../lib/FinancialProduct.js';
import { InvestmentOrDepositMixin } from '../lib/InvestmentOrDeposit.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';

export const InvestmentOrDepositBundle = [
  FinancialProductMixin as Mixin,
  InvestmentOrDepositMixin as Mixin,
  MonetaryAmountMixin as Mixin];
