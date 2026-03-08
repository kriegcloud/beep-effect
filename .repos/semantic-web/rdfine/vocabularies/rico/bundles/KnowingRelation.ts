import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';
import { KnowingRelationMixin } from '../lib/KnowingRelation.js';

export const KnowingRelationBundle = [
  AgentToAgentRelationMixin as Mixin,
  KnowingRelationMixin as Mixin];
