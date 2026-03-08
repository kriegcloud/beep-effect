import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BarOrPubMixin } from '../lib/BarOrPub.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';

export const BarOrPubBundle = [
  BarOrPubMixin as Mixin,
  FoodEstablishmentMixin as Mixin];
