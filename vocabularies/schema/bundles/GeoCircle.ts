import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DistanceMixin } from '../lib/Distance.js';
import { GeoCircleMixin } from '../lib/GeoCircle.js';
import { GeoCoordinatesMixin } from '../lib/GeoCoordinates.js';
import { GeoShapeMixin } from '../lib/GeoShape.js';

export const GeoCircleBundle = [
  DistanceMixin as Mixin,
  GeoCircleMixin as Mixin,
  GeoCoordinatesMixin as Mixin,
  GeoShapeMixin as Mixin];
