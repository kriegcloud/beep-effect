import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionMixin } from '../lib/Collection.js';
import { ProductCollectionMixin } from '../lib/ProductCollection.js';
import { ProductMixin } from '../lib/Product.js';
import { TypeAndQuantityNodeMixin } from '../lib/TypeAndQuantityNode.js';

export const ProductCollectionBundle = [
  CollectionMixin as Mixin,
  ProductCollectionMixin as Mixin,
  ProductMixin as Mixin,
  TypeAndQuantityNodeMixin as Mixin];
