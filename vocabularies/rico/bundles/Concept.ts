import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConceptMixin } from '../lib/Concept.js';
import { ThingMixin } from '../lib/Thing.js';

export const ConceptBundle = [
  ConceptMixin as Mixin,
  ThingMixin as Mixin];
