import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HobbyShopMixin } from '../lib/HobbyShop.js';
import { StoreMixin } from '../lib/Store.js';

export const HobbyShopBundle = [
  HobbyShopMixin as Mixin,
  StoreMixin as Mixin];
