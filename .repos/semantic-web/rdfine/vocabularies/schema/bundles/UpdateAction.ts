import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { ThingMixin } from '../lib/Thing.js';
import { UpdateActionMixin } from '../lib/UpdateAction.js';

export const UpdateActionBundle = [
  ActionMixin as Mixin,
  ThingMixin as Mixin,
  UpdateActionMixin as Mixin];
