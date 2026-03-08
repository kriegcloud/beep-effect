import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { SportsOrganizationMixin } from '../lib/SportsOrganization.js';

export const SportsOrganizationBundle = [
  OrganizationMixin as Mixin,
  SportsOrganizationMixin as Mixin];
