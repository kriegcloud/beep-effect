import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArriveMixin } from '../lib/Arrive.js';
import { IntransitiveActivityMixin } from '../lib/IntransitiveActivity.js';

export const ArriveBundle = [
  ArriveMixin as Mixin,
  IntransitiveActivityMixin as Mixin];
