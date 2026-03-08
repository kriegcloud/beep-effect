import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';
import { TennisComplexMixin } from '../lib/TennisComplex.js';

export const TennisComplexBundle = [
  SportsActivityLocationMixin as Mixin,
  TennisComplexMixin as Mixin];
