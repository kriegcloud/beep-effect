import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProductMixin } from '../lib/Product.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { SomeProductsMixin } from '../lib/SomeProducts.js';

export const SomeProductsBundle = [
  ProductMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  SomeProductsMixin as Mixin];
