import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { PlaceOfWorshipMixin } from '../lib/PlaceOfWorship.js';

export const PlaceOfWorshipBundle = [
  CivicStructureMixin as Mixin,
  PlaceOfWorshipMixin as Mixin];
