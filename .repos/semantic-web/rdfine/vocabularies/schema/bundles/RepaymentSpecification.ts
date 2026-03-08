import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { RepaymentSpecificationMixin } from '../lib/RepaymentSpecification.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const RepaymentSpecificationBundle = [
  MonetaryAmountMixin as Mixin,
  RepaymentSpecificationMixin as Mixin,
  StructuredValueMixin as Mixin];
