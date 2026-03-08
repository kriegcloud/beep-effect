import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { MenuMixin } from '../lib/Menu.js';
import { RatingMixin } from '../lib/Rating.js';

export const FoodEstablishmentBundle = [
  FoodEstablishmentMixin as Mixin,
  LocalBusinessMixin as Mixin,
  MenuMixin as Mixin,
  RatingMixin as Mixin];
