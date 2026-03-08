import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsortiumMixin } from '../lib/Consortium.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const ConsortiumBundle = [
  ConsortiumMixin as Mixin,
  OrganizationMixin as Mixin];
