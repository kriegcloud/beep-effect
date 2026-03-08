import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { DrinkActionMixin } from '../lib/DrinkAction.js';

export const DrinkActionBundle = [
  ConsumeActionMixin as Mixin,
  DrinkActionMixin as Mixin];
