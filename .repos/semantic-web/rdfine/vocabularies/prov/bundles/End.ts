import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { EndMixin } from '../lib/End.js';
import { EntityInfluenceMixin } from '../lib/EntityInfluence.js';
import { InstantaneousEventMixin } from '../lib/InstantaneousEvent.js';

export const EndBundle = [
  ActivityMixin as Mixin,
  EndMixin as Mixin,
  EntityInfluenceMixin as Mixin,
  InstantaneousEventMixin as Mixin];
