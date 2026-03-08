import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DurationMixin } from '../lib/Duration.js';
import { QuantityMixin } from '../lib/Quantity.js';

export const DurationBundle = [
  DurationMixin as Mixin,
  QuantityMixin as Mixin];
