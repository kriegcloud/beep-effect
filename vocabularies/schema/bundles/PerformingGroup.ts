import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { PerformingGroupMixin } from '../lib/PerformingGroup.js';

export const PerformingGroupBundle = [
  OrganizationMixin as Mixin,
  PerformingGroupMixin as Mixin];
