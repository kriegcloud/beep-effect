import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ModifyMixin } from '../lib/Modify.js';

export const ModifyBundle = [
  ActivityMixin as Mixin,
  ModifyMixin as Mixin];
