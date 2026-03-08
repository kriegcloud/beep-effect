import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BreadcrumbListMixin } from '../lib/BreadcrumbList.js';
import { ItemListMixin } from '../lib/ItemList.js';

export const BreadcrumbListBundle = [
  BreadcrumbListMixin as Mixin,
  ItemListMixin as Mixin];
