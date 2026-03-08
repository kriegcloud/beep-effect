import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';
import { WorkRelationMixin } from '../lib/WorkRelation.js';

export const WorkRelationBundle = [
  AgentToAgentRelationMixin as Mixin,
  WorkRelationMixin as Mixin];
