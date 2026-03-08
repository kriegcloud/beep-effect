import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { LakeBodyOfWaterMixin } from '../lib/LakeBodyOfWater.js';

export const LakeBodyOfWaterBundle = [
  BodyOfWaterMixin as Mixin,
  LakeBodyOfWaterMixin as Mixin];
