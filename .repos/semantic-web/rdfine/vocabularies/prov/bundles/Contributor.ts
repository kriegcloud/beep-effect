import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContributorMixin } from '../lib/Contributor.js';
import { RoleMixin } from '../lib/Role.js';

export const ContributorBundle = [
  ContributorMixin as Mixin,
  RoleMixin as Mixin];
