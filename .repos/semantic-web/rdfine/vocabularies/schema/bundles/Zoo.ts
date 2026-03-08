import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { ZooMixin } from '../lib/Zoo.js';

export const ZooBundle = [
  CivicStructureMixin as Mixin,
  ZooMixin as Mixin];
