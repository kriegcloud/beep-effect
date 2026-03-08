import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NameMixin } from '../lib/Name.js';
import { PlaceMixin } from '../lib/Place.js';
import { PlaceNameMixin } from '../lib/PlaceName.js';

export const PlaceNameBundle = [
  NameMixin as Mixin,
  PlaceMixin as Mixin,
  PlaceNameMixin as Mixin];
