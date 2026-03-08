import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CorporationMixin } from '../lib/Corporation.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const CorporationBundle = [
  CorporationMixin as Mixin,
  OrganizationMixin as Mixin];
