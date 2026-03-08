import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlaceMixin } from '../lib/Place.js';
import { PlaceTypeMixin } from '../lib/PlaceType.js';
import { TypeMixin } from '../lib/Type.js';

export const PlaceTypeBundle = [
  PlaceMixin as Mixin,
  PlaceTypeMixin as Mixin,
  TypeMixin as Mixin];
