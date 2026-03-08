import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProductMixin } from '../lib/Product.js';
import { ServiceMixin } from '../lib/Service.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';
import { TypeAndQuantityNodeMixin } from '../lib/TypeAndQuantityNode.js';

export const TypeAndQuantityNodeBundle = [
  ProductMixin as Mixin,
  ServiceMixin as Mixin,
  StructuredValueMixin as Mixin,
  TypeAndQuantityNodeMixin as Mixin];
