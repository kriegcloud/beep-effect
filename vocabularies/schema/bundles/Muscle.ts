import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { MuscleMixin } from '../lib/Muscle.js';
import { NerveMixin } from '../lib/Nerve.js';
import { VesselMixin } from '../lib/Vessel.js';

export const MuscleBundle = [
  AnatomicalStructureMixin as Mixin,
  MuscleMixin as Mixin,
  NerveMixin as Mixin,
  VesselMixin as Mixin];
