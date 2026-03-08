import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FinancialProductMixin } from '../lib/FinancialProduct.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ServiceMixin } from '../lib/Service.js';

export const FinancialProductBundle = [
  FinancialProductMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ServiceMixin as Mixin];
