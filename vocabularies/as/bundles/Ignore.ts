import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { IgnoreMixin } from '../lib/Ignore.js';

export const IgnoreBundle = [
  ActivityMixin as Mixin,
  IgnoreMixin as Mixin];
