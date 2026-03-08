import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AuthorityRelationMixin } from '../lib/AuthorityRelation.js';
import { ManagementRelationMixin } from '../lib/ManagementRelation.js';

export const ManagementRelationBundle = [
  AuthorityRelationMixin as Mixin,
  ManagementRelationMixin as Mixin];
