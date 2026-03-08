import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { QuantityMixin } from '../lib/Quantity.js';

export const QuantityBundle = [
  IntangibleMixin as Mixin,
  QuantityMixin as Mixin];
