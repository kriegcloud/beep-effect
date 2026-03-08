import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { UnitPriceSpecificationMixin } from '../lib/UnitPriceSpecification.js';

export const UnitPriceSpecificationBundle = [
  DurationMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  UnitPriceSpecificationMixin as Mixin];
