import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PerformanceRoleMixin } from '../lib/PerformanceRole.js';
import { RoleMixin } from '../lib/Role.js';

export const PerformanceRoleBundle = [
  PerformanceRoleMixin as Mixin,
  RoleMixin as Mixin];
