import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { SeriesMixin } from '../lib/Series.js';

export const SeriesBundle = [
  IntangibleMixin as Mixin,
  SeriesMixin as Mixin];
