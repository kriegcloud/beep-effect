import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentControlRelationMixin } from '../lib/AgentControlRelation.js';
import { LeadershipRelationMixin } from '../lib/LeadershipRelation.js';
import { PositionMixin } from '../lib/Position.js';

export const LeadershipRelationBundle = [
  AgentControlRelationMixin as Mixin,
  LeadershipRelationMixin as Mixin,
  PositionMixin as Mixin];
