import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DatedMoneySpecificationMixin } from '../lib/DatedMoneySpecification.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const DatedMoneySpecificationBundle = [
  DatedMoneySpecificationMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  StructuredValueMixin as Mixin];
