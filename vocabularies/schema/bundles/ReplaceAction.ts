import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ReplaceActionMixin } from '../lib/ReplaceAction.js';
import { ThingMixin } from '../lib/Thing.js';
import { UpdateActionMixin } from '../lib/UpdateAction.js';

export const ReplaceActionBundle = [
  ReplaceActionMixin as Mixin,
  ThingMixin as Mixin,
  UpdateActionMixin as Mixin];
