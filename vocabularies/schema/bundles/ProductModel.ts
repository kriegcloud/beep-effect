import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProductGroupMixin } from '../lib/ProductGroup.js';
import { ProductMixin } from '../lib/Product.js';
import { ProductModelMixin } from '../lib/ProductModel.js';

export const ProductModelBundle = [
  ProductGroupMixin as Mixin,
  ProductMixin as Mixin,
  ProductModelMixin as Mixin];
