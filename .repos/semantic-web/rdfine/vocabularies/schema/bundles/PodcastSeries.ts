import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { DataFeedMixin } from '../lib/DataFeed.js';
import { PersonMixin } from '../lib/Person.js';
import { PodcastSeriesMixin } from '../lib/PodcastSeries.js';

export const PodcastSeriesBundle = [
  CreativeWorkSeriesMixin as Mixin,
  DataFeedMixin as Mixin,
  PersonMixin as Mixin,
  PodcastSeriesMixin as Mixin];
