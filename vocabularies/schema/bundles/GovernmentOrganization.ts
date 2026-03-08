import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GovernmentOrganizationMixin } from '../lib/GovernmentOrganization.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const GovernmentOrganizationBundle = [
  GovernmentOrganizationMixin as Mixin,
  OrganizationMixin as Mixin];
