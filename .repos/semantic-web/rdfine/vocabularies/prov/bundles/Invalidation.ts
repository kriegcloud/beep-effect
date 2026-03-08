import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityInfluenceMixin } from '../lib/ActivityInfluence.js';
import { InstantaneousEventMixin } from '../lib/InstantaneousEvent.js';
import { InvalidationMixin } from '../lib/Invalidation.js';

export const InvalidationBundle = [
  ActivityInfluenceMixin as Mixin,
  InstantaneousEventMixin as Mixin,
  InvalidationMixin as Mixin];
