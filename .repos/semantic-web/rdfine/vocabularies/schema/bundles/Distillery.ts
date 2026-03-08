import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DistilleryMixin } from '../lib/Distillery.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';

export const DistilleryBundle = [
  DistilleryMixin as Mixin,
  FoodEstablishmentMixin as Mixin];
