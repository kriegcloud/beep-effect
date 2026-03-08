import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AuthorityRelationMixin } from '../lib/AuthorityRelation.js';
import { OwnershipRelationMixin } from '../lib/OwnershipRelation.js';

export const OwnershipRelationBundle = [
  AuthorityRelationMixin as Mixin,
  OwnershipRelationMixin as Mixin];
