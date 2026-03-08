import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { OceanBodyOfWaterMixin } from '../lib/OceanBodyOfWater.js';

export const OceanBodyOfWaterBundle = [
  BodyOfWaterMixin as Mixin,
  OceanBodyOfWaterMixin as Mixin];
