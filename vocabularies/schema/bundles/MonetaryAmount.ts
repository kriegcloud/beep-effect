import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const MonetaryAmountBundle = [
  MonetaryAmountMixin as Mixin,
  StructuredValueMixin as Mixin];
