import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PublicSwimmingPoolMixin } from '../lib/PublicSwimmingPool.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const PublicSwimmingPoolBundle = [
  PublicSwimmingPoolMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
