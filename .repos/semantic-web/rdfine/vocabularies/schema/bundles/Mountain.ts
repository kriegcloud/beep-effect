import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LandformMixin } from '../lib/Landform.js';
import { MountainMixin } from '../lib/Mountain.js';

export const MountainBundle = [
  LandformMixin as Mixin,
  MountainMixin as Mixin];
