import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CafeOrCoffeeShopMixin } from '../lib/CafeOrCoffeeShop.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';

export const CafeOrCoffeeShopBundle = [
  CafeOrCoffeeShopMixin as Mixin,
  FoodEstablishmentMixin as Mixin];
