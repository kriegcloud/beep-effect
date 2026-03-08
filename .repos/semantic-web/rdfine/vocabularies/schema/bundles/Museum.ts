import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { MuseumMixin } from '../lib/Museum.js';

export const MuseumBundle = [
  CivicStructureMixin as Mixin,
  MuseumMixin as Mixin];
