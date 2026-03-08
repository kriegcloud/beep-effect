import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganicOrFunctionalProvenanceRelationMixin } from '../lib/OrganicOrFunctionalProvenanceRelation.js';
import { RelationMixin } from '../lib/Relation.js';

export const OrganicOrFunctionalProvenanceRelationBundle = [
  OrganicOrFunctionalProvenanceRelationMixin as Mixin,
  RelationMixin as Mixin];
