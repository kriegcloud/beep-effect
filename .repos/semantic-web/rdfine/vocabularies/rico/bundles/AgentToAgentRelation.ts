import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const AgentToAgentRelationBundle = [
  AgentToAgentRelationMixin as Mixin,
  RelationMixin as Mixin];
