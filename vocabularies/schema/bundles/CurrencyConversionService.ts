import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CurrencyConversionServiceMixin } from '../lib/CurrencyConversionService.js';
import { FinancialProductMixin } from '../lib/FinancialProduct.js';

export const CurrencyConversionServiceBundle = [
  CurrencyConversionServiceMixin as Mixin,
  FinancialProductMixin as Mixin];
