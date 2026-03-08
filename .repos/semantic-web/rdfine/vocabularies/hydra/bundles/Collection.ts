import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { ResourceMixin } from '../lib/Resource.js';

export const CollectionBundle = [
  CollectionMixin as Mixin,
  ResourceMixin as Mixin];
