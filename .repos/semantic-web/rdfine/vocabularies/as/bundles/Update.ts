import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { UpdateMixin } from '../lib/Update.js';

export const UpdateBundle = [
  ActivityMixin as Mixin,
  UpdateMixin as Mixin];
