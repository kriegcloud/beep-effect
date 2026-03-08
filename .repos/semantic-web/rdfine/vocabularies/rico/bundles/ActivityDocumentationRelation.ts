import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityDocumentationRelationMixin } from '../lib/ActivityDocumentationRelation.js';
import { EventRelationMixin } from '../lib/EventRelation.js';
import { OrganicOrFunctionalProvenanceRelationMixin } from '../lib/OrganicOrFunctionalProvenanceRelation.js';

export const ActivityDocumentationRelationBundle = [
  ActivityDocumentationRelationMixin as Mixin,
  EventRelationMixin as Mixin,
  OrganicOrFunctionalProvenanceRelationMixin as Mixin];
