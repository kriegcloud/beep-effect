import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { SeriesMixin } from '../lib/Series.js';

export const CreativeWorkSeriesBundle = [
  CreativeWorkMixin as Mixin,
  CreativeWorkSeriesMixin as Mixin,
  SeriesMixin as Mixin];
