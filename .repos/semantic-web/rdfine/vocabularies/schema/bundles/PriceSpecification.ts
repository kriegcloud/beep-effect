import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const PriceSpecificationBundle = [
  PriceSpecificationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  StructuredValueMixin as Mixin];
