import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FundingSchemeMixin } from '../lib/FundingScheme.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const FundingSchemeBundle = [
  FundingSchemeMixin as Mixin,
  OrganizationMixin as Mixin];
