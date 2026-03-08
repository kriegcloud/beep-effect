import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ItemListMixin } from '../lib/ItemList.js';
import { OfferCatalogMixin } from '../lib/OfferCatalog.js';

export const OfferCatalogBundle = [
  ItemListMixin as Mixin,
  OfferCatalogMixin as Mixin];
