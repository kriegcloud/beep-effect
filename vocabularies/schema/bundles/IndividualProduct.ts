import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IndividualProductMixin } from '../lib/IndividualProduct.js';
import { ProductMixin } from '../lib/Product.js';

export const IndividualProductBundle = [
  IndividualProductMixin as Mixin,
  ProductMixin as Mixin];
