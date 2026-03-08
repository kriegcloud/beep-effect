import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MassMixin } from '../lib/Mass.js';
import { QuantityMixin } from '../lib/Quantity.js';

export const MassBundle = [
  MassMixin as Mixin,
  QuantityMixin as Mixin];
