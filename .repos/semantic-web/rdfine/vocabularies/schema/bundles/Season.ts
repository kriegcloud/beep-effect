import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { SeasonMixin } from '../lib/Season.js';

export const SeasonBundle = [
  CreativeWorkMixin as Mixin,
  SeasonMixin as Mixin];
