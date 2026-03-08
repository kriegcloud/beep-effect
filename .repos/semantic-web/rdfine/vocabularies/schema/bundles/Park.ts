import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { ParkMixin } from '../lib/Park.js';

export const ParkBundle = [
  CivicStructureMixin as Mixin,
  ParkMixin as Mixin];
