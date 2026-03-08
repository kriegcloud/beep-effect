import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AuthorshipRelationMixin } from '../lib/AuthorshipRelation.js';
import { CreationRelationMixin } from '../lib/CreationRelation.js';

export const AuthorshipRelationBundle = [
  AuthorshipRelationMixin as Mixin,
  CreationRelationMixin as Mixin];
