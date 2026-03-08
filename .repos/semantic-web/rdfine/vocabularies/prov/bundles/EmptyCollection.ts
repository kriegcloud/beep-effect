import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { EmptyCollectionMixin } from '../lib/EmptyCollection.js';

export const EmptyCollectionBundle = [
  CollectionMixin as Mixin,
  EmptyCollectionMixin as Mixin];
