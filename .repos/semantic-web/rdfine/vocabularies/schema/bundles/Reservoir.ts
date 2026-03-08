import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { ReservoirMixin } from '../lib/Reservoir.js';

export const ReservoirBundle = [
  BodyOfWaterMixin as Mixin,
  ReservoirMixin as Mixin];
