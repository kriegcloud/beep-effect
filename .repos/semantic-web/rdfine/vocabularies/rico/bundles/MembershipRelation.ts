import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';
import { MembershipRelationMixin } from '../lib/MembershipRelation.js';
import { PositionMixin } from '../lib/Position.js';

export const MembershipRelationBundle = [
  AgentToAgentRelationMixin as Mixin,
  MembershipRelationMixin as Mixin,
  PositionMixin as Mixin];
