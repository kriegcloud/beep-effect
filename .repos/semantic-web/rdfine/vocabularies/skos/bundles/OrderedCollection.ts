import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { OrderedCollectionMixin } from '../lib/OrderedCollection.js';

export const OrderedCollectionBundle = [
  CollectionMixin as Mixin,
  OrderedCollectionMixin as Mixin];
