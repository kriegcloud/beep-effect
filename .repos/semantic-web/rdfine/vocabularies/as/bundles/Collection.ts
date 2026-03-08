import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { CollectionPageMixin } from '../lib/CollectionPage.js';
import { LinkMixin } from '../lib/Link.js';
import { ObjectMixin } from '../lib/Object.js';
import { OrderedItemsMixin } from '../lib/OrderedItems.js';

export const CollectionBundle = [
  CollectionMixin as Mixin,
  CollectionPageMixin as Mixin,
  LinkMixin as Mixin,
  ObjectMixin as Mixin,
  OrderedItemsMixin as Mixin];
