import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BookStoreMixin } from '../lib/BookStore.js';
import { StoreMixin } from '../lib/Store.js';

export const BookStoreBundle = [
  BookStoreMixin as Mixin,
  StoreMixin as Mixin];
