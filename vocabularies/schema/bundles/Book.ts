import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BookMixin } from '../lib/Book.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { PersonMixin } from '../lib/Person.js';

export const BookBundle = [
  BookMixin as Mixin,
  CreativeWorkMixin as Mixin,
  PersonMixin as Mixin];
