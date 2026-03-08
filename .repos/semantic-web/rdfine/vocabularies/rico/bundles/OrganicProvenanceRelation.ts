import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganicOrFunctionalProvenanceRelationMixin } from '../lib/OrganicOrFunctionalProvenanceRelation.js';
import { OrganicProvenanceRelationMixin } from '../lib/OrganicProvenanceRelation.js';

export const OrganicProvenanceRelationBundle = [
  OrganicOrFunctionalProvenanceRelationMixin as Mixin,
  OrganicProvenanceRelationMixin as Mixin];
