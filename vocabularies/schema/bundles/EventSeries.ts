import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { EventSeriesMixin } from '../lib/EventSeries.js';
import { SeriesMixin } from '../lib/Series.js';

export const EventSeriesBundle = [
  EventMixin as Mixin,
  EventSeriesMixin as Mixin,
  SeriesMixin as Mixin];
