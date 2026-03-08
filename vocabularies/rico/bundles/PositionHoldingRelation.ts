import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentToAgentRelationMixin } from '../lib/AgentToAgentRelation.js';
import { PositionHoldingRelationMixin } from '../lib/PositionHoldingRelation.js';

export const PositionHoldingRelationBundle = [
  AgentToAgentRelationMixin as Mixin,
  PositionHoldingRelationMixin as Mixin];
