import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { FinancialProductMixin } from '../lib/FinancialProduct.js';
import { LoanOrCreditMixin } from '../lib/LoanOrCredit.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { RepaymentSpecificationMixin } from '../lib/RepaymentSpecification.js';
import { ThingMixin } from '../lib/Thing.js';

export const LoanOrCreditBundle = [
  DurationMixin as Mixin,
  FinancialProductMixin as Mixin,
  LoanOrCreditMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  RepaymentSpecificationMixin as Mixin,
  ThingMixin as Mixin];
