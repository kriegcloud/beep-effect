import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CookActionMixin } from '../lib/CookAction.js';
import { CreateActionMixin } from '../lib/CreateAction.js';
import { FoodEstablishmentMixin } from '../lib/FoodEstablishment.js';
import { FoodEventMixin } from '../lib/FoodEvent.js';
import { PlaceMixin } from '../lib/Place.js';
import { RecipeMixin } from '../lib/Recipe.js';

export const CookActionBundle = [
  CookActionMixin as Mixin,
  CreateActionMixin as Mixin,
  FoodEstablishmentMixin as Mixin,
  FoodEventMixin as Mixin,
  PlaceMixin as Mixin,
  RecipeMixin as Mixin];
