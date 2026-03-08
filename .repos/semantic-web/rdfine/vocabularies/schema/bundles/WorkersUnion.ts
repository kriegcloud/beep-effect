import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { WorkersUnionMixin } from '../lib/WorkersUnion.js';

export const WorkersUnionBundle = [
  OrganizationMixin as Mixin,
  WorkersUnionMixin as Mixin];
