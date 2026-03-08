import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationRoleMixin } from '../lib/OrganizationRole.js';
import { RoleMixin } from '../lib/Role.js';

export const OrganizationRoleBundle = [
  OrganizationRoleMixin as Mixin,
  RoleMixin as Mixin];
