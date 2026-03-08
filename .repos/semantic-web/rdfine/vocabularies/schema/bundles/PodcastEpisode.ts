import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EpisodeMixin } from '../lib/Episode.js';
import { PodcastEpisodeMixin } from '../lib/PodcastEpisode.js';

export const PodcastEpisodeBundle = [
  EpisodeMixin as Mixin,
  PodcastEpisodeMixin as Mixin];
