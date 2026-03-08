import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityInfluenceMixin } from '../lib/ActivityInfluence.js';
import { ActivityMixin } from '../lib/Activity.js';
import { InfluenceMixin } from '../lib/Influence.js';

export const ActivityInfluenceBundle = [
  ActivityInfluenceMixin as Mixin,
  ActivityMixin as Mixin,
  InfluenceMixin as Mixin];
