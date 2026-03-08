import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { LigamentMixin } from '../lib/Ligament.js';

export const LigamentBundle = [
  AnatomicalStructureMixin as Mixin,
  LigamentMixin as Mixin];
