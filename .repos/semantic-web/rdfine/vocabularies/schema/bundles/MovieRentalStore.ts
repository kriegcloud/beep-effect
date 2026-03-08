import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MovieRentalStoreMixin } from '../lib/MovieRentalStore.js';
import { StoreMixin } from '../lib/Store.js';

export const MovieRentalStoreBundle = [
  MovieRentalStoreMixin as Mixin,
  StoreMixin as Mixin];
