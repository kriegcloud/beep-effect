import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { PlaceMixin } from '../lib/Place.js';

export const CivicStructureBundle = [
  CivicStructureMixin as Mixin,
  PlaceMixin as Mixin];
