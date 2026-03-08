import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastFrequencySpecificationMixin } from '../lib/BroadcastFrequencySpecification.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';

export const BroadcastFrequencySpecificationBundle = [
  BroadcastFrequencySpecificationMixin as Mixin,
  IntangibleMixin as Mixin,
  QuantitativeValueMixin as Mixin];
