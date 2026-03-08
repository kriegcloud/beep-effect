import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { StoreMixin } from '../lib/Store.js';
import { TireShopMixin } from '../lib/TireShop.js';

export const TireShopBundle = [
  StoreMixin as Mixin,
  TireShopMixin as Mixin];
