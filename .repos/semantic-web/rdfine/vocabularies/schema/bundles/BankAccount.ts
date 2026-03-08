import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BankAccountMixin } from '../lib/BankAccount.js';
import { FinancialProductMixin } from '../lib/FinancialProduct.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';

export const BankAccountBundle = [
  BankAccountMixin as Mixin,
  FinancialProductMixin as Mixin,
  MonetaryAmountMixin as Mixin];
