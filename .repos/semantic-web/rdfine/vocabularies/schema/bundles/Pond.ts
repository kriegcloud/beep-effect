import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { PondMixin } from '../lib/Pond.js';

export const PondBundle = [
  BodyOfWaterMixin as Mixin,
  PondMixin as Mixin];
