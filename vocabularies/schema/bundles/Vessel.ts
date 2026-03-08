import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { VesselMixin } from '../lib/Vessel.js';

export const VesselBundle = [
  AnatomicalStructureMixin as Mixin,
  VesselMixin as Mixin];
