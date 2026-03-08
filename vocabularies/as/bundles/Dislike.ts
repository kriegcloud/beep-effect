import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { DislikeMixin } from '../lib/Dislike.js';

export const DislikeBundle = [
  ActivityMixin as Mixin,
  DislikeMixin as Mixin];
