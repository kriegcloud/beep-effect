import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UseActionMixin } from '../lib/UseAction.js';
import { WearActionMixin } from '../lib/WearAction.js';

export const WearActionBundle = [
  UseActionMixin as Mixin,
  WearActionMixin as Mixin];
