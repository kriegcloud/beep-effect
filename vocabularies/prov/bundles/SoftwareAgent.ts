import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { SoftwareAgentMixin } from '../lib/SoftwareAgent.js';

export const SoftwareAgentBundle = [
  AgentMixin as Mixin,
  SoftwareAgentMixin as Mixin];
