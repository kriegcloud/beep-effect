import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { QuantitativeValueDistributionMixin } from '../lib/QuantitativeValueDistribution.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const QuantitativeValueDistributionBundle = [
  DurationMixin as Mixin,
  QuantitativeValueDistributionMixin as Mixin,
  StructuredValueMixin as Mixin];
