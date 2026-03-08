import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { RemoveMixin } from '../lib/Remove.js';

export const RemoveBundle = [
  ActivityMixin as Mixin,
  RemoveMixin as Mixin];
