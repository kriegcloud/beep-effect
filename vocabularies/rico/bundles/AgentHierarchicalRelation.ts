import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentHierarchicalRelationMixin } from '../lib/AgentHierarchicalRelation.js';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';

export const AgentHierarchicalRelationBundle = [
  AgentHierarchicalRelationMixin as Mixin,
  AgentToAgentRelationMixin as Mixin];
