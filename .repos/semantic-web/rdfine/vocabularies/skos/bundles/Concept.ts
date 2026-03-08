import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConceptMixin } from '../lib/Concept.js';
import { ConceptSchemeMixin } from '../lib/ConceptScheme.js';

export const ConceptBundle = [
  ConceptMixin as Mixin,
  ConceptSchemeMixin as Mixin];
