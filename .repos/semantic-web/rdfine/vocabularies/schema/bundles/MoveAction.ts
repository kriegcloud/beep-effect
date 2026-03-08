import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { MoveActionMixin } from '../lib/MoveAction.js';
import { PlaceMixin } from '../lib/Place.js';

export const MoveActionBundle = [
  ActionMixin as Mixin,
  MoveActionMixin as Mixin,
  PlaceMixin as Mixin];
