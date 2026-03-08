import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreationRelationMixin } from '../lib/CreationRelation.js';
import { OrganicProvenanceRelationMixin } from '../lib/OrganicProvenanceRelation.js';
import { RoleTypeMixin } from '../lib/RoleType.js';

export const CreationRelationBundle = [
  CreationRelationMixin as Mixin,
  OrganicProvenanceRelationMixin as Mixin,
  RoleTypeMixin as Mixin];
