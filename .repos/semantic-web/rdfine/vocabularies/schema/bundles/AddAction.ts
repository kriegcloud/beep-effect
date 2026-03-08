import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AddActionMixin } from '../lib/AddAction.js';
import { UpdateActionMixin } from '../lib/UpdateAction.js';

export const AddActionBundle = [
  AddActionMixin as Mixin,
  UpdateActionMixin as Mixin];
