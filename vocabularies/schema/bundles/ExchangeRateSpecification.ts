import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ExchangeRateSpecificationMixin } from '../lib/ExchangeRateSpecification.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';
import { UnitPriceSpecificationMixin } from '../lib/UnitPriceSpecification.js';

export const ExchangeRateSpecificationBundle = [
  ExchangeRateSpecificationMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  StructuredValueMixin as Mixin,
  UnitPriceSpecificationMixin as Mixin];
