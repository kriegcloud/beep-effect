import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntityInfluenceMixin } from '../lib/EntityInfluence.js';
import { InstantaneousEventMixin } from '../lib/InstantaneousEvent.js';
import { UsageMixin } from '../lib/Usage.js';

export const UsageBundle = [
  EntityInfluenceMixin as Mixin,
  InstantaneousEventMixin as Mixin,
  UsageMixin as Mixin];
