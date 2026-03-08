import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { PerformingArtsTheaterMixin } from '../lib/PerformingArtsTheater.js';

export const PerformingArtsTheaterBundle = [
  CivicStructureMixin as Mixin,
  PerformingArtsTheaterMixin as Mixin];
