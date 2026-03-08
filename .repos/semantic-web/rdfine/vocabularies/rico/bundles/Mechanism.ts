import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { MechanismMixin } from '../lib/Mechanism.js';

export const MechanismBundle = [
  AgentMixin as Mixin,
  MechanismMixin as Mixin];
