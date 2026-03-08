import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DeleteActionMixin } from '../lib/DeleteAction.js';
import { UpdateActionMixin } from '../lib/UpdateAction.js';

export const DeleteActionBundle = [
  DeleteActionMixin as Mixin,
  UpdateActionMixin as Mixin];
