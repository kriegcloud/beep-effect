import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { UseActionMixin } from '../lib/UseAction.js';

export const UseActionBundle = [
  ConsumeActionMixin as Mixin,
  UseActionMixin as Mixin];
