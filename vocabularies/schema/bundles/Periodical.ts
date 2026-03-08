import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkSeriesMixin } from '../lib/CreativeWorkSeries.js';
import { PeriodicalMixin } from '../lib/Periodical.js';

export const PeriodicalBundle = [
  CreativeWorkSeriesMixin as Mixin,
  PeriodicalMixin as Mixin];
