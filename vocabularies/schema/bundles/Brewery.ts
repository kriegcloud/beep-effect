import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BreweryMixin } from '../lib/Brewery.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';

export const BreweryBundle = [
  BreweryMixin as Mixin,
  FoodEstablishmentMixin as Mixin];
