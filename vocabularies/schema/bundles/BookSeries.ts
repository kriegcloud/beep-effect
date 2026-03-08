import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BookSeriesMixin } from '../lib/BookSeries.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';

export const BookSeriesBundle = [
  BookSeriesMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin];
