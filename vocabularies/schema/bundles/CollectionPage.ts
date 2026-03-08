import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CollectionPageMixin } from '../lib/CollectionPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const CollectionPageBundle = [
  CollectionPageMixin as Mixin,
  WebPageMixin as Mixin];
