import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { DeleteMixin } from '../lib/Delete.js';

export const DeleteBundle = [
  ActivityMixin as Mixin,
  DeleteMixin as Mixin];
