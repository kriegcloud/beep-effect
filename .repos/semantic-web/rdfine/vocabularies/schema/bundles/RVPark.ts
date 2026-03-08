import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { RVParkMixin } from '../lib/RVPark.js';

export const RVParkBundle = [
  CivicStructureMixin as Mixin,
  RVParkMixin as Mixin];
