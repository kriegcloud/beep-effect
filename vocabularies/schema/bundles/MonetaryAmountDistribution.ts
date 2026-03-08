import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MonetaryAmountDistributionMixin } from '../lib/MonetaryAmountDistribution.js';
import { QuantitativeValueDistributionMixin } from '../lib/QuantitativeValueDistribution.js';

export const MonetaryAmountDistributionBundle = [
  MonetaryAmountDistributionMixin as Mixin,
  QuantitativeValueDistributionMixin as Mixin];
