import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { ShoppingCenterMixin } from '../lib/ShoppingCenter.js';

export const ShoppingCenterBundle = [
  LocalBusinessMixin as Mixin,
  ShoppingCenterMixin as Mixin];
