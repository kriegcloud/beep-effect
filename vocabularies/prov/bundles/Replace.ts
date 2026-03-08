import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ReplaceMixin } from '../lib/Replace.js';

export const ReplaceBundle = [
  ActivityMixin as Mixin,
  ReplaceMixin as Mixin];
