import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { CategoryCodeSetMixin } from '../lib/CategoryCodeSet.js';
import { DefinedTermSetMixin } from '../lib/DefinedTermSet.js';

export const CategoryCodeSetBundle = [
  CategoryCodeMixin as Mixin,
  CategoryCodeSetMixin as Mixin,
  DefinedTermSetMixin as Mixin];
