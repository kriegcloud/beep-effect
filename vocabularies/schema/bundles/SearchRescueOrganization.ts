import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { SearchRescueOrganizationMixin } from '../lib/SearchRescueOrganization.js';

export const SearchRescueOrganizationBundle = [
  OrganizationMixin as Mixin,
  SearchRescueOrganizationMixin as Mixin];
