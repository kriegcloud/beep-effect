import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { PersonMixin } from '../lib/Person.js';

export const PersonBundle = [
  AgentMixin as Mixin,
  PersonMixin as Mixin];
