import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { StatisticalPopulationMixin } from '../lib/StatisticalPopulation.js';

export const StatisticalPopulationBundle = [
  IntangibleMixin as Mixin,
  StatisticalPopulationMixin as Mixin];
