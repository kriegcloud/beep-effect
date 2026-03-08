import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { EntityMixin } from '../lib/Entity.js';

export const CollectionBundle = [
  CollectionMixin as Mixin,
  EntityMixin as Mixin];
