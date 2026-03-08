import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { PodcastSeasonMixin } from '../lib/PodcastSeason.js';

export const PodcastSeasonBundle = [
  CreativeWorkSeasonMixin as Mixin,
  PodcastSeasonMixin as Mixin];
