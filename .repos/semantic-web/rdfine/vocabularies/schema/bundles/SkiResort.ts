import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ResortMixin } from '../lib/Resort.js';
import { SkiResortMixin } from '../lib/SkiResort.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const SkiResortBundle = [
  ResortMixin as Mixin,
  SkiResortMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
