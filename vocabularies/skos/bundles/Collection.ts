import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { ConceptMixin } from '../lib/Concept.js';

export const CollectionBundle = [
  CollectionMixin as Mixin,
  ConceptMixin as Mixin];
