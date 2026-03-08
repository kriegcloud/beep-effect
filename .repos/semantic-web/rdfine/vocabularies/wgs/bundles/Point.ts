import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PointMixin } from '../lib/Point.js';
import { SpatialThingMixin } from '../lib/SpatialThing.js';

export const PointBundle = [
  PointMixin as Mixin,
  SpatialThingMixin as Mixin];
