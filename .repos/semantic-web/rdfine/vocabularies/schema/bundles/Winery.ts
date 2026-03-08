import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';
import { WineryMixin } from '../lib/Winery.js';

export const WineryBundle = [
  FoodEstablishmentMixin as Mixin,
  WineryMixin as Mixin];
