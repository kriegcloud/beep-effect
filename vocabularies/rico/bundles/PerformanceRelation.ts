import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventRelationMixin } from '../lib/EventRelation.js';
import { PerformanceRelationMixin } from '../lib/PerformanceRelation.js';

export const PerformanceRelationBundle = [
  EventRelationMixin as Mixin,
  PerformanceRelationMixin as Mixin];
