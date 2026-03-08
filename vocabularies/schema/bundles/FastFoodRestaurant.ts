import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FastFoodRestaurantMixin } from '../lib/FastFoodRestaurant.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';

export const FastFoodRestaurantBundle = [
  FastFoodRestaurantMixin as Mixin,
  FoodEstablishmentMixin as Mixin];
