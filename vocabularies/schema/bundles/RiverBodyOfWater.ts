import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { RiverBodyOfWaterMixin } from '../lib/RiverBodyOfWater.js';

export const RiverBodyOfWaterBundle = [
  BodyOfWaterMixin as Mixin,
  RiverBodyOfWaterMixin as Mixin];
