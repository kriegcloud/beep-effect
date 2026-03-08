import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BakeryMixin } from '../lib/Bakery.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';

export const BakeryBundle = [
  BakeryMixin as Mixin,
  FoodEstablishmentMixin as Mixin];
