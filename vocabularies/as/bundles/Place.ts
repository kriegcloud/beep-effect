import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { PlaceMixin } from '../lib/Place.js';

export const PlaceBundle = [
  ObjectMixin as Mixin,
  PlaceMixin as Mixin];
