import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EpisodeMixin } from '../lib/Episode.js';
import { RadioEpisodeMixin } from '../lib/RadioEpisode.js';

export const RadioEpisodeBundle = [
  EpisodeMixin as Mixin,
  RadioEpisodeMixin as Mixin];
