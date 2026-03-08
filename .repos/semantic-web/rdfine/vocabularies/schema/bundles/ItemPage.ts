import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ItemPageMixin } from '../lib/ItemPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const ItemPageBundle = [
  ItemPageMixin as Mixin,
  WebPageMixin as Mixin];
