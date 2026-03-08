import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComicSeriesMixin } from '../lib/ComicSeries.js';
import { PeriodicalMixin } from '../lib/Periodical.js';

export const ComicSeriesBundle = [
  ComicSeriesMixin as Mixin,
  PeriodicalMixin as Mixin];
