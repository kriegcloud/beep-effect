import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { BrainStructureMixin } from '../lib/BrainStructure.js';
import { MuscleMixin } from '../lib/Muscle.js';
import { NerveMixin } from '../lib/Nerve.js';
import { SuperficialAnatomyMixin } from '../lib/SuperficialAnatomy.js';

export const NerveBundle = [
  AnatomicalStructureMixin as Mixin,
  BrainStructureMixin as Mixin,
  MuscleMixin as Mixin,
  NerveMixin as Mixin,
  SuperficialAnatomyMixin as Mixin];
