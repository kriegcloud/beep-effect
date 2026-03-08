import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PerformingGroupMixin } from '../lib/PerformingGroup.js';
import { TheaterGroupMixin } from '../lib/TheaterGroup.js';

export const TheaterGroupBundle = [
  PerformingGroupMixin as Mixin,
  TheaterGroupMixin as Mixin];
