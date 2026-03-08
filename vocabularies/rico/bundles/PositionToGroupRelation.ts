import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';
import { PositionToGroupRelationMixin } from '../lib/PositionToGroupRelation.js';

export const PositionToGroupRelationBundle = [
  AgentToAgentRelationMixin as Mixin,
  PositionToGroupRelationMixin as Mixin];
