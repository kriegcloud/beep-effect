import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';
import { WarrantyPromiseMixin } from '../lib/WarrantyPromise.js';

export const WarrantyPromiseBundle = [
  QuantitativeValueMixin as Mixin,
  StructuredValueMixin as Mixin,
  WarrantyPromiseMixin as Mixin];
