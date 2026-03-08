import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { BrainStructureMixin } from '../lib/BrainStructure.js';

export const BrainStructureBundle = [
  AnatomicalStructureMixin as Mixin,
  BrainStructureMixin as Mixin];
