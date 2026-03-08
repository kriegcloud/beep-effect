import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkSeasonMixin } from '../lib/CreativeWorkSeason.js';
import { RadioSeasonMixin } from '../lib/RadioSeason.js';

export const RadioSeasonBundle = [
  CreativeWorkSeasonMixin as Mixin,
  RadioSeasonMixin as Mixin];
