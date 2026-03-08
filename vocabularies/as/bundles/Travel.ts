import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntransitiveActivityMixin } from '../lib/IntransitiveActivity.js';
import { TravelMixin } from '../lib/Travel.js';

export const TravelBundle = [
  IntransitiveActivityMixin as Mixin,
  TravelMixin as Mixin];
