import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { RoleMixin } from '../lib/Role.js';

export const RoleBundle = [
  IntangibleMixin as Mixin,
  RoleMixin as Mixin];
