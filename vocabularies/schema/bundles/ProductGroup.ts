import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProductGroupMixin } from '../lib/ProductGroup.js';
import { ProductMixin } from '../lib/Product.js';

export const ProductGroupBundle = [
  ProductGroupMixin as Mixin,
  ProductMixin as Mixin];
