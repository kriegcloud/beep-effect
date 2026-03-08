import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BodyOfWaterMixin } from '../lib/BodyOfWater.js';
import { CanalMixin } from '../lib/Canal.js';

export const CanalBundle = [
  BodyOfWaterMixin as Mixin,
  CanalMixin as Mixin];
