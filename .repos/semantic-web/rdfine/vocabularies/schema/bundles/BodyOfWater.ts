import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { LandformMixin } from '../lib/Landform.js';

export const BodyOfWaterBundle = [
  BodyOfWaterMixin as Mixin,
  LandformMixin as Mixin];
