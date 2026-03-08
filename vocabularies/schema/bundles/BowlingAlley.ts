import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BowlingAlleyMixin } from '../lib/BowlingAlley.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const BowlingAlleyBundle = [
  BowlingAlleyMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
