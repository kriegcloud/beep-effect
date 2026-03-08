import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { AgentMixin } from '../lib/Agent.js';
import { DelegationMixin } from '../lib/Delegation.js';
import { EntityMixin } from '../lib/Entity.js';
import { InfluenceMixin } from '../lib/Influence.js';
import { LocationMixin } from '../lib/Location.js';

export const AgentBundle = [
  ActivityMixin as Mixin,
  AgentMixin as Mixin,
  DelegationMixin as Mixin,
  EntityMixin as Mixin,
  InfluenceMixin as Mixin,
  LocationMixin as Mixin];
