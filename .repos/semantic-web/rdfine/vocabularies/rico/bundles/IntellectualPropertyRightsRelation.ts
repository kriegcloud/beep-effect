import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AuthorityRelationMixin } from '../lib/AuthorityRelation.js';
import { IntellectualPropertyRightsRelationMixin } from '../lib/IntellectualPropertyRightsRelation.js';

export const IntellectualPropertyRightsRelationBundle = [
  AuthorityRelationMixin as Mixin,
  IntellectualPropertyRightsRelationMixin as Mixin];
