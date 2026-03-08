import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { CollectionPageMixin } from '../lib/CollectionPage.js';
import { LinkMixin } from '../lib/Link.js';

export const CollectionPageBundle = [
  CollectionMixin as Mixin,
  CollectionPageMixin as Mixin,
  LinkMixin as Mixin];
