import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FinancialProductMixin } from '../lib/FinancialProduct.js';
import { PaymentServiceMixin } from '../lib/PaymentService.js';

export const PaymentServiceBundle = [
  FinancialProductMixin as Mixin,
  PaymentServiceMixin as Mixin];
