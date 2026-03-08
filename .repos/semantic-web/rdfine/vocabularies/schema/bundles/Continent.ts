import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContinentMixin } from '../lib/Continent.js';
import { LandformMixin } from '../lib/Landform.js';

export const ContinentBundle = [
  ContinentMixin as Mixin,
  LandformMixin as Mixin];
