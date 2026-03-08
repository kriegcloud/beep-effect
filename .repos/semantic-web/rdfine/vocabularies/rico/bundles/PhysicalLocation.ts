import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CoordinatesMixin } from '../lib/Coordinates.js';
import { PhysicalLocationMixin } from '../lib/PhysicalLocation.js';
import { PlaceMixin } from '../lib/Place.js';
import { ThingMixin } from '../lib/Thing.js';

export const PhysicalLocationBundle = [
  CoordinatesMixin as Mixin,
  PhysicalLocationMixin as Mixin,
  PlaceMixin as Mixin,
  ThingMixin as Mixin];
