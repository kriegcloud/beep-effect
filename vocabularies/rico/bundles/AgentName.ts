import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { AgentNameMixin } from '../lib/AgentName.js';
import { NameMixin } from '../lib/Name.js';

export const AgentNameBundle = [
  AgentMixin as Mixin,
  AgentNameMixin as Mixin,
  NameMixin as Mixin];
