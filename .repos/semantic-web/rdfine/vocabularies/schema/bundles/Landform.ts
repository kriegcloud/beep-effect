import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LandformMixin } from '../lib/Landform.js';
import { PlaceMixin } from '../lib/Place.js';

export const LandformBundle = [
  LandformMixin as Mixin,
  PlaceMixin as Mixin];
