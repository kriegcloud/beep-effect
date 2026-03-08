import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { EntityInfluenceMixin } from '../lib/EntityInfluence.js';
import { InstantaneousEventMixin } from '../lib/InstantaneousEvent.js';
import { StartMixin } from '../lib/Start.js';

export const StartBundle = [
  ActivityMixin as Mixin,
  EntityInfluenceMixin as Mixin,
  InstantaneousEventMixin as Mixin,
  StartMixin as Mixin];
