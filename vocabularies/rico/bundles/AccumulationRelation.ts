import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccumulationRelationMixin } from '../lib/AccumulationRelation.js';
import { OrganicProvenanceRelationMixin } from '../lib/OrganicProvenanceRelation.js';

export const AccumulationRelationBundle = [
  AccumulationRelationMixin as Mixin,
  OrganicProvenanceRelationMixin as Mixin];
