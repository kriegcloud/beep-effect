import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const CollectionBundle = [
  CollectionMixin as Mixin,
  CreativeWorkMixin as Mixin];
