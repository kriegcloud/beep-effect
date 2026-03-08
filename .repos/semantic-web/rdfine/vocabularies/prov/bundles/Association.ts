import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentInfluenceMixin } from '../lib/AgentInfluence.js';
import { AssociationMixin } from '../lib/Association.js';
import { PlanMixin } from '../lib/Plan.js';
import { RoleMixin } from '../lib/Role.js';

export const AssociationBundle = [
  AgentInfluenceMixin as Mixin,
  AssociationMixin as Mixin,
  PlanMixin as Mixin,
  RoleMixin as Mixin];
