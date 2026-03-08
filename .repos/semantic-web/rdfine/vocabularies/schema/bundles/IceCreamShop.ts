import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';
import { IceCreamShopMixin } from '../lib/IceCreamShop.js';

export const IceCreamShopBundle = [
  FoodEstablishmentMixin as Mixin,
  IceCreamShopMixin as Mixin];
