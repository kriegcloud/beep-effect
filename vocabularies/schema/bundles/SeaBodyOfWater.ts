import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { SeaBodyOfWaterMixin } from '../lib/SeaBodyOfWater.js';

export const SeaBodyOfWaterBundle = [
  BodyOfWaterMixin as Mixin,
  SeaBodyOfWaterMixin as Mixin];
