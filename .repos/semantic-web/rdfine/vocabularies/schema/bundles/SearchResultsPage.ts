import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SearchResultsPageMixin } from '../lib/SearchResultsPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const SearchResultsPageBundle = [
  SearchResultsPageMixin as Mixin,
  WebPageMixin as Mixin];
