import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AddActionMixin } from '../lib/AddAction.js';
import { InsertActionMixin } from '../lib/InsertAction.js';
import { PlaceMixin } from '../lib/Place.js';

export const InsertActionBundle = [
  AddActionMixin as Mixin,
  InsertActionMixin as Mixin,
  PlaceMixin as Mixin];
