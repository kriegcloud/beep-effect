import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionPageMixin } from '../lib/CollectionPage.js';
import { OrderedCollectionMixin } from '../lib/OrderedCollection.js';
import { OrderedCollectionPageMixin } from '../lib/OrderedCollectionPage.js';

export const OrderedCollectionPageBundle = [
  CollectionPageMixin as Mixin,
  OrderedCollectionMixin as Mixin,
  OrderedCollectionPageMixin as Mixin];
