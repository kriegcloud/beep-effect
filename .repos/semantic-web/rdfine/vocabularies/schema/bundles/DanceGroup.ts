import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DanceGroupMixin } from '../lib/DanceGroup.js';
import { PerformingGroupMixin } from '../lib/PerformingGroup.js';

export const DanceGroupBundle = [
  DanceGroupMixin as Mixin,
  PerformingGroupMixin as Mixin];
