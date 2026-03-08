import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { CategoryCodeSetMixin } from '../lib/CategoryCodeSet.js';

export const CategoryCodeBundle = [
  CategoryCodeMixin as Mixin,
  CategoryCodeSetMixin as Mixin];
