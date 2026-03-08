import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const OrganizationBundle = [
  ObjectMixin as Mixin,
  OrganizationMixin as Mixin];
