import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { AnatomicalSystemMixin } from '../lib/AnatomicalSystem.js';
import { VeinMixin } from '../lib/Vein.js';
import { VesselMixin } from '../lib/Vessel.js';

export const VeinBundle = [
  AnatomicalStructureMixin as Mixin,
  AnatomicalSystemMixin as Mixin,
  VeinMixin as Mixin,
  VesselMixin as Mixin];
