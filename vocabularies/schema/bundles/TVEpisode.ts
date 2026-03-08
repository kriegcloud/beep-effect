import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { EpisodeMixin } from '../lib/Episode.js';
import { LanguageMixin } from '../lib/Language.js';
import { TVEpisodeMixin } from '../lib/TVEpisode.js';
import { TVSeriesMixin } from '../lib/TVSeries.js';

export const TVEpisodeBundle = [
  CountryMixin as Mixin,
  EpisodeMixin as Mixin,
  LanguageMixin as Mixin,
  TVEpisodeMixin as Mixin,
  TVSeriesMixin as Mixin];
