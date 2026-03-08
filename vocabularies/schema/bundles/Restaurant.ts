import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';
import { RestaurantMixin } from '../lib/Restaurant.js';

export const RestaurantBundle = [
  FoodEstablishmentMixin as Mixin,
  RestaurantMixin as Mixin];
