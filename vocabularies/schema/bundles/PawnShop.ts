import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PawnShopMixin } from '../lib/PawnShop.js';
import { StoreMixin } from '../lib/Store.js';

export const PawnShopBundle = [
  PawnShopMixin as Mixin,
  StoreMixin as Mixin];
