import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentInfluenceMixin } from '../lib/AgentInfluence.js';
import { DelegationMixin } from '../lib/Delegation.js';

export const DelegationBundle = [
  ActivityMixin as Mixin,
  AgentInfluenceMixin as Mixin,
  DelegationMixin as Mixin];
