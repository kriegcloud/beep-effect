import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PaymentChargeSpecificationMixin } from '../lib/PaymentChargeSpecification.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';

export const PaymentChargeSpecificationBundle = [
  PaymentChargeSpecificationMixin as Mixin,
  PriceSpecificationMixin as Mixin];
