import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CountryMixin } from '../lib/Country.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { TVSeasonMixin } from '../lib/TVSeason.js';
import { TVSeriesMixin } from '../lib/TVSeries.js';

export const TVSeasonBundle = [
  CountryMixin as Mixin,
  CreativeWorkMixin as Mixin,
  CreativeWorkSeasonMixin as Mixin,
  TVSeasonMixin as Mixin,
  TVSeriesMixin as Mixin];
