import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { EatActionMixin } from '../lib/EatAction.js';

export const EatActionBundle = [
  ConsumeActionMixin as Mixin,
  EatActionMixin as Mixin];
