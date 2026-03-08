import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentInfluenceMixin } from '../lib/AgentInfluence.js';
import { AgentMixin } from '../lib/Agent.js';
import { InfluenceMixin } from '../lib/Influence.js';

export const AgentInfluenceBundle = [
  AgentInfluenceMixin as Mixin,
  AgentMixin as Mixin,
  InfluenceMixin as Mixin];
