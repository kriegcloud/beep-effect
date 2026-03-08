import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NGOMixin } from '../lib/NGO.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const NGOBundle = [
  NGOMixin as Mixin,
  OrganizationMixin as Mixin];
