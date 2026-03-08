import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DistanceMixin } from '../lib/Distance.js';
import { QuantityMixin } from '../lib/Quantity.js';

export const DistanceBundle = [
  DistanceMixin as Mixin,
  QuantityMixin as Mixin];
