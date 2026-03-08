import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { LymphaticVesselMixin } from '../lib/LymphaticVessel.js';
import { VesselMixin } from '../lib/Vessel.js';

export const LymphaticVesselBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  LymphaticVesselMixin as Mixin,
  VesselMixin as Mixin];
