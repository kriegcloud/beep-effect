import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CoordinatesMixin } from '../lib/Coordinates.js';
import { PhysicalLocationMixin } from '../lib/PhysicalLocation.js';
import { ThingMixin } from '../lib/Thing.js';

export const CoordinatesBundle = [
  CoordinatesMixin as Mixin,
  PhysicalLocationMixin as Mixin,
  ThingMixin as Mixin];
