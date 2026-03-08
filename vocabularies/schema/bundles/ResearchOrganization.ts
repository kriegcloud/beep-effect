import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { ResearchOrganizationMixin } from '../lib/ResearchOrganization.js';

export const ResearchOrganizationBundle = [
  OrganizationMixin as Mixin,
  ResearchOrganizationMixin as Mixin];
