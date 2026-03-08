import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { FollowMixin } from '../lib/Follow.js';

export const FollowBundle = [
  ActivityMixin as Mixin,
  FollowMixin as Mixin];
