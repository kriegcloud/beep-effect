import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AgentMixin } from '../lib/Agent.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const OrganizationBundle = [
  AgentMixin as Mixin,
  OrganizationMixin as Mixin];
