import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AuthorityRelationMixin } from '../lib/AuthorityRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const AuthorityRelationBundle = [
  AuthorityRelationMixin as Mixin,
  RelationMixin as Mixin];
