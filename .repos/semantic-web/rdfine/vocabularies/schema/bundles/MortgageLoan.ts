import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LoanOrCreditMixin } from '../lib/LoanOrCredit.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { MortgageLoanMixin } from '../lib/MortgageLoan.js';

export const MortgageLoanBundle = [
  LoanOrCreditMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  MortgageLoanMixin as Mixin];
