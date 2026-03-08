import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NewspaperMixin } from '../lib/Newspaper.js';
import { PeriodicalMixin } from '../lib/Periodical.js';

export const NewspaperBundle = [
  NewspaperMixin as Mixin,
  PeriodicalMixin as Mixin];
