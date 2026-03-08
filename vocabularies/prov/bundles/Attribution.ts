import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentInfluenceMixin } from '../lib/AgentInfluence.js';
import { AttributionMixin } from '../lib/Attribution.js';

export const AttributionBundle = [
  AgentInfluenceMixin as Mixin,
  AttributionMixin as Mixin];
