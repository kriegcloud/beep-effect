import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { IntransitiveActivityMixin } from '../lib/IntransitiveActivity.js';

export const IntransitiveActivityBundle = [
  ActivityMixin as Mixin,
  IntransitiveActivityMixin as Mixin];
