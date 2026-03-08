import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LandformMixin } from '../lib/Landform.js';
import { VolcanoMixin } from '../lib/Volcano.js';

export const VolcanoBundle = [
  LandformMixin as Mixin,
  VolcanoMixin as Mixin];
